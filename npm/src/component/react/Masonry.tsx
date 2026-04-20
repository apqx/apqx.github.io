import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
    type ReactNode,
} from "react"

export interface MasonryBreakpoint {
    maxWidth: number
    columns: number
}

export interface MasonryProps<T> {
    items: readonly T[]
    renderItem: (item: T, index: number) => ReactNode
    getItemKey: (item: T, index: number) => string | number
    defaultColumns?: number
    breakpoints?: readonly MasonryBreakpoint[]
    estimatedItemHeight?: number
    columnGap?: CSSProperties["gap"]
    rowGap?: CSSProperties["gap"]
    // 是否监听 item 尺寸变化，判断是否需要重排
    observeItemResize?: boolean
    // 是否在 item 组件挂载时测量，开启后可以在初始布局阶段使用真实的 item 尺寸
    measureItemOnMount?: boolean
    className?: string
    style?: CSSProperties
}

const DEFAULT_COLUMNS = 4
const DEFAULT_ESTIMATED_HEIGHT = 240
const HEIGHT_CHANGE_THRESHOLD = 1

/**
 * render 阶段，所有元素都是预估高度
 * ref 阶段，测量元素的实际高度，更新 itemHeightsRef
 * effect 阶段，监听 container 宽度变化和 item 高度变化，更新布局
 */
export function Masonry<T>({
    items,
    renderItem,
    getItemKey,
    defaultColumns = DEFAULT_COLUMNS,
    breakpoints,
    estimatedItemHeight = DEFAULT_ESTIMATED_HEIGHT,
    columnGap = 16,
    rowGap = 16,
    observeItemResize = false,
    measureItemOnMount = true,
    className,
    style,
}: MasonryProps<T>) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const layoutRafRef = useRef<number | null>(null)

    // 存储每个元素的 DOM 节点，以 key 作为 id
    const itemNodesRef = useRef(new Map<string, HTMLDivElement>())
    // 存储每个 item 的高度，key 为 getItemKey 返回的值
    // 元素未加载时这里没有数据，使用 estimatedItemHeight 预估高度，加载后才能获得实际高度
    const itemHeightsRef = useRef(new Map<string, number>())
    const itemResizeObserverRef = useRef<ResizeObserver | null>(null)

    const [containerWidth, setContainerWidth] = useState(0)
    const [layoutColumns, setLayoutColumns] = useState<number[][]>([])

    const sortedBreakpoints = useMemo(
        () => [...(breakpoints ?? [])].sort((a, b) => a.maxWidth - b.maxWidth),
        [breakpoints],
    )

    const columnCount = useMemo(() => {
        if (containerWidth <= 0 || sortedBreakpoints.length === 0) {
            return Math.max(1, defaultColumns)
        }

        for (const breakpoint of sortedBreakpoints) {
            if (containerWidth <= breakpoint.maxWidth) {
                return Math.max(1, breakpoint.columns)
            }
        }

        return Math.max(1, defaultColumns)
    }, [containerWidth, defaultColumns, sortedBreakpoints])

    const itemKeys = useMemo(
        () => items.map((item, index) => String(getItemKey(item, index))),
        [items, getItemKey],
    )

    /**
     * 遍历所有元素，计算每个元素应该放在哪一列，返回一个二维数组，每个子数组代表一列，存储对应列中元素的 index
     * 原则是放到最矮的列，但也要和上次布局时所在的列比较，如果相差不大就保持在那一列，避免布局跳动
     */
    const computeLayoutColumns = useCallback((previousColumns?: number[][]): number[][] => {
        const nextColumns = Array.from({ length: columnCount }, () => [] as number[])
        // 记录每一列的高度，遍历元素时累加
        const columnHeights = Array.from({ length: columnCount }, () => 0)
        // 记录上一次布局中每个元素所在的列
        const previousColumnByItemIndex = new Map<number, number>()
        // 每个 column 都是一个数组，存储对应 column 中 item 的 index

        if (previousColumns) {
            for (let columnIndex = 0; columnIndex < previousColumns.length; columnIndex += 1) {
                const column = previousColumns[columnIndex]
                for (const itemIndex of column) {
                    previousColumnByItemIndex.set(itemIndex, columnIndex)
                }
            }
        }

        const stickyThreshold = Math.max(24, estimatedItemHeight * 0.2)
        // 计算每一个元素应该放在哪一列，从头遍历，累加每一列的高度，放在最矮的列，达到基本的平衡效果
        for (let index = 0; index < itemKeys.length; index += 1) {
            const key = itemKeys[index]
            // 如果没有测量到高度，或者高度变化不大，就使用预估高度，避免频繁重排
            const currentHeight = itemHeightsRef.current.get(key) ?? estimatedItemHeight

            let targetColumn = 0
            let minHeight = columnHeights[0] ?? 0
            // 找到高度最小的列
            for (let columnIndex = 1; columnIndex < columnHeights.length; columnIndex += 1) {
                const columnHeight = columnHeights[columnIndex]
                if (columnHeight < minHeight) {
                    minHeight = columnHeight
                    targetColumn = columnIndex
                }
            }
            // 该元素在上次布局中所在的 column，如果该 column 的高度不高于当前最矮的 column 太多（stickyThreshold）
            // 就继续放在该 column，保持布局稳定，避免元素频繁跳动
            const preferredColumn = previousColumnByItemIndex.get(index)
            if (preferredColumn !== undefined && preferredColumn < columnCount) {
                const preferredHeight = columnHeights[preferredColumn]
                if (preferredHeight <= minHeight + stickyThreshold) {
                    targetColumn = preferredColumn
                    minHeight = preferredHeight
                }
            }

            // 将元素放在 targetColumn 列，并累加高度
            nextColumns[targetColumn].push(index)
            columnHeights[targetColumn] += currentHeight
        }

        return nextColumns
    }, [columnCount, estimatedItemHeight, itemKeys])

    /**
     * 延期重新计算布局，短时间内触发的多次调用会合并为一次，避免重复计算布局带来的性能问题
     */
    const scheduleRelayout = useCallback(() => {
        if (layoutRafRef.current !== null) {
            window.cancelAnimationFrame(layoutRafRef.current)
            layoutRafRef.current = null
        }

        layoutRafRef.current = window.requestAnimationFrame(() => {
            layoutRafRef.current = null
            setLayoutColumns(prevColumns => {
                // 重新计算布局，如果和上次布局结果相同就复用
                const nextColumns = computeLayoutColumns(prevColumns)
                if (isLayoutColumnsEqual(prevColumns, nextColumns)) {
                    return prevColumns
                }
                return nextColumns
            })
        })
    }, [computeLayoutColumns])

    const setItemNode = useCallback(
        (key: string, node: HTMLDivElement | null) => {
            const previousNode = itemNodesRef.current.get(key)
            if (previousNode === node) {
                return
            }

            if (previousNode) {
                if (observeItemResize) {
                    itemResizeObserverRef.current?.unobserve(previousNode)
                }
                itemNodesRef.current.delete(key)
            }

            if (!node) {
                return
            }

            itemNodesRef.current.set(key, node)
            if (observeItemResize) {
                itemResizeObserverRef.current?.observe(node)
            }

            if (measureItemOnMount) {
                // 获取元素挂载后的实际高度，和之前记录的高度对比，如果变化较大就触发重排
                const nextHeight = node.getBoundingClientRect().height
                const previousHeight = itemHeightsRef.current.get(key)
                if (
                    previousHeight === undefined ||
                    Math.abs(previousHeight - nextHeight) > HEIGHT_CHANGE_THRESHOLD
                ) {
                    // 保存测量到的高度
                    itemHeightsRef.current.set(key, nextHeight)
                    scheduleRelayout()
                }
            }
        },
        [measureItemOnMount, observeItemResize, scheduleRelayout],
    )

    useEffect(() => {
        const container = containerRef.current
        if (!container) {
            return
        }

        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const width = entry.contentRect.width
                setContainerWidth(previousWidth => {
                    if (Math.abs(previousWidth - width) < HEIGHT_CHANGE_THRESHOLD) {
                        return previousWidth
                    }
                    return width
                })
            }
        })

        resizeObserver.observe(container)
        return () => {
            resizeObserver.disconnect()
        }
    }, [])

    useEffect(() => {
        if (!observeItemResize) {
            itemResizeObserverRef.current?.disconnect()
            itemResizeObserverRef.current = null
            return
        }

        const resizeObserver = new ResizeObserver(entries => {
            let hasAnyHeightChanged = false
            for (const entry of entries) {
                const node = entry.target as HTMLDivElement
                const key = node.dataset.masonryKey
                if (!key) {
                    continue
                }

                const measuredHeight = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height
                const previousHeight = itemHeightsRef.current.get(key)

                if (
                    previousHeight === undefined ||
                    Math.abs(previousHeight - measuredHeight) > HEIGHT_CHANGE_THRESHOLD
                ) {
                    itemHeightsRef.current.set(key, measuredHeight)
                    hasAnyHeightChanged = true
                }
            }

            if (hasAnyHeightChanged) {
                scheduleRelayout()
            }
        })

        itemResizeObserverRef.current = resizeObserver

        for (const node of itemNodesRef.current.values()) {
            resizeObserver.observe(node)
        }

        return () => {
            resizeObserver.disconnect()
            itemResizeObserverRef.current = null
        }
    }, [observeItemResize, scheduleRelayout])

    useEffect(() => {
        const currentKeys = new Set(itemKeys)

        for (const key of itemHeightsRef.current.keys()) {
            if (!currentKeys.has(key)) {
                itemHeightsRef.current.delete(key)
            }
        }

        for (const [key, node] of itemNodesRef.current.entries()) {
            if (!currentKeys.has(key)) {
                itemResizeObserverRef.current?.unobserve(node)
                itemNodesRef.current.delete(key)
            }
        }

        scheduleRelayout()
    }, [itemKeys, scheduleRelayout])

    useEffect(() => {
        if (itemKeys.length !== 0) {
            return
        }

        itemHeightsRef.current.clear()
        for (const node of itemNodesRef.current.values()) {
            itemResizeObserverRef.current?.unobserve(node)
        }
        itemNodesRef.current.clear()
        setLayoutColumns(previousColumns => (previousColumns.length === 0 ? previousColumns : []))
    }, [itemKeys.length])

    useEffect(() => {
        scheduleRelayout()
    }, [columnCount, scheduleRelayout])

    useEffect(() => {
        return () => {
            if (layoutRafRef.current !== null) {
                window.cancelAnimationFrame(layoutRafRef.current)
                layoutRafRef.current = null
            }
        }
    }, [])

    const columnsToRender = useMemo(() => {
        if (itemKeys.length === 0) {
            return [] as number[][]
        }

        if (
            layoutColumns.length === columnCount &&
            !hasInvalidItemIndex(layoutColumns, itemKeys.length)
        ) {
            return layoutColumns
        }

        return computeLayoutColumns(layoutColumns)
    }, [columnCount, computeLayoutColumns, itemKeys.length, layoutColumns])

    return (
        <div
            ref={containerRef}
            className={className}
            style={{
                display: "flex",
                alignItems: "flex-start",
                gap: columnGap,
                ...style,
            }}
        >
            {columnsToRender.map((column, columnIndex) => (
                <div
                    key={columnIndex}
                    style={{
                        display: "flex",
                        flex: 1,
                        flexDirection: "column",
                        minWidth: 0,
                        gap: rowGap,
                    }}
                >
                    {column.map(itemIndex => {
                        const key = itemKeys[itemIndex]
                        const item = items[itemIndex]

                        if (key === undefined || item === undefined) {
                            return null
                        }

                        return (
                            <div
                                key={key}
                                data-masonry-key={key}
                                ref={node => {
                                    setItemNode(key, node)
                                }}
                            >
                                {renderItem(item, itemIndex)}
                            </div>
                        )
                    })}
                </div>
            ))}
        </div>
    )
}

function isLayoutColumnsEqual(previousColumns: number[][], nextColumns: number[][]): boolean {
    if (previousColumns.length !== nextColumns.length) {
        return false
    }

    for (let columnIndex = 0; columnIndex < previousColumns.length; columnIndex += 1) {
        const previousColumn = previousColumns[columnIndex]
        const nextColumn = nextColumns[columnIndex]

        if (previousColumn.length !== nextColumn.length) {
            return false
        }

        for (let itemIndex = 0; itemIndex < previousColumn.length; itemIndex += 1) {
            if (previousColumn[itemIndex] !== nextColumn[itemIndex]) {
                return false
            }
        }
    }

    return true
}

function hasInvalidItemIndex(columns: number[][], itemCount: number): boolean {
    for (const column of columns) {
        for (const itemIndex of column) {
            if (itemIndex < 0 || itemIndex >= itemCount) {
                return true
            }
        }
    }

    return false
}

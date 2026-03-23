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
    observeItemResize?: boolean
    measureItemOnMount?: boolean
    measureOnLayoutVersion?: boolean
    layoutVersion?: string | number
    className?: string
    style?: CSSProperties
}

const DEFAULT_COLUMNS = 4
const DEFAULT_ESTIMATED_HEIGHT = 240
const HEIGHT_CHANGE_THRESHOLD = 1

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
    measureOnLayoutVersion = false,
    layoutVersion,
    className,
    style,
}: MasonryProps<T>) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const layoutRafRef = useRef<number | null>(null)

    const itemNodesRef = useRef(new Map<string, HTMLDivElement>())
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

    const computeLayoutColumns = useCallback((previousColumns?: number[][]): number[][] => {
        const nextColumns = Array.from({ length: columnCount }, () => [] as number[])
        const columnHeights = Array.from({ length: columnCount }, () => 0)
        const previousColumnByItemIndex = new Map<number, number>()

        if (previousColumns) {
            for (let columnIndex = 0; columnIndex < previousColumns.length; columnIndex += 1) {
                const column = previousColumns[columnIndex]
                for (const itemIndex of column) {
                    previousColumnByItemIndex.set(itemIndex, columnIndex)
                }
            }
        }

        const stickyThreshold = Math.max(24, estimatedItemHeight * 0.2)

        for (let index = 0; index < itemKeys.length; index += 1) {
            const key = itemKeys[index]
            const currentHeight = itemHeightsRef.current.get(key) ?? estimatedItemHeight

            let targetColumn = 0
            let minHeight = columnHeights[0] ?? 0
            for (let columnIndex = 1; columnIndex < columnHeights.length; columnIndex += 1) {
                const columnHeight = columnHeights[columnIndex]
                if (columnHeight < minHeight) {
                    minHeight = columnHeight
                    targetColumn = columnIndex
                }
            }

            const preferredColumn = previousColumnByItemIndex.get(index)
            if (preferredColumn !== undefined && preferredColumn < columnCount) {
                const preferredHeight = columnHeights[preferredColumn]
                if (preferredHeight <= minHeight + stickyThreshold) {
                    targetColumn = preferredColumn
                    minHeight = preferredHeight
                }
            }

            nextColumns[targetColumn].push(index)
            columnHeights[targetColumn] += currentHeight
        }

        return nextColumns
    }, [columnCount, estimatedItemHeight, itemKeys])

    const scheduleRelayout = useCallback(() => {
        if (layoutRafRef.current !== null) {
            window.cancelAnimationFrame(layoutRafRef.current)
            layoutRafRef.current = null
        }

        layoutRafRef.current = window.requestAnimationFrame(() => {
            layoutRafRef.current = null
            setLayoutColumns(prevColumns => {
                const nextColumns = computeLayoutColumns(prevColumns)
                if (isLayoutColumnsEqual(prevColumns, nextColumns)) {
                    return prevColumns
                }
                return nextColumns
            })
        })
    }, [computeLayoutColumns])

    const measureAllItems = useCallback(() => {
        let hasAnyHeightChanged = false
        for (const [key, node] of itemNodesRef.current.entries()) {
            const measuredHeight = node.getBoundingClientRect().height
            const previousHeight = itemHeightsRef.current.get(key)
            if (
                previousHeight === undefined ||
                Math.abs(previousHeight - measuredHeight) > HEIGHT_CHANGE_THRESHOLD
            ) {
                itemHeightsRef.current.set(key, measuredHeight)
                hasAnyHeightChanged = true
            }
        }

        return hasAnyHeightChanged
    }, [])

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
                const nextHeight = node.getBoundingClientRect().height
                const previousHeight = itemHeightsRef.current.get(key)
                if (
                    previousHeight === undefined ||
                    Math.abs(previousHeight - nextHeight) > HEIGHT_CHANGE_THRESHOLD
                ) {
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
        if (layoutVersion === undefined) {
            return
        }

        if (measureOnLayoutVersion) {
            measureAllItems()
        }
        scheduleRelayout()
    }, [layoutVersion, measureAllItems, measureOnLayoutVersion, scheduleRelayout])

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

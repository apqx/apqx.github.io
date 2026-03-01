import { useEffect, useRef, useState } from "react"
import "./Masonry.scss"
import MiniMasonry from "minimasonry"
import { consoleDebug } from "../../util/log"

export interface MasonryProps {
    // 默认 column 数
    defaultColumnCount: number,
    // 列数变化的触发宽度会对应的 column 数，即 container 小于触发宽度时的 column 数
    // 例如 [[600, 2], [350, 1]]，表示小于 600px 时为 2 列，小于 350px 时为 1 列
    columnConfig?: Array<Array<number>>,
    refreshId?: number,
    children?: React.ReactNode
}

export function Masonry(props: MasonryProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const masonryRef = useRef<MiniMasonry>(null)
    // item 的最小宽度，最大不超过 2 倍，那会再增加 1 个 column
    // baseWidth > triggerWidth / (n + 1), < triggerWidth / n
    // 可以取中间值
    const [baseWidth, setBaseWidth] = useState(0)
    const currentColumnConfig = useRef<Array<number>>([])

    const baseWidthRef = useRef<number>(baseWidth)
    useEffect(() => {
        baseWidthRef.current = baseWidth
    }, [baseWidth])

    useEffect(() => {
        consoleDebug("Masonry useEffect")
        let useBaseWidth = baseWidth
        if (baseWidth == 0) {
            let columnCount = props.defaultColumnCount
            if (props.columnConfig) {
                currentColumnConfig.current = getColumnConfig(props.columnConfig, containerRef.current?.clientWidth ?? 0, props.defaultColumnCount)
                columnCount = currentColumnConfig.current[1]
            }
            useBaseWidth = calculateBaseWidth(columnCount, containerRef.current?.clientWidth ?? 0)
        }
        // baseWidth 变化会导致 masonry 重新初始化
        masonryRef.current = new MiniMasonry({
            container: containerRef.current as HTMLElement,
            baseWidth: useBaseWidth,
            gutter: 0,
            ultimateGutter: 0,
            surroundingGutter: false
        })

        return () => {
            consoleDebug("Masonry useEffect cleanup")
            masonryRef.current?.destroy()
        }
        // 如果锚定 baseWidth，浏览器宽度变化时为保持宽度与列数的配置，会触发 baseWidth 变化，导致 masonry 重新初始化，页面会滚到顶部
        // 如果不锚定 baseWidth，始终是同一个 masonry 实例，浏览器宽度变化更平滑，但失去与参数的匹配
    }, [baseWidth])

    useEffect(() => {
        masonryRef.current?.layout()
    }, [props.refreshId, baseWidth])

    useEffect(() => {
        // 监听容器宽度变化，更新 baseWidth 和 column 配置
        let previousContainerWidth = 0
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const containerWidth = entry.contentRect.width
                if (containerWidth == 0 || containerWidth == previousContainerWidth) {
                    continue
                }
                previousContainerWidth = containerWidth
                if (props.columnConfig) {
                    const newColumnConfig = getColumnConfig(props.columnConfig, containerWidth, props.defaultColumnCount)
                    if (!isConfigEqual(currentColumnConfig.current, newColumnConfig) ||
                        !isBaseWidthValid(baseWidthRef.current, containerWidth, currentColumnConfig.current[1])) {
                        // 触发宽度变化，baseWidth 尺寸越过边界，更新 column 配置和 baseWidth
                        currentColumnConfig.current = newColumnConfig
                        const newBaseWidth = calculateBaseWidth(newColumnConfig[1], containerWidth)
                        setBaseWidth(newBaseWidth)
                    }

                } else if (!isBaseWidthValid(baseWidthRef.current, containerWidth, props.defaultColumnCount)) {
                    // 没有 columnConfig 配置时，容器宽度小于 baseWidth 就更新 baseWidth
                    const newBaseWidth = calculateBaseWidth(props.defaultColumnCount, containerWidth)
                    setBaseWidth(newBaseWidth)
                }
            }
        })
        resizeObserver.observe(containerRef.current as HTMLElement)
        return () => {
            resizeObserver.disconnect()
        }
    }, [])


    return (
        <div ref={containerRef} className="masonry-container">
            {props.children}
        </div>
    )
}

function isBaseWidthValid(baseWidth: number, triggerWidth: number, columnCount: number): boolean {
    let valid = baseWidth > triggerWidth / (columnCount + 1) && baseWidth < triggerWidth / columnCount
    consoleDebug("Masonry checkBaseWidthValid, baseWidth: " + baseWidth + ", triggerWidth: " + triggerWidth + ", columnCount: " + columnCount + ", valid: " + valid)
    return valid
}

function calculateBaseWidth(columnCount: number, containerWidth: number): number {
    const baseWidth = (containerWidth / (columnCount + 1) + containerWidth / columnCount) / 2
    consoleDebug("Masonry calculateBaseWidth, containerWidth: " + containerWidth + ", use columnCount: " + columnCount + ", baseWidth: " + baseWidth)
    return baseWidth
}

function isConfigEqual(config1: Array<number>, config2: Array<number>): boolean {
    return config1[0] == config2[0] && config1[1] == config2[1]
}

/**
 * 获取当前尺寸下匹配的 column 配置
 */
function getColumnConfig(columnConfig: Array<Array<number>>, containerWidth: number, defaultColumnCount: number): Array<number> {
    let currentColumnConfig: Array<number> = [0, defaultColumnCount]
    // 降序排列
    columnConfig.sort((a, b) => b[0] - a[0])
    for (const [triggerWidth, columns] of columnConfig) {
        if (containerWidth < triggerWidth) {
            currentColumnConfig = [triggerWidth, columns]
        }
    }
    consoleDebug("Masonry getColumnConfig: " + currentColumnConfig)
    return currentColumnConfig
}
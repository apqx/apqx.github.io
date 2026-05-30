import "./LottieAnimation.scss"
// 类型保持静态导入，TypeScript 类型在编译后会被完全擦除，不会产生任何运行时 JS 代码，不占用打包体积
import { type LottieRefCurrentProps } from "lottie-react"
import { lazy, Suspense, useEffect, useRef, useState } from "react"
import { consoleErrorObj, consoleInfo } from "../../util/log"

interface LottieProps {
    animationDataUrl: string
    classes?: string[]
    animationControllerRef?: React.RefObject<LottieAnimationController | null>
}

export interface LottieAnimationController {
    play: () => void
    pause: () => void
}

// 组件改为动态导入，减少打包体积，应确保 lottie-react 的 export default 是所需组件
// 注意 lazy 不是 Hook 函数，不缓存数据，所以不能放在组件内部，否则每次渲染都会重新加载组件，导致动画重置和性能问题
// 它会在组件第一次被 React 加载/渲染时执行
const LazyLottie = lazy(() => import("lottie-react"))

/**
 * 懒加载 Lottie 动画组件
 */
export function LottieAnimation(props: LottieProps) {
    const lottieControllerRef = useRef<LottieRefCurrentProps | null>(null)
    const [animationData, setAnimationData] = useState(null)

    useEffect(() => {
        fetch(props.animationDataUrl)
            .then(res => res.json())
            .then(data => {
                setAnimationData(data)
            }).catch(err => {
                consoleErrorObj("Failed to load Lottie animation data:", err)
            })
    }, [props.animationDataUrl])

    useEffect(() => {
        if (props.animationControllerRef) {
            props.animationControllerRef.current = {
                play: () => lottieControllerRef.current?.play(),
                pause: () => lottieControllerRef.current?.pause()
            }
        }
    }, [props.animationControllerRef])

    return (
        <div className={`lottie-container ${props.classes?.join(" ") ?? ""}`.trimEnd()}>
            <Suspense fallback={<div className="lottie-placeholder"></div>}>
                <LazyLottie animationData={animationData} lottieRef={lottieControllerRef} />
            </Suspense>
        </div>
    )
}


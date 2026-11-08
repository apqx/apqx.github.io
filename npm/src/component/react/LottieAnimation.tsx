import "./LottieAnimation.scss"
// 类型保持静态导入，TypeScript 类型在编译后会被完全擦除，不会产生任何运行时 JS 代码，不占用打包体积
import type { LottieHandle } from "lottie-react"
import { lazy, Suspense, useEffect, useMemo, useRef } from "react"
import { consoleErrorObj, consoleInfo } from "../../util/log"
import { DelayToNextFrame } from "../base/DelayToNextFrame"
import { FadeAnimationController } from "../animation/FadeAnimationController"
import type { IAnimationController } from "../animation/IAnimationController"

interface LottieProps {
    loop: boolean
    autoplay: boolean
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
const LazyLottie = lazy(() => import("lottie-react").then(module => ({ default: module.Lottie })))

/**
 * 懒加载 Lottie 动画组件
 */
export function LottieAnimation(props: LottieProps) {
    const lottieWrapperRef = useRef<HTMLDivElement>(null)
    const animationControllerRef = useRef<IAnimationController | null>(null)

    const lottieControllerRef = useRef<LottieHandle | null>(null)
    const delayToNextFrame = useMemo(() => {
        return new DelayToNextFrame()
    }, [])

    useEffect(() => {
        function checkAndPlay() {
            consoleInfo(`LottieAnimation play, controller = ${lottieControllerRef.current}`)
            if (lottieControllerRef.current) {
                lottieControllerRef.current.play()
            } else {
                delayToNextFrame.delay(() => {
                    checkAndPlay()
                })
            }
        }
        if (props.animationControllerRef) {
            props.animationControllerRef.current = {
                play: () => {
                    // 如果 lottie 在 dialog 中，open 事件触发时这里可能还未完成加载
                    // 实测约 3 帧后加载完成
                    checkAndPlay()
                    // lottieControllerRef.current?.play()
                },
                pause: () => {
                    consoleInfo(`LottieAnimation pause, controller = ${lottieControllerRef.current}`)
                    lottieControllerRef.current?.pause()
                }
            }
        }
        return () => {
            delayToNextFrame.cancelPendingFrame()
            if (props.animationControllerRef) {
                props.animationControllerRef.current = null
            }
        }
    }, [props.animationControllerRef, delayToNextFrame])

    const subscription = useMemo(() => {
        return {
            ready: () => {
                consoleInfo("Lottie animation ready : " + props.animationDataUrl)
                if (lottieWrapperRef.current && animationControllerRef.current == null) {
                    animationControllerRef.current = new FadeAnimationController(lottieWrapperRef.current)
                    animationControllerRef.current.toggleOpen(true)
                }
            },
            error: (error: any) => {
                delayToNextFrame.cancelPendingFrame()
                consoleErrorObj("Failed to load Lottie animation:", error.error)
            }
        }
    }, [props.animationDataUrl, delayToNextFrame])

    useEffect(() => {
        return () => {
            if (animationControllerRef.current) {
                animationControllerRef.current.destroy()
            }
        }
    }, [])

    return (
        <div className={`lottie-container ${props.classes?.join(" ") ?? ""}`.trimEnd()}>
            <Suspense fallback={<div className="lottie-placeholder"></div>}>
                <div ref={lottieWrapperRef} className="fade fade--opening fade-preserve-display-none">
                    <LazyLottie
                        loop={props.loop}
                        autoplay={props.autoplay}
                        src={props.animationDataUrl}
                        lottieRef={lottieControllerRef}
                        subscriptions={subscription}
                    />
                </div>
            </Suspense>
        </div>
    )
}


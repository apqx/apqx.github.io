import "./lottie.scss"
import { createRoot } from "react-dom/client"
import { LottieAnimation } from "./react/LottieAnimation"

export function mountLottieAnimation(wrapperE: HTMLElement) {
    const root = createRoot(wrapperE)
    const animationDataUrl = wrapperE.getAttribute("data-animation-url")!!
    root.render(<LottieAnimation animationDataUrl={animationDataUrl} />)
}
// import "./contentCard.scss"

export function initContentCard(startAnimation: boolean) { 
    if (startAnimation) {
        startContentCardAnimation()
    }
}

export function startContentCardAnimation() {
    const cardE = document.querySelector(".content-card.fade-in-animation")
    cardE?.classList.add("fade-in-animation--start")
}

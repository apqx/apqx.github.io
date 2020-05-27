// When the user clicks on the button, scroll to the top of the document
const scrollToTop = () => {
    const c = document.documentElement.scrollTop || document.body.scrollTop;
    if (c > 0) {
        window.requestAnimationFrame(scrollToTop);
        window.scrollTo(0, c - c / 8);
    } else {
        M.toast({html: '🐸'})
    }
};
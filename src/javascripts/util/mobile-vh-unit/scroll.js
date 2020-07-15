// Scroll delta used for debouce.
// Must be larger than time between 'scroll' events, huge lag can create
// a substantial delay between events, eg. in Simulator
const SCROLL_DELTA_TIME = 120;

export default function scrollDetector (startCallback, endCallback) {
    let isObserving = false;
    let lastScrollPosition = null;
    let lastScreenHeight = null;

    function endObserving () {
        isObserving = false;
        endCallback();
    }
    function startObserving () {
        if (!isObserving) {
            lastScrollPosition = $(window).scrollTop();
            isObserving = true;
            setTimeout(update, SCROLL_DELTA_TIME);
            startCallback();
        }
    }
    function update () {
        const scrollPosition = $(window).scrollTop();
        const screenHeight = window.innerHeight;

        if (scrollPosition !== lastScrollPosition || screenHeight !== lastScreenHeight) {
            lastScrollPosition = scrollPosition;
            lastScreenHeight = screenHeight;
            setTimeout(update, SCROLL_DELTA_TIME);
        } else {
            endObserving();
        }
    }

    $(window)
        .offpassive('scroll.mobilevhunit-scroll')
        .onpassive('scroll.mobilevhunit-scroll', startObserving);
}

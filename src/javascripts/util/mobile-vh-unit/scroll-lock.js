export function getScrollPosition () {
    const element = document.elementFromPoint(window.innerWidth / 2, 200);
    const elementBox = element.getBoundingClientRect();

    // Offset must be relative to the height to handle elements possible height change
    const offset = elementBox.top / elementBox.height;

    // Disable smooth scrolling to prevent scroll position animation
    // which will break the illuion
    $('html').css({
        'scroll-behavior': 'initial'
    });

    return {
        element,
        offset
    };
}

export function setScrollPosition (scroll) {
    let   updateTimer = null;
    const resetTimer = setTimeout(() => {
        afterUpdate();

        if (updateTimer) {
            cancelAnimationFrame(updateTimer);
        }
    }, 250);

    function afterUpdate () {
        $('html').css({
            'scroll-behavior': ''
        });
    }

    // Try updating for 250ms
    function update () {
        const elementBox = scroll.element.getBoundingClientRect();
        const scrollDiff = elementBox.top - scroll.offset * elementBox.height;

        if (scrollDiff) {
            clearTimeout(resetTimer);

            const currentScroll = $(window).scrollTop();
            $(window).scrollTop(currentScroll + scrollDiff);
            afterUpdate();
        } else {
            updateTimer = requestAnimationFrame(update);
        }
    }

    update();
}


export default {
    getScrollPosition,
    setScrollPosition
};

/**
 * Detect interial scroll and debounce callback until it's complete
 */

import scrollDetector from './scroll';

// Delay after touchend event before calling callbacks
// Needed to prevent 'touchend' triggering before passive 'scroll' events is
// triggered
const TOUCH_DELTA_TIME = 250;

export function inertiaDetector () {
    let isScrolling = false;
    let isTouch = false;
    // let scrollTimer = null;
    let touchTimer = null;
    let callbacks = [];

    const response = {
        'scrolling': isScrolling,
        'then': function (fn) {
            if (isScrolling || isTouch) {
                if (callbacks[callbacks.length] !== fn) {
                    callbacks.push(fn);
                }
            } else {
                fn();
            }
        },
        'debounce': function (fn) {
            return function () {
                response.then(fn);
            };
        }
    };

    const callCallbacks = function () {
        if (!isTouch && !isScrolling) {

            const stopCallbacks = callbacks;
            callbacks = [];

            for (let i = 0; i < stopCallbacks.length; i++) {
                stopCallbacks[i]();
            }
        }
    };

    const startScroll = function () {
        response.scrolling = isScrolling = true;
    };
    const endScroll = function () {
        isScrolling = false;
        response.scrolling = isScrolling || isTouch;
        callCallbacks();
    };

    const startTouch = function () {
        clearTimeout(touchTimer);
        response.scrolling = isTouch = true;
    };
    const endTouch = function () {
        // Wait
        touchTimer = setTimeout(() => {
            isTouch = false;
            response.scrolling = isScrolling || isTouch;
            callCallbacks();
        }, TOUCH_DELTA_TIME);
    };

    new scrollDetector(startScroll, endScroll);

    $(document)
        .offpassive('touchstart.mobilevhunit-inertia touchend.mobilevhunit-inertia')
        .onpassive('touchstart.mobilevhunit-inertia', startTouch)
        .onpassive('touchend.mobilevhunit-inertia', endTouch);

    return response;
}

export default {
    inertiaDetector
};

export default function pollTimer (pollInterval, fn) {
    let timerInterval = pollInterval;
    let timeout = null;
    let timeoutReset = null;

    let fastPollMode = false;
    let rafHandle = null;

    const update = () => {
        if (fastPollMode) {
            cancelAnimationFrame(rafHandle);
            rafHandle = requestAnimationFrame(update);
        }

        if (fn() === true) {
            setFastPollMode();
        }
        timeout = setTimeout(update, timerInterval);
    };

    const setFastPollMode = () => {
        if (!fastPollMode) {
            fastPollMode = true;
            rafHandle = requestAnimationFrame(update);
        }

        // if (timerInterval !== 16) {
        //     timerInterval = 16;
        //     clearTimeout(timeout);
        //     timeout = setTimeout(update, timerInterval);
        // }

        clearTimeout(timeoutReset);
        // timeoutReset = setTimeout(() => { timerInterval = pollInterval; }, 1000);
        timeoutReset = setTimeout(resetFastPollMode, 1000);
    };

    const resetFastPollMode = () => {
        cancelAnimationFrame(rafHandle);
        rafHandle = null;
        fastPollMode = false;
        timeoutReset = null;
    };

    // Start timer
    timeout = setTimeout(update, timerInterval);

    return {
        setFastPollMode,
        destroy () {
            clearTimeout(timeout);
            resetFastPollMode();
            // clearTimeout(timeoutReset);
        }
    };
}

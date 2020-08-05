export default function pollTimer (pollInterval, fn) {
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
            burst();
        }

        clearTimeout(timeout);
        timeout = setTimeout(update, pollInterval);
    };

    const burst = () => {
        if (!fastPollMode) {
            fastPollMode = true;
            rafHandle = requestAnimationFrame(update);
        }

        clearTimeout(timeoutReset);
        timeoutReset = setTimeout(resetBurst, 1000);
    };

    const resetBurst = () => {
        cancelAnimationFrame(rafHandle);
        clearTimeout(timeoutReset);
        rafHandle = null;
        fastPollMode = false;
        timeoutReset = null;
    };

    // Start timer
    timeout = setTimeout(update, pollInterval);

    return {
        burst,
        destroy () {
            clearTimeout(timeout);
            resetBurst();
        }
    };
}

export default function pollTimer (pollInterval, fn) {
    let timerInterval = pollInterval;
    let timeout = null;
    let timeoutReset = null;

    const update = () => {
        if (fn() === true) {
            setFastPollMode();
        }
        timeout = setTimeout(update, timerInterval);
    }

    // Start timer
    timeout = setTimeout(update, timerInterval);

    return {
        setFastPollMode () {
            if (timerInterval !== 16) {
                timerInterval = 16;
                clearTimeout(timeout);
                timeout = setTimeout(update, timerInterval);
            }

            clearTimeout(timeoutReset);
            timeoutReset = setTimeout(() => { timerInterval = pollInterval; }, 1000);
        },
        destroy () {
            clearTimeout(timeout);
            clearTimeout(timeoutReset);
        }
    };
}

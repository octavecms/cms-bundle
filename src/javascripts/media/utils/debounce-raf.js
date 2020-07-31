export default function debounce (fn) {
    let debouncing = false;
    let callbackArgs = null;

    function callCallback () {
        debouncing = false;
        fn(...callbackArgs);
    }

    return (...args) => {
        callbackArgs = args;

        if (!debouncing) {
            debouncing = true;
            requestAnimationFrame(callCallback);
        }
    };
}
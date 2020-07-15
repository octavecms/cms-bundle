const REGEX_CAMEL = /-([a-z])/g;


export function each (arr, fn) {
    for (let i = 0, ii = arr.length; i < ii; i++) {
        fn(arr[i], i);
    }
}

export function camelCase (str) {
    return str.replace(REGEX_CAMEL, (t, chr) => {
        return chr.toUpperCase();
    });
}

export function repeatCallbackCall (fn, duration) {
    let timer = null;

    const reset = function () {
        timer = null;
    };

    const tick = function () {
        if (timer) {
            fn();
            requestAnimationFrame(tick);
        }
    };

    return function (event, data) {
        if (!timer && (!data || data.origin != 'vh-unit-change')) {
            timer = setTimeout(reset, duration);

            fn();
            requestAnimationFrame(tick);
        }
    };
}

export default {
    each,
    camelCase,
    repeatCallbackCall
};

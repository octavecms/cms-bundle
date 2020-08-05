/**
 * Animate element from some state, used for iframe elements where there may not be
 * CSS classnames needed for $.fn.transition
 * 
 * @param {object} $element Element
 * @param {object} styles Styles from which to animate
 */
export function animateElement ($element, styles) {
    const duration = styles.duration || 200;
    const easing = styles.ease || 'ease';

    const cssFrom = {};
    const cssTo = {};
    const reset = {'transition': ''};
    const transition = [];

    for (let key in styles) {
        if (key !== 'duration' && key !== 'easing') {
            cssFrom[key] = styles[key];
            cssTo[key] = '';
            transition.push(`${ key } ${ duration }ms ${ easing }`);

            if (key === 'height') {
                // For height we need to get "to" height, CSS transitions
                // can't detect it automatically
                cssTo[key] = $element.height();
                reset[key] = '';
            }
        }
    }

    $element.css(cssFrom);

    return new Promise((resolve, reject) => {
        requestAnimationFrame(() => {
            $element.css('transition', transition.join(', '));

            requestAnimationFrame(() => {
                $element.css(cssTo);
                
                setTimeout(() => {
                    $element.css(reset);
                    resolve();
                }, duration);
            });
        });
    });
}
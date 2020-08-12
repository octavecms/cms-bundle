const DEFAULT_DURATION = 200;
const DEFAULT_EASING = 'cubic-bezier(.25,  .74, .22, .99)';

/**
 * Animate element from some state, can be used for iframe elements where there are no
 * CSS classnames needed for $.fn.transition
 * 
 * @param {object} $element Element
 * @param {object} styles Styles from which to animate
 */
export function animateElement ($element, options) {
    const duration = options.duration || DEFAULT_DURATION;
    const easing = options.ease || DEFAULT_EASING;
    const optionsFrom = options.from || {};
    const optionsTo = options.to || {};

    const cssFrom = {};
    const cssTo = {};
    const cssReset = {'transition': ''};
    const transition = [];

    for (let key in optionsFrom) {
        cssFrom[key] = optionsFrom[key];
        cssTo[key] = '';
        transition.push(`${ key } ${ duration }ms ${ easing }`);

        if (key === 'height') {
            cssFrom['overflow'] = 'hidden';
            cssReset['overflow'] = '';

            cssTo[key] = $element.height();
            cssReset[key] = '';
        }
    }

    for (let key in optionsTo) {
        cssTo[key] = optionsTo[key];
        cssReset[key] = '';

        if (key === 'height') {
            cssFrom['overflow'] = 'hidden';
            cssReset['overflow'] = '';
        }

        if (!(key in cssFrom)) {
            if (key === 'height') {
                cssFrom[key] = $element.height();
            } else {
                cssFrom[key] = '';
            }
        }

        if (!(key in optionsFrom)) {
            transition.push(`${ key } ${ duration }ms ${ easing }`);
        }
    }

    $element.css(cssFrom);

    return new Promise((resolve, reject) => {
        requestAnimationFrame(() => {
            $element.css('transition', transition.join(', '));

            requestAnimationFrame(() => {
                $element.css(cssTo);
                
                setTimeout(() => {
                    $element.css(cssReset);
                    resolve();
                }, duration);
            });
        });
    });
}
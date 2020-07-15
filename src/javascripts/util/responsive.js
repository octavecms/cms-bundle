/*
 * Utility to detect browser size and change of it based on media queries
 * defined in mixins/_media.scss
 *
 * @example
 *     repsonsive.matches('lg-up') // => true | false
 *
 * @example
 *     const detach = repsonsive.enter('md-down', function () { ... })
 *
 * @example
 *     const detach = repsonsive.leave('md-down', function () { ... })
 */

import find from 'lodash/find';

const RULE_SELECTOR_PREFIX = '.d-none-';


/**
 * Searches stylesheet for rule with given selector and returns media query used
 *
 * @param {string} selector CSS selector
 * @returns {string} Media query
 * @protected
 */
function getQueryFromStylesheets (selector) {
    let result = null;

    find(document.styleSheets, stylesheet => {
        let rules = null;

        try {
            rules = stylesheet.rules || stylesheet.cssRules;
        } catch (err) {
            // CSS files which are not from same origin will fail
        }

        return find(rules || {}, rule => {
            if (rule.type !== CSSRule.MEDIA_RULE) {
                rule = rule.parentRule; // Older IE10, IE11 have media rule as parent
            }
            if (rule) {
                const index = rule.cssText.indexOf(selector);

                if (index !== -1) {
                    const char = rule.cssText[index + selector.length];

                    if (char in {' ': 1, '{': 1, ',': 1, '\n': 1}) {
                        if (rule.media && rule.media.length && rule.media[0]) {
                            result = rule.media[0]; // Modern browsers

                            for (let i = 1; i < rule.media.length; i++) {
                                if (rule.media[i]) result += ', ' + rule.media[i];
                            }
                        } else if (rule.media && rule.media.mediaText) {
                            result = rule.media.mediaText; // IE10, IE11 have media text
                        }

                        return true;
                    }
                }
            }
        });
    });

    return result;
}



// Media query cache
var queries = {};


/**
 * Returns query from size name
 * Searches for .is-hidden--XXX classname
 *
 * @param {string} size Size name
 * @returns {?object} Media query object
 * @protected
 */
function getQuery (size) {
    let query = queries[size];

    if (query === null) {
        return null;
    } else if (!query) {
        query = queries[size] = getQueryFromStylesheets(RULE_SELECTOR_PREFIX + size);

        if (query !== null) {
            query = queries[size] = matchMedia(query);
        } else if (isValidQuery(size)) {
            query = queries[size] = matchMedia(size);
        }
    }

    return query;
}

/**
 * Returns if media query is valid
 *
 * @protected
 */
function isValidQuery (query) {
    const media = matchMedia(query);

    // 'not all' is reported by all browsers, tested on IE10+, Safari, FF, Chrome
    return !media || media.media === 'not all' ? false : true;
}


/**
 * Add media query change listener
 *
 * @param {string} size Size name or media query
 * @param {function} listener Callback function
 */
function on (size, listener) {
    const query = getQuery(size);

    if (query) {
        query.addListener(listener);
    }

    return function () {
        if (query) {
            query.removeListener(listener);
        }
    };
}

/**
 * Add listener for event when media query matches
 *
 * @param {string} size Size name or media query
 * @param {function} listener Callback function
 */
function enter (size, listener) {
    const detach = on(size, function (mq) {
        if (mq.matches) {
            listener.call(this, mq);
        }
    });

    const query = getQuery(size);
    if (query && query.matches) {
        listener.call(query, query);
    }

    return detach;
}

/**
 * Add listener for event when media query doesn't match anymore
 *
 * @param {string} size Size name or media query
 * @param {function} listener Callback function
 */
function leave (size, listener) {
    const detach = on(size, function (mq) {
        if (!mq.matches) {
            listener.call(this, mq);
        }
    });

    const query = getQuery(size);
    if (query && !query.matches) {
        listener.call(query, query);
    }

    return detach;
}

/**
 * Checks if media query with given name matches
 *
 * @param {string} size Size name or media query
 * @returns {boolean} True if media query matches, otherwise false
 */
function matches (size) {
    if (size === 'xs-up') return true;
    const query = getQuery(size);
    return query ? query.matches : false;
}


export default { on, enter, leave, matches };

const REGEX_MOBILE_OS = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i;
const REGEX_TABLET_OS = /android|ipad|playbook|silk/i;
const REGEX_MOBILE_LEGACY = /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i;


/**
 * Check for hover support
 *
 * @returns {boolean} True if hover is supported, otherwise false
 */

function hasHoverSupport () {
    let hasHoverSupport;
    
    if (isEdge() && getScrollbarWidth()) {
        // On touch devices scrollbar width is usually 0
        hasHoverSupport = true;
    } else if (matchMedia('(any-hover: hover)').matches || matchMedia('(hover: hover)').matches) {
        hasHoverSupport = true;
    } else if (matchMedia('(hover: none)').matches) {
        hasHoverSupport = false;
    } else if (isMobile()) {
        hasHoverSupport = false;
    } else {
        hasHoverSupport = ('undefined' == typeof document.documentElement.ontouchstart);
    }

    return function () {
        return hasHoverSupport;
    };
}


/**
 * Check if scrollbars have size
 *
 * @returns {boolean} True if scrollbars have size, otherwise fase
 */

let scrollDiv;

function getScrollbarWidth () {
    const width = window.innerWidth - document.documentElement.clientWidth;

    if (width) {
        return width;
    } else {
        // Document doesn't have a scrollbar, possibly because there is not enough content so browser doesn't show it
        if (!scrollDiv) {
            scrollDiv = document.createElement('div');
            scrollDiv.style.cssText = 'width:100px;height:100px;overflow:scroll !important;position:absolute;top:-9999px';
            document.documentElement.appendChild(scrollDiv);
        }

        return scrollDiv.offsetWidth - scrollDiv.clientWidth;
    }
}

/**
 * Check if current browser is Internet Explorer
 *
 * @returns {boolean} True if current browser is Internet Explorer, otherwise false
 */
function isEdge () {
    let ua = navigator.userAgent;
    return ua.indexOf('MSIE ') > 0 || ua.indexOf('Trident/') > 0 || ua.indexOf('Edge/') > 0;
}

/**
 * Check if current browser is Safari
 *
 * @returns {boolean} True if current browser is Safari, otherwise false
 */
function isSafari () {
    let ua = navigator.userAgent;
    return /^((?!chrome|android).)*safari/i.test(ua);
}

/**
 * Check if current browser is Firefox
 *
 * @returns {boolean} True if current browser is Firefox, otherwise false
 */
function isFirefox () {
    return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
}

/**
 * Check if current OS is Mac
 *
 * @returns {boolean} True if current OS is Mac, otherwise false
 */
function isMac () {
    return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

/**
 * Check if current OS is iOS
 */
function isIOS () {
    return (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * Check if current OS is Android
 */
function isAndroid () {
    return navigator.userAgent.toLowerCase().indexOf('android') > -1;
}

/**
 * Check if current device is mobile device
 *
 * @returns {boolean} True if current device is mobile, otherwise false
 */
function isMobile () {
    return isPhone() || isTablet();
}

function isPhone () {
    const agent = navigator.userAgent || navigator.vendor || window.opera;
    return REGEX_MOBILE_OS.test(agent) || REGEX_MOBILE_LEGACY.test(agent.substr(0, 4));
}

function isTablet () {
    const agent = navigator.userAgent || navigator.vendor || window.opera;
    return REGEX_TABLET_OS.test(agent);
}


/**
 * Check if motion should be reduced
 */
function isReducedMotion () {
    return matchMedia('(prefers-reduced-motion: reduce)').matches || isCSSRegressionTesting();
}


export default {
    hasHoverSupport: hasHoverSupport(),
    getScrollbarWidth: getScrollbarWidth,
    isEdge: isEdge,
    isSafari: isSafari,
    isMac: isMac,
    isIOS: isIOS,
    isAndroid: isAndroid,
    isMobile: isMobile,
    isPhone: isPhone,
    isTablet: isTablet,
    isFirefox: isFirefox,
    isReducedMotion: isReducedMotion
};

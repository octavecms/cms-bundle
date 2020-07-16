/**
 * Fix vh unit size on iPhone, iPad devices where toolbar covers part of the
 * content with height of 100vh
 *
 * Sets CSS variable --viewport-height to correct px value
 *
 * Should be used only if using together with non-scrollable content (eg. full screen slides)
 *
 * @param {boolean} [mobileOnly=true] Apply to Android and iOS only, defaults to true
 * @param {string|null} [enableMq=null] Apply only when media query matches,
 *     for example to enable only for tablets but ignore mobile phones use 'md-up'
 */

import $ from 'util/jquery';
import responsive from 'util/responsive';
import detect from 'util/detect';
import 'util/jquery.passive';

import { processOptions } from './mobile-vh-unit/options';
import { repeatCallbackCall } from './mobile-vh-unit/utils';
import { inertiaDetector } from './mobile-vh-unit/intertia';
import { getScrollPosition, setScrollPosition } from './mobile-vh-unit/scroll-lock';


const PROPERTY_NAME = '--viewport-height';
const PROPERTY_NAME_IMMEDIATELLY = '--viewport-height-actual';
const EVENT_ORIGIN = 'vh-unit-change';

function updatePropertyValue (property, height) {
    let heightCSSValue = '100vh';

    if (height !== null) {
        heightCSSValue = `${ height }px`;
    }

    document.documentElement.style.setProperty(property, heightCSSValue);
}


function mobileVHUnit (options = {}) {
    options = processOptions(options);

    // iOS and Android only
    if (options.mobileOnly === false || detect.isIOS() || detect.isAndroid()) {
        const intertia = inertiaDetector();
        const heights = {};
        let matchesMQ = options.enableMq ? false:  true;

        const reload = function () {
            // Reset
            heights[PROPERTY_NAME] = null;
            heights[PROPERTY_NAME_IMMEDIATELLY] = null;
            updatePropertyValue(PROPERTY_NAME, null);
            updatePropertyValue(PROPERTY_NAME_IMMEDIATELLY, null);

            // Update
            updateImmediatelly();
            updateDelayed();
        };

        const update = function (property, eventOrigin, updateScroll) {
            let newHeight = matchesMQ ? window.innerHeight : null;

            if (newHeight !== heights[property]) {
                const scrollPosition = matchesMQ && updateScroll ? getScrollPosition() : null;

                // Change height
                heights[property] = newHeight;
                updatePropertyValue(property, heights[property]);

                if (eventOrigin) {
                    $(window).trigger('resize', {'origin': eventOrigin});
                }

                // Restore scroll position
                if (scrollPosition) {
                    setScrollPosition(scrollPosition);
                }
            }
        };

        const updateDelayed = update.bind(this, PROPERTY_NAME, EVENT_ORIGIN, true);
        const updateImmediatelly = update.bind(this, PROPERTY_NAME_IMMEDIATELLY, null, false);

        // Call update only after inertia scroll has completed
        const updateAfterScroll = intertia.debounce(updateDelayed);

        // Repeat calls to update for 250ms to capture when some
        // gestures suddenly toggle toolbar / navigation bar
        const updateDelayedRepeated = repeatCallbackCall(updateAfterScroll, 250);
        const updateImmediatellyRepeated = repeatCallbackCall(updateImmediatelly, 250);


        // Enable or disable depending if media query matches
        if (options.enableMq) {
            responsive.enter(options.enableMq, function () {
                matchesMQ = true;
                updateImmediatelly();
                updateDelayed();
            });
            responsive.leave(options.enableMq, function () {
                matchesMQ = false;
                updateImmediatelly();
                updateDelayed();
            });
        }

        $(window)
            .off('resize.mobilevhunit')
            .on('resize.mobilevhunit', updateDelayedRepeated)
            .on('resize.mobilevhunit', updateImmediatellyRepeated);

        $(document)
            .offpassive('touchmove.mobilevhunit')
            .onpassive('touchmove.mobilevhunit', updateDelayedRepeated)
            .onpassive('touchmove.mobilevhunit', updateImmediatellyRepeated);

        updateImmediatelly();
        updateDelayed();
        updateImmediatellyRepeated();
        updateDelayedRepeated();

        return {
            'update': reload
        };
    } else {
        updatePropertyValue(PROPERTY_NAME, null);
        updatePropertyValue(PROPERTY_NAME_IMMEDIATELLY, null);

        return {
            'update': () => {}
        };
    }
}


let instance = null;

export default function (options) {
    if (instance) {
        instance.update();
    } else {
        instance = mobileVHUnit(options);
    }
}

/**
 * Separate file for importing jQuery to allow importing third-party libs / components
 * which expect jQuery global variables to be available.
 *
 * If we import directly in common/index then all other imports are loaded first and
 * only then these variables will be defined, which will trigger an error in third-party
 * libs / components
 */
import $ from 'jquery';

// Expose jQuery
window.$ = window.jQuery = $;

export default $;

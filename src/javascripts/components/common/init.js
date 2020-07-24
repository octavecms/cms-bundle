// Expose jQuery
import $ from 'util/jquery';
import detect from 'util/detect';

import 'util/jquery.returnkey';

// Library to attach jQuery plugins to elements with data-plugin attribute
import 'jquery-app';

// Focus-visible
import 'focus-visible';


/*
 * Hover support classname for CSS
 */

if (!detect.hasHoverSupport()) {
    $('html').removeClass('has-hover').addClass('no-hover');
}


// Call plugins
$(() => {

    $('body').app();

});

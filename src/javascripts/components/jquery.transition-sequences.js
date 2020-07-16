import $ from 'util/jquery';
import 'util/animation/jquery.transition';


/**
 * Transition sequences to control animation speeds
 *
 * @example
 *     $('.my-element).transition('fade-in slow');
 */

$.transition.sequences['slow'] = {
    'before': $el => $el.addClass('animation--slow'),
    'after':  $el => $el.removeClass('animation--slow'),
};

$.transition.sequences['block'] = {
    'before': $el => $el.addClass('animation--block'),
    'after':  $el => $el.removeClass('animation--block'),
};


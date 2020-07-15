import $ from 'util/jquery';
import 'util/animation/jquery.transition';
// import 'util/animation/split-text';


/**
 * Split text into lines and words and show each line / word with a small delay
 *
 * Requires javascripts/util/animation/split-text.js
 * Requires stylesheets/components/animations/title.scss
 */

// $.transition.sequences['title'] = $.transition.generateSequenceIn('title', {
//     // Split text into lines and words
//     'before': $el => {
//         $el.splitLines();
//     },
// });


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


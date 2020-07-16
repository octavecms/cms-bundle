import $ from 'util/jquery';


/**
 * jQuery special event which allows us to detect when element is removed
 * from the DOM
 *
 * @example
 *     $element.one('destroyed', function () {});
 */
$.event.special.destroyed = {
    remove: function(o) {
        if (o.handler) {
            o.handler();
        }
    }
};

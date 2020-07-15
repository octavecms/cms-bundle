import $ from 'common/jquery';

/**
 * jQuery special event for detecting single return key press
 *
 * @demo
 *     $('.btn').on('tap returnkey', ...);
 */
$.event.special.returnkey = {
    delegateType: 'keydown',
    bindType: 'keydown',
    handle: function(event) {
        var handleObj = event.handleObj;
        var ret = null;

        if (event.which === 13) {
            event.type = handleObj.origType;
            ret = handleObj.handler.apply(this, arguments);
            event.type = handleObj.type;
            return ret;
        }
    }
};

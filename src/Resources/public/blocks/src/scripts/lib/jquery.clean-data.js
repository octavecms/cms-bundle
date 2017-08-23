import $ from 'jquery';

$.cleanData = (function(originalCleanData) {
    return function(elements) {
        let element;

        for (let i = 0; (element = elements[i]) != null; i++) {
            try {
                // Only trigger remove when necessary to save time
                let events = $._data(element, 'events');
                if (events && events.remove) {
                    $(element).triggerHandler('remove');
                }

            // http://bugs.jquery.com/ticket/8235
            } catch (e) {}
        }
        originalCleanData(elements);
    };
  })($.cleanData);
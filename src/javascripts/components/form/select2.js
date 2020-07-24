import 'select2';

function formatSelection (state) {
    const image = $(state.element).data('image');

    if (!state.id || !image) {
        return state.text;
    } else {
        const $state = $('<span class="select2-selection__image"><img src="" alt="" draggable="false" /> <span></span></span>');

        $state.find('img').attr('src', image).attr('alt', state.text);
        $state.find('span').text(state.text);

        return $state;
    }
};

function formatResult (state) {
    const image = $(state.element).data('image');

    if (!state.id || !image) {
        return state.text;
    } else {
        const $state = $('<span class="select2-results__option__image"><img src="" alt="" draggable="false" /> <span></span></span>');

        $state.find('img').attr('src', image).attr('alt', state.text);
        $state.find('span').text(state.text);

        return $state;
    }
};


const originalSelect2Plugin = $.fn.select2;

$.fn.select2 = function (options = {}) {
    return originalSelect2Plugin.call($(this), $.extend({
        theme: 'cms',
        templateResult: formatResult,
        templateSelection: formatSelection,
    }, options));
};

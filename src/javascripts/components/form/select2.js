import 'select2';
import assign from 'lodash/assign';

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
    originalSelect2Plugin.call(this, assign({
        theme: 'cms',
        templateResult: formatResult,
        templateSelection: formatSelection,

        dropdownAutoWidth: true,

        // Hide search box
        minimumResultsForSearch: Infinity,
    }, options));

    // Add show animation to dropdown
    const instance = this.data('select2');
    const $dropdown = instance.$dropdown.find('.select2-dropdown');

    this.on('select2:opening', () => {
        $dropdown.addClass('d-none');
    });

    this.on('select2:open', () => {
        $dropdown.transition('select-in');
    });

    return this;
};

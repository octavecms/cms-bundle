const NAMESPACE = 'image';

let mediaContent = null;


class ImageWidget {

    static get defaultOptions () {
        return {};
    }

    constructor (element, options) {
        this.$element = $(element);
        this.options = $.extend(true, this.constructor.defaultOptions, this.options, options);

        this._init();
    }

    _init () {
        const $element = this.$element;

        // Change button click
        $element.find('.js-change').mediaTrigger({
            'onselect': this._handleImageChange.bind(this)
        });

        // Remove button click
        $element.find('.js-reset').on('click', this._reset.bind(this));

        // When this whole widget is removed from DOM trigger 'destroy'
        $element.on(`remove.${ NAMESPACE }`, this.destroy.bind(this));

        this.$input   = $element.find('input[type="hidden"]');
        this.$caption = $element.find('input[type="text"]');
        this.$image   = $element.find('img');
    }

    destroy () {
        this.$element.off(`.${ NAMESPACE }`);
        this.$element = this.options = null;
    }

    _handleImageChange (images) {
        this.$image.removeClass('hidden').attr('src', images[0].image);
        this.$input.val(images[0].id);
        this.$caption.val(images[0].name);
    }

    _reset () {
        this.$image.addClass('hidden').attr('src', '');
        this.$input.val('');
        this.$caption.val('');
    }
}


$.bridget(NAMESPACE, ImageWidget);
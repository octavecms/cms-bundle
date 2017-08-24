const NAMESPACE = 'image';


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
        $element.find('.js-image-change').mediaTrigger({
            'onselect': this._handleImageChange.bind(this)
        });

        // Remove button click
        $element.find('.js-image-reset').on('click', this._reset.bind(this));

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

    change (image) {
        this.$image.removeClass('hidden').attr('src', image.image);
        this.$input.val(image.id);
        // this.$caption.val(image.name || image.title || '');
    }

    _handleImageChange (images) {
        this.change(images[0]);
    }

    _reset () {
        this.$image.addClass('hidden').attr('src', '');
        this.$input.val('');
        this.$caption.val('');
    }
}


$.bridget(NAMESPACE, ImageWidget);
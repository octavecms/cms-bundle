import $ from 'lib/jquery';

const NAMESPACE = 'image';


class ImageWidget {

    static get defaultOptions () {
        return {};
    }

    constructor (element, options) {
        this.$element = $(element);
        this.options = $.extend(true, this.constructor.defaultOptions, this.options, options);

        this._init();
        this._initValidation();
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
        this.$preview = $element.find('.js-image-preview');
        this.$image   = $element.find('img');
        this.$required = null;
    }

    _initValidation () {
        if (this.$input.prop('required')) {
            this.$required = $('<input type="checkbox" tabindex="-1" />').appendTo(this.$preview);
            this._updateValidation();
        }
    }

    _updateValidation () {
        if (this.$required) {
            const isEmpty = !this.$input.val();

            if (isEmpty) {
                this.$required.get(0).setCustomValidity('Please select an image.');
            } else {
                this.$required.get(0).setCustomValidity('');
            }
        }
    }

    destroy () {
        this.$element.off(`.${ NAMESPACE }`);
        this.$element = this.options = null;
    }

    change (image) {
        const isEmpty = !image.path && !image.image;
        this.$element.toggleClass('form-control-image--empty', isEmpty);
        this.$image.removeClass('hidden').attr('src', image.image || image.path);
        this.$input.val(image.path || image.image);
        // this.$caption.val(image.name || image.title || '');
        this._updateValidation();
    }

    _handleImageChange (images) {
        this.change(images[0]);
    }

    _reset () {
        this.$element.addClass('form-control-image--empty');
        this.$image.addClass('hidden').attr('src', '');
        this.$input.val('');
        this.$caption.val('');
        this._updateValidation();
    }
}


$.bridget(NAMESPACE, ImageWidget);
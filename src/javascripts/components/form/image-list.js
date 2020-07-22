/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';
import Sortable, { MultiDrag, Swap } from 'sortablejs';

Sortable.mount(new MultiDrag());

// import 'util/jquery.destroyed';
// import namespace from 'util/namespace';


/**
 * Image list component
 */
class ImageList {

    static get Defaults () {
        return {
            listSortingClass: 'image-list--sorting',

            selectedClass: 'image-item--selected',
            chosenClass: 'image-item--chosen',
            ghostClass: 'image-item--ghost',
            dragClass: 'image-item--dragging',
            listSelector: '.js-image-list-list',
            forceElementAtTheEndSelector: '.js-image-list-force-end',

            disabled: false
        };
    }

    constructor ($container, opts) {
        const options = this.options = $.extend({}, this.constructor.Defaults, opts);
        this.$container = $container;
        this.$list = $container.find(options.listSelector);

        if (!options.disabled) {
            this.createSortable();
        }
    }

    createSortable () {
        const options = this.options;
        // const isOSX = navigator.platform.toLowerCase().indexOf('mac') >= 0;

        this.sortable = new Sortable(this.$list.get(0), {
            dragClass: options.dragClass,
            ghostClass: options.ghostClass,
            chosenClass: options.chosenClass,
            
            // Multidrag
            // multiDrag: true,
            // selectedClass: options.selectedClass,
            // multiDragKey: isOSX ? 'Meta' : 'Ctrl',

            // Non-draggalbe elements
            filter: '.js-image-list-not-draggable',
            cancel: '.js-image-list-not-draggable',

            // CSS selector for elements which are draggable
            draggable: '.js-image-list-item',

            // Animation duration
            animation: 150,

            onStart: this.onStart.bind(this),
            onEnd: this.onEnd.bind(this),
            setData: this.setDataTransferData.bind(this),

            onChange: this.onChange.bind(this),
        });
    }

    /**
     * Add class when starting sorting
     * 
     * @protected
     */
    onStart () {
        this.$container.addClass(this.options.listSortingClass);
    }

    /**
     * Remove class when sorting ends
     * 
     * @protected
     */
    onEnd () {
        this.$container.removeClass(this.options.listSortingClass);
    }

    /**
     * Make move element to the end of the list which is always supposed to
     * be at the end of the list.
     * 
     * @protected
     */
    onChange () {
        const selector = this.options.forceElementAtTheEndSelector;
        if (selector) {
            const $list = this.$list;
            const $element = $list.find(selector);

            if ($element.get(0).nextElementSibling) {
                $list.append($element);
            }
        }
    }

    /**
     * Set transferable data, this for example allow to drag item from the
     * list into the browser url and full size image will be opened in the browser
     * 
     * @protected
     */
    setDataTransferData (dataTransfer, dragEl) {
        const $image = $(dragEl).find('img');
        let url = $image.attr('data-full-image-url') || $image.attr('src');

        if (url.indexOf('://') === -1 && url.indexOf('//') === -1) {
            url = document.location.origin + url;
        }

        dataTransfer.setData('text/uri-list', url);
        dataTransfer.setData('text/plain', url);
    }

    destroy () {
        this.sortable.destroy();
        this.sortable = null;
    }
}

$.fn.imageList = createPlugin(ImageList);

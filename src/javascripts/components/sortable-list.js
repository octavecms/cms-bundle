/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';
import Sortable, { MultiDrag, Swap } from 'sortablejs';

Sortable.mount(new MultiDrag());


/**
 * Sortable list component
 */
class SortableList {

    static get Defaults () {
        return {
            listSortingClass: 'is-sorting',

            selectedClass: 'is-selected',
            chosenClass: 'is-chosen',
            ghostClass: 'is-ghost',
            dragClass: 'is-dragging',

            // Find elements
            listSelector: '.js-sortable-list-list',

            // Force elements to be at the end of the list, after all sortable elements
            forceElementAtTheEndSelector: '.js-sortable-list-force-end',
            
            // Non-draggable elements
            filterSelector: '.js-sortable-list-not-draggable',
            cancelSelector: '.js-sortable-list-not-draggable',

            // CSS selector for elements which are draggable
            draggableSelector: '.js-sortable-list-item',

            // Handle selector
            handleSelector: '.js-sortable-list-item-handle',

            // Inverted swap
            invertSwap: false,

            // Allows disabling sortable
            disabled: false,

            // Allow keyboard sorting
            keyboardSorting: true,
        };
    }

    constructor ($container, opts) {
        const options = this.options = $.extend({}, this.constructor.Defaults, opts);
        this.$container = $container;
        this.$list = $container.find(options.listSelector).eq(0);

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
            filter: options.filterSelector,
            cancel: options.cancelSelector,

            // Handle
            handle: options.handleSelector,

            // CSS selector for elements which are draggable
            draggable: options.draggableSelector,

            // Animation duration
            animation: 150,

            // Threshold
            swapThreshold: 1,
            invertSwap: options.invertSwap,

            onStart: this.onStart.bind(this),
            onEnd: this.onEnd.bind(this),
            setData: this.setDataTransferData.bind(this),

            onChange: this.onChange.bind(this),
        });

        if (options.handleSelector && options.keyboardSorting) {
            this.$list.on('keydown', `${ options.draggableSelector } ${ options.handleSelector }`, this.handleSortKey.bind(this));
        }
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

            if ($element.length && $element.get(0).nextElementSibling && $element.parent().is($list)) {
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
        const $header = $(dragEl).find('h1, h2, h3, h4');

        if ($header.length) {
            dataTransfer.setData('text/plain', $header.eq(0).text());
        } else {
            const $image = $(dragEl).find('img');
            let url = '';
    
            if ($image.length) {
                url = $image.attr('data-full-image-url') || $image.attr('src');
        
                if (url.indexOf('://') === -1 && url.indexOf('//') === -1) {
                    url = document.location.origin + url;
                }
            }
    
            if (url) {
                dataTransfer.setData('text/uri-list', url);
                dataTransfer.setData('text/plain', url);
            }
        }
    }

    /**
     * Handle keyboard up/down arrow keys
     * 
     * @param {object} event Event
     * @protected
     */
    handleSortKey (event) {
        if (!event.isDefaultPrevented() && $(event.target).hasClass('focus-visible') && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
            const options = this.options;
            const $item = $(event.target).closest(options.draggableSelector);

            if (event.key === 'ArrowUp') {
                const $ref = $item.prev();
                $item.insertBefore($ref);
            } else {
                const $ref = $item.next();

                if ($ref.length && !$ref.is(options.forceElementAtTheEndSelector)) {
                    $item.insertAfter($ref);
                }
            }

            $(event.target).focus();
            event.preventDefault();
        }
    }

    destroy () {
        this.sortable.destroy();
        this.sortable = null;
    }
}

$.fn.sortableList = createPlugin(SortableList);

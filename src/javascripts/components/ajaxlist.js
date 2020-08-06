/**
 * JSON data loaded through ajax and rendered on client-side
 */

import $ from 'util/jquery';
import assign from 'lodash/assign';
import debounce from 'lodash/debounce';
import createPlugin from 'jquery-plugin-generator';
import 'util/template/jquery.template';
import 'util/jquery.serializeobject';


const BUTTON_SELECTOR = 'a, button, [role="button"]';

export default class AjaxList {

    static get Defaults () {
        return {
            // CSS selector to find filter elements
            'filtersSelector': '.js-ajax-filters',

            // CSS selector to find list
            'listSelector': '.js-ajax-list',

            // CSS selector to find element which will contain offset and count
            'counterSelector': '.js-ajax-list-counter',

            // CSS selector to find empty view
            'emptySelector': '.js-ajax-empty',

            // CSS selector to find empty message
            'emptyMessageSelector': '.js-ajax-empty-message',

            // CSS selector to find button which will load more items
            'moreSelector': '.js-load-more',

            // CSS selector to find pagination
            'paginationSelector': '.js-load-more-pagination',

            // CSS selector to find template
            'templateSelector': 'script[type="text/template"]',

            // Ajax request endpoint for list of items
            'endpoint': null,

            // Ajax request endpoint method
            'endpointMethod': 'GET',

            // Ajax request enpoint response format
            'endpointFormat': 'json',

            // Remove siblings before rendering content, useful if there already
            // is pre-rendered content which needs to be removed; passed to the $.fn.template plugin
            'removeSiblings': false,

            // Automatically reload on filter change instead of waiting for submit
            'reloadOnFilterChange': false
        };
    }

    constructor (container, opts) {
        const options     = this.options     = assign({}, this.constructor.Defaults, opts);

        const $container  = this.$container  = $(container);
        const $list       = this.$list       = this.findElement($container, options.listSelector)                || $container;
        const $filters    = this.$filters    = this.findElement($container, options.filtersSelector)             || $container;
        const $more       = this.$more       = this.findElement($container, options.moreSelector)                || $();
        const $pagination = this.$pagination = this.findElement($container, options.paginationSelector)          || $();
        this.$counter                        = this.findElement($container, options.counterSelector)             || $();
        this.$empty                          = this.findElement($container, options.emptySelector)               || $();
        this.$template                       = this.findElement($list, options.templateSelector);

        if (this.$template) {
            this.$template.template({
                'selector': options.templateSelector,
                'removeSiblings': options.removeSiblings
            });
        } else {
            console.warn('Template not found for ', this.$container.get(0));
            throw new Error('Template not found. AjaxList requires a template for client-side rendering <script type="text/template">');
        }

        this.loading = false;
        this.offset  = this.getItemCountFromDOM();

        // Hide pagination, it's for server-side use only, on client-side "More" button is used
        if ($pagination.length) {
            $pagination.addClass('is-hidden');
            $more.removeClass('is-hidden');
        }

        $more.find(BUTTON_SELECTOR).addBack(BUTTON_SELECTOR).on('click', this.load.bind(this));

        if (options.reloadOnFilterChange) {
            $filters
                .on('change', debounce(this.handleFilterChange.bind(this), 60))
                .on('submit', (e) => e.preventDefault());
        } else {
            $filters
                .on('submit', this.handleFilterChange.bind(this))
                .on('submit', (e) => e.preventDefault());
        }
    }

    /**
     * Find element or return null
     *
     * @param {object} $element Element in which to look
     * @param {string} selector CSS selector
     * @returns {object|null} Element or null
     * @protected
     */
    findElement ($element, selector, filter = true) {
        let $matches = $element.filter(selector);

        if (!$matches.length) {
            $matches = $element.find(selector);

            if (filter) {
                $matches = $matches.not($element.find(this.options.emptySelector + ' ' + selector));
            }
        }

        if (!$matches.length) {
            $matches = $element.nextAll(selector);
        }

        if (!$matches.length) {
            $matches = $element.prevAll(selector);
        }

        if (!$matches.length) {
            $matches = $element.parent().nextAll(selector);
        }

        return $matches.length ? $matches : null;
    }


    /*
     * List
     * ------------------------------------------------------------------------
     */


    /**
     * Load next batch of news items
     */
    load () {
        if (this.loading) return;
        this.loading = true;

        const $more      = this.$more;
        const $empty     = this.$empty;
        const options    = this.options;

        const $button    = $more.find(BUTTON_SELECTOR).addBack(BUTTON_SELECTOR);

        $button.addClass('is-loading');
        $empty.addClass('is-loading');

        $.ajax({
            'url': options.endpoint,
            'method': options.endpointMethod,
            'data': this.getFilterValues(),
            'dataType': options.endpointFormat
        })
            .done(this.handleLoadResponse.bind(this))
            .always(this.handleLoadComplete.bind(this));
    }

    /**
     * Handle success and error responses
     *
     * @protected
     */
    handleLoadComplete () {
        const $more     = this.$more;
        const $empty    = this.$empty;
        const $button   = $more.find(BUTTON_SELECTOR).addBack(BUTTON_SELECTOR);

        $button.removeClass('is-loading');
        $empty.removeClass('is-loading');

        this.loading = false;
    }

    /**
     * Handle success response
     *
     * @param {object} response Request response
     * @protected
     */
    handleLoadResponse (response) {
        let $more = this.$more;
        let $list = this.$list;
        let total = this.total;
        let offset = this.offset;

        if ('total' in response) {
            total = this.total = response.total;
        }

        if ('data' in response && response.data) {
            // If we loaded data starting from 0, then we want to remove old html
            let method = offset ? 'append' : 'replace';

            // Additional global variables when rendering template
            $.fn.template.vars['offset'] = offset;
            this.$template.template(method, response.data);
            $.fn.template.vars['offset'] = null;

            // If response is an object, then count it as 1
            const count = $.isArray(response.data) ? response.data.length : (response.data ? 1 : 0);
            offset = this.offset = offset + count;

            if (!count && total && total > offset) {
                // Server-side issue, there is less data than "total"
                // Mark as if all data has been received
                offset = this.offset = total;
            } else if (typeof total === 'undefined' && count) {
                // Server didn't have 'total' in response, assume response
                // contains all results
                total = count;
            }
        }

        if (total) {
            // There are results
            this.hideEmptyMessage();

            //
            this.$counter.template('replace', {
                'total': this.total,
                'offset': this.offset
            });
        } else {
            // There are no results
            this.showEmptyMessage(response.message);
        }

        // Show / hide "More" button
        if (total && total > offset) {
            $more.removeClass('is-hidden');
        } else {
            $more.addClass('is-hidden');
        }

        // Trigger resize event
        $list.trigger('resize').trigger('appear');
    }

    /**
     * Returns number of items from DOM elements
     *
     * @returns {number} Number of news items
     * @protected
     */
    getItemCountFromDOM () {
        return this.$list.children().length;
    }


    /*
     * Empty message
     * ------------------------------------------------------------------------
     */


    /**
     * Hide results and show empty message
     *
     * @param {string?} message Message
     * @protected
     */
    showEmptyMessage (message) {
        const $empty   = this.$empty;
        const $counter  = this.$counter;
        const $list    = this.$list;
        const $more    = this.$more;

        $empty.removeClass('is-hidden');
        $counter.addClass('is-hidden');
        $more.addClass('is-hidden');
        $list.addClass('is-hidden');

        //
        if (message && typeof message === 'string') {
            const $message = $empty.find(this.options.emptyMessageSelector);
            $message.text(message);
        }
    }

    /**
     * Hide empty message and show results
     *
     * @protected
     */
    hideEmptyMessage () {
        const $empty  = this.$empty;
        const $counter = this.$counter;
        const $list   = this.$list;

        $empty.addClass('is-hidden');
        $counter.removeClass('is-hidden');
        $list.removeClass('is-hidden');
    }


    /*
     * Filters
     * ------------------------------------------------------------------------
     */


    /**
     * Returns all filter values
     * It's assumed that all filter elements are 'switches'
     *
     * @return {object} Filter values
     * @protected
     */
    getFilterValues () {
        let values = this.$filters.serializeObject();

        // Send also locale
        values.locale = $('html').attr('lang');

        // Offset
        values.offset = this.offset;

        return values;
    }

    /**
     * Handle filter value change, update internal filter values and
     * reload news list
     *
     * @protected
     */
    handleFilterChange () {
        this.offset = 0;
        this.load();
    }

}

$.fn.ajaxlist = createPlugin(AjaxList);

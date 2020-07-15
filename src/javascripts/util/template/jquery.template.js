import $ from 'common/jquery';
import template from 'lodash/template';
import createPlugin from 'jquery-plugin-generator';

// Helpers / variables in templates
import each from 'lodash/each';
import numberFormat from 'util/template/number-format';
import transchoice from 'util/template/transchoice';  // enable if needed


// Global variables available in templates
const GLOBAL_TEMPLATE_VARIABLES = {
    each,
    numberFormat,
    transchoice
};


/**
 * Client-side template rendering based on _.template
 *
 * Renders data using _.template where template is defined in <script type="text/template">
 * tag in the place where template is defined
 */
class Template {

    static get Defaults () {
        return {
            'selector': 'script[type="text/template"]',

            // Remove all siblings before rendering content
            'removeSiblings': false,

            // Either 'append' or 'prepend'
            'insertMode': 'append',

            // Post filter function
            'postFilter': null
        };
    }

    constructor ($element, opts) {
        const options    = $.extend({}, this.constructor.Defaults, opts);

        const $container = $element;
        const $template  = $container.find(options.selector).addBack(options.selector); // template <script> tag

        // Detect siblings, etc
        const $prev      = !options.removeSiblings && $template.prev();
        const $next      = !options.removeSiblings && $template.next();
        const $last      = options.removeSiblings && $template.prev();
        const $parent    = $template.parent();

        // Process template
        const tmpl       = template($template.remove().html());

        this.dataVariableName = $template.data('templateVariable') || null;

        this.$prev    = $prev.length   ? $prev   : null;
        this.$next    = $next.length   ? $next   : null;
        this.$parent  = $parent.length ? $parent : null;
        this.$last    = $last.length   ? $last   : null;
        this.template = tmpl;
        this.options  = options;

        // If removeSiblings is used then we can replace only when needed
        // Variable to store last generated HTML
        this.allowHTMLCache = options.removeSiblings;
        this.replaceHTMLCache = null;
    }

    /**
     * Remove rendered HTML from DOM
     */
    reset () {
        const $prev   = this.$prev;
        const $next   = this.$next;
        const $parent = this.$parent;
        let   $start  = $prev ? $prev.next() : null;

        if (!$prev && $next) {
            $start = $parent.children().eq(0);
        }

        if ($start) {
            let $temp;

            while ($start.length && (!$next || !$start.is($next))) {
                $temp = $start;
                $start = $start.next();
                $temp.remove();
            }
        } else if ($parent && !this.allowHTMLCache) {
            // We keep content if cache is allowed, if it will be necessery
            // it will be removed in .append(), otherwise remove it
            $parent.empty();
        }

        this.$last = null;
    }

    /**
     * Compile a template with data into a string
     *
     * @param {object|array} _data Data or list of data
     * @returns {string} HTML string
     */
    compile (_data) {
        const tmpl = this.template;
        const postFilter = this.options.postFilter;
        const insertMode = this.options.insertMode;
        const dataVariableName = this.dataVariableName;

        let data = $.isArray(_data) ? _data : (_data ? [_data] : []);
        let i = 0;
        let ii = data.length;
        let html = '';

        for (; i < ii; i++) {
            try {
                let itemData = $.extend({
                    'loop': {
                        'index': i + 1,
                        'index0': i,
                        'first': i === 0,
                        'last': i == ii - 1
                    }
                }, $.fn.template.vars);

                if (dataVariableName) {
                    itemData[dataVariableName] = data[i];
                } else {
                    itemData = $.extend(itemData, data[i]);
                }

                let htmlItem = tmpl($.extend({}, $.fn.template.vars, itemData));

                if (insertMode === 'append') {
                    html += htmlItem;
                } else {
                    html = htmlItem + html;
                }
            } catch (err) {
                // Don't throw, output error message instead
                if (window.console) {
                    window.console.error('Error rendering template', err);
                }
            }
        }

        if (typeof postFilter === 'function') {
            html = String(postFilter(html));
        }

        return html;
    }

    /**
     * Render data appending (or prepending depending on `options.insertMode`) to the DOM
     *
     * @param {object|array} _data Data or list of data
     */
    append (_data) {
        const $parent = this.$parent;
        let   $prev = this.$prev;
        let   $next = this.$next;
        let   $last = this.$last;
        const insertMode = this.options.insertMode;

        const html = this.compile(_data);

        let $html;
        let updated = false;

        try {
            // Text content throws error
            $html = $(html);

            if (insertMode === 'append') {
                this.$last = $html.eq(-1);
            } else {
                this.$last = $html.eq(0);
            }
        } catch (error) {
            this.$last = null;
        }

        // Make sure these elements are still in the list
        if ($last && !$last.parent().length) {
            $last = $parent.children().eq(-1);
        }
        if ($prev && !$prev.parent().length) {
            $prev = $parent.children().eq(-1);
        }
        if ($next && !$next.parent().length) {
            $next = $parent.children().eq(-1);
        }

        if ($last && $last.length) {
            if (insertMode === 'append') {
                $last.after($html && $html.length ? $html : html);
            } else {
                $last.before($html && $html.length ? $html : html);
            }

            updated = true;
        } else if ($prev && $prev.length) {
            $prev.after($html && $html.length ? $html : html);
            updated = true;
        } else if ($next && $next.length) {
            $next.before($html && $html.length ? $html : html);
            updated = true;
        } else if ($parent) {
            if (insertMode === 'append' || !this.allowHTMLCache || this.replaceHTMLCache !== html) {
                $parent.empty();
                updated = true;

                if (insertMode === 'append') {
                    $parent.append($html && $html.length ? $html : html);
                } else {
                    $parent.prepend($html && $html.length ? $html : html);
                }
            }
        }

        if (updated) {
            this.replaceHTMLCache = html;
            $parent.plugins();
        }
    }

    /**
     * Render data replacing previously rendered data
     *
     * @param {object|array} _data Data or list of data
     */
    replace (_data) {
        this.reset();
        this.append(_data);
    }

}

$.fn.template = createPlugin(Template);
$.fn.template.vars = GLOBAL_TEMPLATE_VARIABLES;


export default Template;

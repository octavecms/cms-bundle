import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';
import each from 'lodash/each';
import map from 'lodash/map';
import filter from 'lodash/filter';
import uniq from 'lodash/uniq';
import every from 'lodash/every';
import reduce from 'lodash/reduce';

import detect from 'util/detect';
import 'util/animation/jquery.transition';
import 'components/jquery.transition-sequences';

import ResponsiveComponent from 'components/responsive-component';


/**
 * Accordion component
 */
class Accordion extends ResponsiveComponent {

    static get Defaults () {
        return {
            // CSS selector to find an accordion heading
            // Complex selector to prevent matching tab heading
            'headingSelector': '[aria-controls]:not([data-tabs-heading-id]):not([role="tab"]), [data-accordion-heading-id]',

            // Parent selector for 'activeHeadingParentClassName'
            'headingParentSelector': '.accordion__header',

            // CSS selector to find an accordion content
            'contentSelector': '[role="region"], [data-accordion-content-id]',

            // Classname which is added to the closed / collapsed accordion items
            // (to the parent element of the accordion content which is closed / collapsed)
            'inactiveAccordionClassName': 'accordion--collapsed',

            // Classname which is added to the open / expanded accordion items
            // (to the parent element of the accordion content which is open / expanded)
            'activeAccordionClassName': 'accordion--expanded',

            // Classname which is added to the open / expanded accordion heading item
            'activeHeadingClassName': '',

            // Classname which is added to the open / expanded accordion heading parent item, '.accordion__header'
            'activeHeadingParentClassName': '',

            // Classname which is added to the open / expanded accordion content item
            'activeContentClassName': '',

            // Animation name, if set it will be used to animate heading to active state
            'animationHeadingIn': null,

            // Animation name, if set it will be used to animate heading to inactive state
            'animationHeadingOut': null,

            // Animation name, if set will be used to animate content to the active state
            // See /docs/util/animations#js-animations-using-css-transition
            'animationIn': '',

            // Animation name, if set will be used to animate content to the inactive state
            // See /docs/util/animations#js-animations-using-css-transition
            'animationOut': '',

            // Animate height when expanding / collapsing contents
            'animationHeight': true,

            // Selector for elements inside the headings which will not toggle elements when
            // clicked
            'ignoreSelector': 'label, input',

            // Attribute which is used on accordion content
            'hiddenAttribute': 'aria-hidden',

            // Attribute which is used on accordion heading
            'expandedAttribute': 'aria-expanded',

            // Only one item can be opened at a time
            // If true all other items will be closed when any other is opened
            'onlyOne': false,

            // Prevent closing item if it's the only one opened
            // At all times one item will be open
            'atLeastOne': false,

            // Autoscroll to make sure content is maximally visible
            'autoScroll': false,
            // Space to preserve between accordion top and viewport top
            'autoScrollTopMargin': 20,
            // Space to preserve between accordion bottom and viewport bottom
            'autoScrollBottomMargin': 20,
        };
    }

    init () {
        const $container = this.$container;
        const options    = this.options;

        this.hashReady   = false;

        // When opening / closing elements save height changes for autoScroll
        this.heightDiffs = map(Array(this.getAllIds().length), () => 0);
    }

    destroy () {
        this.disable();

        each(this.mediaListeners, (fn) => fn());
        this.mediaListeners = this.options = this.$container = null;
    }

    /**
     * Add event listeners
     *
     * @protected
     */
    enable () {
        if (super.enable()) {
            const options = this.options;

            // When user clicks on a heading open content. We bind to document to allow headings to be
            // placed anywhere in the page + have multiple headings for single content
            // We use body instead of document to make sure we stop it before it propagates to document and callbacks for
            // other plugins are called after we have prevented default behaviour
            $(document.body).on(`click.${ this.ns }`, options.headingSelector, this.handleHeadingClick.bind(this));

            // Open item based on hash value
            this.handleHashChange();
        }
    }

    /**
     * Remove event listeners
     *
     * @protected
     */
    disable () {
        if (super.disable()) {
            // Cleanup global events
            $(document.body).off(`click.${ this.ns }`);

            // Page loaded with accordion disabled, prevent accordion toggle when it becomes
            // enabled
            this.hashReady = true;
        }
    }


    /*
     * Events
     * ----------------------------------------------------
     */


    /**
     * On hash change open corresponding tab
     *
     * @protected
     */
    handleHashChange () {
        if (!this.hashReady) {
            this.hashReady = true;

            if (document.location.hash) {
                const hash = document.location.hash.replace('#', '');
                const $heading = $(`#${ hash }`);
                const id = this.hasContent(hash) ? hash : this.getId($heading);

                if (id && this.hasContent(id)) {
                    this.openSwap(id);
                }
            }
        }
    }

    /**
     * Handle heading click
     * Make sure heading belongs to this accordion instance before toggling content
     *
     * @param {jQuery.Event} event Event
     * @protected
     */
    handleHeadingClick (event) {
        if (event.isDefaultPrevented()) return;

        const $heading = $(event.target).closest(this.options.headingSelector).not(this.options.contentSelector);
        const activeId = this.getId($heading);
        const $content = this.getContent(activeId);

        console.log(event.target, event.currentTarget, $heading);

        if ($content.length) {
            // Make sure we are not clicking on elements which shouldn't toggle accordion
            const $ignore  = $(event.target).closest(this.options.ignoreSelector);

            if (!$ignore.parents($heading).length) {
                this.toggle(activeId);
                event.preventDefault();
            }
        }
    }


    /*
     * API methods
     * ----------------------------------------------------
     */


    /**
     * Returns if item with given id is expanded
     *
     * @param {string} id Item id
     * @returns {boolean} True if item is exanded, otherwise false
     */
    isActive (id) {
        const options  = this.options;
        const $heading = this.getHeading(id);
        const $content = this.getContent(id);

        if (options.activeHeadingClassName && $heading.length) {
            // Classname may be multiple classnames
            return every(options.activeHeadingClassName.split(' '), (className) => {
                return $heading.hasClass(className);
            });
        } else if (options.hiddenAttribute && $content.length) {
            const attr = $content.attr(options.hiddenAttribute);
            return !attr || attr === 'false';
        } else if (options.expandedAttribute && $heading.length) {
            const attr = $heading.attr(options.expandedAttribute);
            return attr && attr === 'true';
        } else {
            return false;
        }
    }

    /**
     * Expand item
     *
     * @param {string} id Item id
     * @param {boolean} [withAnimation=true] Use animation
     */
    open (id, withAnimation = true) {
        if (typeof id === 'undefined') {
            if (!this.options.onlyOne) {
                each(this.getAllIds(), (id) => {
                    if (id && !this.isActive(id)) {
                        this.animate(id, 'in', withAnimation);
                    }
                });
            }
        } else {
            if (this.options.onlyOne) {
                let active = this.getAllActiveIds();

                if (active.indexOf(id) === -1) {
                    each(active, (id) => this.animate(id, 'out', withAnimation));
                }
            }

            if (id && !this.isActive(id)) {
                this.animate(id, 'in', withAnimation, () => {
                    this.scrollToContent(id);
                });
            }
        }
    }

    /**
     * Expand item without animation
     *
     * @param {string} id Item id
     */
    openSwap (id) {
        this.open(id, false);
    }

    /**
     * Collapse item
     *
     * @param {string} id Item id
     * @param {boolean} [withAnimation=true] Use animation
     */
    close (id, withAnimation = true) {
        if (typeof id === 'undefined') {
            if (!this.options.atLeastOne) {
                // Collapse all items
                each(this.getAllIds(), (id) => {
                    this.animate(id, 'out', withAnimation);
                });
            }
        } else {
            if (!this.options.atLeastOne || this.getAllActiveIds().length > 1) {
                if (id && this.isActive(id)) {
                    this.animate(id, 'out', withAnimation);
                }
            }
        }
    }

    /**
     * Collapse item without animation
     *
     * @param {string} id Item id
     */
    closeSwap (id) {
        this.close(id, false);
    }

    /**
     * Toggle item
     *
     * @param {string} id Item id
     * @param {boolean} [withAnimation=true] Use animation
     */
    toggle (id, withAnimation = true) {
        if (this.isActive(id)) {
            this.close(id, withAnimation);
        } else {
            this.open(id, withAnimation);
        }
    }

    /**
     * Toggle item without animation
     *
     * @param {string} id Item id
     */
    toggleSwap (id) {
        this.toggle(id, false);
    }

    /**
     * Returns accordion id from an element
     *
     * @param {jQuery} $element Heading element
     * @returns {string} Accordion id
     */
    getId ($element) {
        if ($element.is(this.getHeadings()) || $element.is(this.getContents())) {
            let id = $element.attr('data-accordion-heading-id');

            if (typeof id === 'undefined') {
                id = $element.attr('data-accordion-content-id');
            }
            if (typeof id === 'undefined') {
                id = $element.attr('aria-controls');
            }
            if (typeof id === 'undefined') {
                id = $element.attr('id');
            }

            return id;
        } else {
            return null;
        }
    }

    /**
     * Returns list of all content / heading IDs
     *
     * @returns {Array} List of IDs
     */
    getAllIds () {
        const headingIds = map(this.getHeadings().toArray(), element => {
            return this.getId($(element));
        });

        const contentIds = map(this.getContents().toArray(), element => {
            return this.getId($(element));
        });

        return uniq(headingIds.concat(contentIds));
    }

    /**
     * Returns list of all content / heading IDs which are active
     *
     * @returns {Array} List of IDs
     */
    getAllActiveIds () {
        return filter(this.getAllIds(), (id) => this.isActive(id));
    }

    /**
     * Returns true if there is a content with given id
     *
     * @param {string} id Tab id
     * @returns {boolean} True if content exists, otherwise false
     */
    hasContent (id) {
        return !!this.getHeading(id).length;
    }


    /*
     * Internal methods
     * ----------------------------------------------------
     */


    /**
     * Returns item index
     *
     * @param {string} id Item id
     * @returns {number} Item index
     */
    getIndex (id) {
        return this.getAllIds().indexOf(id);
    }

    /**
     * Returns content element by id
     *
     * @param {string} id Item id
     * @returns {jQuery} Content jQuery element
     */
    getContent (id) {
        return this.getContents().filter((_, element) => {
            return this.getId($(element)) === id;
        });
    }

    /**
     * Returns heading element by id
     *
     * @param {string} id Item id
     * @returns {jQuery} Heading jQuery element
     */
    getHeading (id) {
        return this.getHeadings().filter((_, element) => {
            return this.getId($(element)) === id;
        });
    }

    /**
     * Finds and returns all content elements
     * 
     * @returns {jQuery} List of content elements
     */
    getContents () {
        const $container = this.$container;
        const $subaccordions = $container.find(`[data-${ $.app.settings.namespace }="accordion"]`);
        return $container.find(this.options.contentSelector).not($subaccordions.find(this.options.contentSelector));
    }

    /**
     * Finds and returns all headings
     * 
     * @returns {jQuery} List of heading elements
     */
    getHeadings () {
        const $container = this.$container;
        const $subaccordions = $container.find(`[data-${ $.app.settings.namespace }="accordion"]`);
        return $container.find(this.options.headingSelector).not($subaccordions.find(this.options.headingSelector));
    }


    /*
     * Internal animation methods
     * ----------------------------------------------------
     */


    /**
     * Animate item
     *
     * @param {string} id Item id
     * @param {string} direction Either 'in' to expand element or 'out' to collapse
     * @param {boolean} [withAnimation=true] Use animation
     * @param {function} [callback] Callback when animation starts
     * @protected
     */
    animate (id, direction, withAnimation = true, callback = null) {
        // User has requested that the system minimize the amount of animation or motion it uses
        const reducedMotion = detect.isReducedMotion();

        if (withAnimation && !reducedMotion) {
            this.getContent(id).transitionstop(() => {
                this.animateHeading(id, direction);
                this.animateContent(id, direction);
                if (callback) callback();
            });
        } else {
            this.animateHeading(id, direction);
            this.swapContent(id, direction);
            if (callback) callback();
        }
    }

    /**
     * Animate item heading
     *
     * @param {string} id Item id
     * @param {string} direction Either 'in' to expand element or 'out' to collapse
     * @protected
     */
    animateHeading (id, direction) {
        const $heading = this.getHeading(id);
        const headingClassName = this.options.activeHeadingClassName;
        const headingParentClassName = this.options.activeHeadingParentClassName;
        const headingParentSelector = this.options.headingParentSelector;
        const expandedAttribute = this.options.expandedAttribute;

        if (direction === 'in') {
            $heading.addClass(headingClassName).attr(expandedAttribute, 'true');
            $heading.closest(headingParentSelector).addClass(headingParentClassName);

            const headingAnimation = this.options.animationHeadingIn;
            if (headingAnimation) {
                $heading.transition(headingAnimation);
            }
        } else {
            $heading.removeClass(headingClassName).attr(expandedAttribute, 'false');
            $heading.closest(headingParentSelector).removeClass(headingParentClassName);

            const headingAnimation = this.options.animationHeadingOut;
            if (headingAnimation) {
                $heading.transition(headingAnimation);
            }
        }
    }

    /**
     * Animate item content
     *
     * @param {string} id Item id
     * @param {string} direction Either 'in' to expand element or 'out' to collapse
     * @protected
     */
    animateContent (id, direction) {
        const $content = this.getContent(id);
        const $container = this.$container;

        if (direction === 'in') {
            let height = null;

            if (this.options.animationHeight) {
                height = $content.css({'display': 'block', 'height': 'auto', 'overflow': 'hidden'}).outerHeight();
                $content.css('display', '');
                this.heightDiffs[this.getIndex(id)] = height;
            }

            $content.addClass(this.options.activeContentClassName);
            $content.parent().addClass(this.options.activeAccordionClassName).removeClass(this.options.inactiveAccordionClassName);

            // Animate height
            const animationHeight = this.options.animationHeight ? {
                'before':     $content => $content.addClass('animation--height').css('height', 0),
                'transition': $content => $content.css('height', height),
                'after':      $content => {
                    $content
                        .removeClass('animation--height')
                        .css('height', '')
                        .css('overflow', '');
                }
            } : null;

            // Animate content
            const animationName = this.options.animationIn;

            $content.transition(animationName, animationHeight, {
                'before': $content => {
                    $content.attr(this.options.hiddenAttribute, false);
                    $container.trigger('accordion.open');
                },
                'after': () => {
                    $container.trigger('accordion.opened');
                    $container.trigger('appear');
                }
            });
        } else {
            let height = null;

            if (this.options.animationHeight) {
                height = $content.css({'overflow': 'hidden'}).outerHeight();
                this.heightDiffs[this.getIndex(id)] = -height;
            }

            // Animate height
            const animationHeight = this.options.animationHeight ? {
                'before':     $content => $content.addClass('animation--height').css('height', height),
                'transition': $content => $content.css('height', 0),
                'after':      $content => {
                    $content
                        .removeClass('animation--height')
                        .css('height', '')
                        .css('overflow', '');
                }
            } : null;

            // Animate content
            const animationName = this.options.animationOut;

            $content.transition(animationName, animationHeight, {
                'before':     () => {
                    $container.trigger('accordion.close');
                    $content.parent().removeClass(this.options.activeAccordionClassName).addClass(this.options.inactiveAccordionClassName);
                },
                'after':      $content => {
                    $content.attr(this.options.hiddenAttribute, true);

                    $content.removeClass(this.options.activeContentClassName);

                    $container.trigger('accordion.closed');
                    $container.trigger('appear');
                }
            });
        }
    }

    /**
     * Show / hide item content without animation
     *
     * @param {string} id Item id
     * @param {string} direction Either 'in' to expand element or 'out' to collapse
     * @param {boolean} [silent=false] Swap content without triggering events
     * @protected
     */
    swapContent (id, direction, silent = false) {
        const $content = this.getContent(id);

        if (direction === 'in') {
            $content.addClass(this.options.activeContentClassName);
            $content.attr(this.options.hiddenAttribute, false);

            if (!silent) {
                this.$container.trigger('accordion.opened');
                this.$container.trigger('appear');
            }
        } else {
            $content.removeClass(this.options.activeContentClassName);
            $content.attr(this.options.hiddenAttribute, true);

            if (!silent) {
                this.$container.trigger('accordion.closed');
                this.$container.trigger('appear');
            }
        }
    }

    /**
     * Scroll to the content if needed
     *
     * @protected
     */
    scrollToContent (id) {
        if (this.options.autoScroll) {
            const scroll = $(window).scrollTop();
            const heightDiffs = this.heightDiffs;
            const contentIndex = this.getIndex(id);
            this.heightDiffs = [];

            const contentOffset = reduce(heightDiffs.slice(0, contentIndex), (result, value) => result + (value || 0), 0);
            const $content = this.getContent(id);
            const $heading = this.getHeading(id);
            const contentBox = $content.get(0).getBoundingClientRect();
            const headingBox = $heading.length ? $heading.get(0).getBoundingClientRect() : contentBox;


            const contentPosition = {
                'top': scroll + headingBox.top + contentOffset - this.options.autoScrollTopMargin,
                'bottom': scroll + contentBox.top + heightDiffs[contentIndex] + contentOffset + this.options.autoScrollBottomMargin
            };

            const viewportPosition = {
                'top': scroll,
                'bottom': scroll + window.innerHeight
            };

            if (scroll !== contentPosition.top && (contentPosition.top < viewportPosition.top || contentPosition.bottom > viewportPosition.bottom)) {
                if (scroll > contentPosition.top) {
                    $(window).scrollTo(contentPosition.top);
                } else {
                    // A little delay to make sure content change has started, otherwise if viewport is scrolled to the
                    // bottom scroll animation down will not run
                    setTimeout(() => {
                        $(window).scrollTo(contentPosition.top);
                    }, 60);
                }
            }
        }
    }
}

$.fn.accordion = createPlugin(Accordion, {
    'namespace': 'accordion',
    'api': [
        'open', 'openSwap', 'close', 'closeSwap', 'toggle', 'toggleSwap',
        'getId', 'getAllIds', 'getAllActiveIds', 'isActive', 'hasContent',
        'instance'
    ]
});

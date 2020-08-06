import $ from 'jquery';
import createPlugin from 'jquery-plugin-generator';
import assign from 'lodash/assign';
import map from 'lodash/map';
import detect from 'util/detect';

import 'util/jquery.returnkey';
import 'util/animation/jquery.transition';
import 'components/jquery.transition-sequences';

import ResponsiveComponent from 'components/responsive-component';


/**
 * Tabs component
 */
export default class Tabs extends ResponsiveComponent {

    static get Defaults () {
        return assign({}, ResponsiveComponent.Defaults, {
            // CSS selector to find an tabs headings
            // Complex selector to prevent matching accordion heading
            'headingSelector': '[aria-controls]:not([data-accordion-heading-id]), [data-tabs-heading-id]',

            // CSS selector to find an tabs contents
            'contentSelector': '[role="tabpanel"], [data-tabs-content-id]',

            // CSS selector to find "Next" and "Previous" arrows, allows switching between tabs
            // using arrows
            'arrowNextSelector': '.js-tabs-next',
            'arrowPrevSelector': '.js-tabs-prev',

            // CSS selector to find element for counter text showing currently selected tab index
            // and tab count "1 / 10"
            'counterSelector': '.js-tabs-counter',

            // CSS input selector, input value is updated with tab id when tabs change and
            // tabs are changed when input value changes
            'inputSelector': null,

            // CSS classname which is added to the active tab heading
            'activeHeadingClassName': 'is-active',

            // Attribute which is set on active tab heading
            'selectedAttribute': 'aria-selected',

            // Attribute which is set on inactive tab content
            'hiddenAttribute': 'aria-hidden',

            // Use animations
            'animate': true,

            // Use animation to change tab container height for smoother transition between tabs
            'animateHeight': true,

            // Animation to show tab content if it's after currently selected tab content
            'animationInRight': 'animation--fade-in',

            // Animation to show tab content if it's before currently selected tab content
            'animationInLeft': 'animation--fade-in',

            // Animation to hide tab content if it's before newly selected tab content
            'animationOutRight': 'animation--fade-out',

            // Animation to hide tab content if it's after newly selected tab content
            'animationOutLeft': 'animation--fade-out'
        });
    }

    init () {
        const options    = this.options;
        const $container = this.$container;

        if (detect.isReducedMotion()) {
            this.options.animate = false;
        }

        this.$input      = options.inputSelector ? $(options.inputSelector) : $();
        this.$contents   = this.getContents();
        this.activeId    = this.getActiveItemId();
        this.hashReady   = false;

        this.$next       = options.arrowNextSelector ? $container.find(options.arrowNextSelector) : $();
        this.$prev       = options.arrowPrevSelector ? $container.find(options.arrowPrevSelector) : $();
        this.$counter    = options.counterSelector ? $container.find(options.counterSelector) : $();
    }

    enable () {
        if (super.enable()) {
            this.activeId = this.getActiveItemId();

            const ns = this.ns;

            if (this.$input.length) {
                // Input can control tabs, there could be no headings, eg. checkout page
                this.$input.on(`change.${ ns }`, this.handleInputChange.bind(this));

                // Make sure UI state matches value
                const id = this.getIdFromInput(this.$input);

                if ((id || id === '') && this.activeId != id) {
                    this.open(id);
                }
            }

            this.$container.on(`click.${ ns } returnkey.${ ns }`, this.options.headingSelector, this.handleHeadingClick.bind(this));

            // Arrow navigation
            this.$next.on(`click.${ ns } returnkey.${ ns }`, this.next.bind(this));
            this.$prev.on(`click.${ ns } returnkey.${ ns }`, this.prev.bind(this));

            // Open item based on hash value
            this.handleHashChange();
        }
    }

    disable () {
        if (super.disable()) {
            // Page loaded with accordion disabled, prevent accordion toggle when it becomes
            // enabled
            this.hashReady = true;

            // Detach listeners
            const ns = this.ns;
            this.$container.add(this.$input).add(this.$next).add(this.$prev).off(`.${ ns }`);
        }
    }

    /*
     * API methods
     * ----------------------------------------------------
     */

    /**
     * Returns tab count
     */
    getCount () {
        const ids = {};

        // Filter only unique contents by ids
        return this.getContents().filter((_index, content) => {
            const id = this.getId($(content));

            if (id in ids) {
                return false;
            } else {
                ids[id] = true;
                return true;
            }
        }).length;
    }

    /**
     * Open next tab based on DOM order
     */
    next () {
        const $contents = this.getContents();
        const index = (this.getIndex(this.activeId) + 1) % $contents.length;
        const $content = $contents.eq(index);
        const nextId = this.getId($content);

        this.open(nextId);
    }

    /**
     * Open previous tab based on DOM order
     */
    prev () {
        const $contents = this.getContents();
        const index = (this.getIndex(this.activeId) - 1 + $contents.length) % $contents.length;
        const $content = $contents.eq(index);
        const prevId = this.getId($content);

        this.open(prevId);
    }

    /**
     * Open tab by id
     *
     * @param {string} active Tab id
     */
    open (active) {
        if (this.options.animate) {
            const prevActive = this.activeId;
            if (prevActive !== active) {
                const promise = $.Deferred();

                this.activeId = active;
                this.updateCounter();

                this.getContents().add(this.$container).transitionstop(() => {
                    this.animate(active, prevActive).then(() => {
                        promise.resolve();
                    });
                });

                $.when(promise).then(() => {
                    this.$container.trigger('tabchanged', {'id': active, 'previous': prevActive});
                    this.$container.trigger('appear');
                });
            }
        } else {
            this.swap(active);
        }
    }

    /**
     * Open tab by index
     *
     * @param {number} index Tab index
     */
    openByIndex (index) {
        const $contents = this.getContents();
        const $content = $contents.eq(index);
        const id = this.getId($content);

        this.open(id);
    }

    /**
     * Instantly open tab without animation
     *
     * @param {string} active Tab id
     */
    swap (active) {
        const prevActive = this.activeId;

        if (prevActive !== active) {
            this.activeId = active;

            const $content = this.getContent(active);
            const $prevContent = this.getContent(prevActive);

            if ($content.length) {
                $content.attr(this.options.hiddenAttribute, false);
                $prevContent.attr(this.options.hiddenAttribute, true);
            }

            // Animate headings
            this.animateHeading(active, 'in');
            this.animateHeading(prevActive, 'out');

            // Value
            this.updateInput(active);

            this.$container.trigger('tabchange', {'id': active, 'previous': prevActive});
            this.$container.trigger('tabchanged', {'id': active, 'previous': prevActive});
            this.$container.trigger('appear');
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
                const id = document.location.hash.replace('#', '');

                if (id && this.hasContent(id)) {
                    this.open(id);
                }
            }
        }
    }

    /**
     * Open tab on heading click
     *
     * @param {object} event Event
     * @protected
     */
    handleHeadingClick (event) {
        // Ignore clicks on arrows, arrows may have aria-controls attributes for ARIA purposes
        const $arrow = $(event.target).closest(`${ this.options.arrowNextSelector }, ${ this.options.arrowPrevSelector }`);

        if (!$arrow.length) {
            const $heading = $(event.currentTarget).not(this.options.contentSelector);
            const activeId = this.getId($heading);

            // Link inside the heading, ignore click on link which is not a hash link
            const $link = $(event.target).closest('a[href]:not([href^="#"])');
            if ($link && !$link.is($heading) && $link.closest($heading).length) {
                return;
            }

            if (typeof activeId !== 'undefined') {
                if (this.$contents.length) {
                    if (!this.hasContent(activeId)) {
                        return;
                    }
                } else if (!this.$input.length) {
                    // There are no contents and no input, invalid heading
                    return;
                }

                if (this.activeId !== activeId) {
                    if (this.$contents.length) {
                        if (this.hasContent(activeId)) {
                            this.open(activeId);
                        }
                    } else if (this.$input.length) {
                        this.open(activeId);
                    }
                }

                event.preventDefault();
            }
        }
    }

    /**
     * Open tab on input change
     *
     * @param {object} event Event
     * @protected
     */
    handleInputChange (event) { // eslint-disable-line
        const activeId = this.getIdFromInput(this.$input);

        if (this.activeId !== activeId) {
            this.open(activeId);
        }
    }


    /*
     * Internal methods
     * ----------------------------------------------------
     */


    /**
     * Returns current active tab id
     *
     * @returns {string} Active tab id
     */
    getActiveItemId () {
        const options = this.options;
        const headingId = this.getId(this.getHeadingByClassName(options.activeHeadingClassName));

        if (typeof headingId === 'undefined') {
            // There is no active heading, try locating content
            const $active = this.$contents.filter(function () {
                const hidden = $(this).attr(options.hiddenAttribute);
                return !hidden || hidden === 'false';
            });

            return this.getId($active);
        } else {
            return headingId;
        }
    }

    /**
     * Returns heading matching space separated classname, eg. from options
     *
     * @param {string} className Space separated classname
     * @returns {object} Heading element
     */
    getHeadingByClassName (className) {
        if (className) {
            const selector = '.' + className.split(' ').join('.');
            return this.$container.find(this.options.headingSelector).not(this.options.contentSelector).filter(selector);
        } else {
            return $();
        }
    }

    /**
     * Returns tab id from an element
     *
     * @param {object} $element Element
     * @returns {string} Tab id
     */
    getId ($element) {
        let id = $element.attr('aria-controls');

        if (typeof id === 'undefined') {
            id = $element.attr('data-tabs-heading-id');
        }
        if (typeof id === 'undefined') {
            id = $element.attr('data-tabs-content-id');
        }

        if (typeof id === 'undefined') {
            id = $element.attr('id');
        }

        return id;
    }

    /**
     * Returns tab id from input
     *
     * @param {object} $input Input
     * @returns {string} Tab id
     */
    getIdFromInput ($input) {
        let value = '';

        if ($input.is(':checkbox,:radio')) {
            value = $input.filter(':checked').val();
        } else {
            value = $input.val();
        }
        return this.getId(this.getHeading(value)) || this.getId(this.getContent(value));
    }

    /**
     * Returns input value from tab id
     *
     * @param {string} id Tab id
     * @returns {string|null} Input value
     */
    getInputValueFromId (id) {
        const $heading = this.getHeading(id);
        return $heading.attr('data-input-value') || this.getId($heading) || this.getId(this.getContent(id));
    }


    /**
     * Returns element index by id
     *
     * @param {string} id Tab id
     * @returns {number} Tab index
     */
    getIndex (id) {
        if (typeof id === 'undefined' && id !== this.activeId) {
            return this.getIndex(this.activeId);
        } else {
            return this.$contents.index(this.getContent(id));
        }
    }

    /**
     * Returns true if there is a content with given id
     *
     * @param {string} id Tab id
     * @returns {boolean} True if content exists, otherwise false
     */
    hasContent (id) {
        return !!this.getContent(id).length;
    }

    /**
     * Return all content elements, but filters out all contents beloging to
     * tabs nested deeper inside
     *
     * @returns {object} Contents tabs
     * @protected
     */
    getContents () {
        const $contents = this.$container.find(this.options.contentSelector);

        return $contents.filter(function () {
            return $(this).parent().closest($contents).length === 0;
        });
    }

    /**
     * Returns content by id
     * Content element must have id or data-tabs-content-id attribute with given value
     *
     * @param {string} id Tab id
     * @returns {object} Content element
     */
    getContent (id) {
        return (id || id === '')
            ? String(id).match(/^[a-z0-9-_]+$/i)
                ? this.$contents.filter(`#${ id }, [data-tabs-content-id="${ id }"]`)
                : this.$contents.filter(`[data-tabs-content-id="${ id }"]`)
            : $();
    }

    getHeading (id) {
        return (id || id === '')
            ? this.$container.find('[aria-controls="' + id + '"], [data-tabs-heading-id="' + id + '"], [data-input-value="' + id + '"]').not(this.options.contentSelector)
            : $();
    }

    /**
     * Update input value
     *
     * @param {string} active Tab id
     * @protected
     */
    updateInput (active) {
        // Change input value
        const $input = this.$input;

        if ($input.length) {
            const id = this.getInputValueFromId(active) || active;

            $input.filter(':checkbox,:radio').each((_, input) => {
                $(input).prop('checked', input.value == id)
            });

            $input.not(':checkbox,:radio').val(id);
            $input.change();
        }
    }

    /**
     * Update counter text
     */
    updateCounter () {
        const count = this.getCount();
        const index = this.getIndex(this.activeId);

        this.$counter.text(`${ index + 1 } / ${ count }`);
    }


    /*
     * Internal animation methods
     * ----------------------------------------------------
     */


    /**
     * Animate from one tab to another
     */
    animate (active, prevActive) {
        const promise = $.Deferred();
        const prevIndex = this.getIndex(prevActive);
        const index = this.getIndex(active);
        const animationDirectionIn = index > prevIndex ? 'right' : 'left';
        const animationDirectionOut = index > prevIndex ? 'left' : 'right';

        // Animate headings
        this.animateHeading(active, 'in', animationDirectionIn);
        this.animateHeading(prevActive, 'out', animationDirectionOut);

        // Animate contents, synchronized animation and setting animation complete state
        $.when(
            this.animateContent(active, 'in', animationDirectionIn),
            this.animateContent(prevActive, 'out', animationDirectionOut),
            this.animateHeight(active, prevActive)
        ).then(() => {
            this.finalizeContent(active, 'in', animationDirectionIn);
            this.finalizeContent(prevActive, 'out', animationDirectionOut);
            this.finalizeHeight(active, prevActive);
            promise.resolve();
        });

        this.updateInput(active);

        return promise.promise();
    }

    // eslint-disable-next-line no-unused-vars
    animateHeading (id, animationState, animationDirection) {
        const $heading = id || id === '' ? this.getHeading(id) : $();

        if ($heading.length) {
            if (this.options.activeHeadingClassName) {
                $heading.toggleClass(this.options.activeHeadingClassName, animationState === 'in');
            }

            if (animationState === 'in') {
                $heading.attr(this.options.selectedAttribute, 'false');
            } else {
                $heading.attr(this.options.selectedAttribute, 'true');
            }
        }
    }

    animateContent (id, animationState, animationDirection) {
        const promise = $.Deferred();
        const $content = id || id === '' ? this.getContent(id) : $();

        if ($content.length) {
            if (animationState === 'in') {
                const animationName = this.getAnimationName(animationState, animationDirection);


                $content.transitionstop(() => {
                    $content.transition({
                        'before':     $content => $content.addClass(`${ animationName } ${ animationName }--inactive tabs-contents__content--animating-in`).attr(this.options.hiddenAttribute, false),
                        'transition': $content => $content.removeClass(`${ animationName }--inactive`).attr(this.options.hiddenAttribute, false),
                        'after':      () => promise.resolve()
                    }, {
                        'before': $content => $content.find('.js-tabs-text').transition('title')
                    });
                });
            } else {
                const animationName = this.getAnimationName(animationState, animationDirection);

                $content.transitionstop(() => {
                    $content.transition({
                        'before':     $content => $content.addClass(`${ animationName }`),
                        'transition': $content => $content.addClass(`${ animationName }--active`),
                        'after':      () => promise.resolve()
                    });
                });
            }
        } else {
            return promise.resolve();
        }

        return promise.promise();
    }

    finalizeContent (id, animationState, animationDirection) {
        const $content = id ? this.getContent(id) : $();

        if ($content.length) {
            const animationName = this.getAnimationName(animationState, animationDirection);

            if (animationState === 'in') {
                $content.removeClass(`${ animationName } ${ animationName }--inactive tabs-contents__content--animating-in`);
            } else {
                $content.removeClass(`${ animationName } ${ animationName }--active`).attr(this.options.hiddenAttribute, true);
            }
        }
    }

    animateHeight (active, prevActive) {
        const $activeContent  = active     ? this.getContent(active) : $();
        const $prevContent    = prevActive ? this.getContent(prevActive) : $();
        const $container      = ($activeContent.length ? $activeContent : $prevContent).parent();

        if (this.options.animateHeight) {
            const promise         = $.Deferred();

            // Get sizes
            $container.css('overflow', 'hidden').addClass('tabs-height-test');

            const heightFrom = map($container.toArray(), (container) => $(container).height() || 0);
            let   heightTo    = 0;

            if (active) {
                $activeContent.css('overflow', 'hidden');
                $activeContent.css('display', 'block');
            }

            // Events, trigger while element is visible, but before animation to make sure
            // element is in the DOM and all plugins attached to these events have elements visible
            $container.trigger('tabchange', {'id': active, 'previous': prevActive});
            $container.trigger('appear');

            if (active) {
                heightTo = map($container.toArray(), (container) => $(container).find($activeContent).height() || 0);
                $activeContent.css('overflow', '').css('display', '');
            }

            // Hide
            $container.css('overflow', '').removeClass('tabs-height-test');

            // Animate
            $container.transitionstop(() => {
                // Support for multiple containers
                $container.each((index, container) => {
                    if (heightFrom[index] !== heightTo[index]) {
                        const $container = $(container);

                        $container.transition({
                            'before':     $container => $container.css('height', heightFrom[index]).addClass('animation--height'),
                            'transition': $container => $container.css('height', heightTo[index]),
                            'after':      () => promise.resolve()
                        });
                    } else {
                        promise.resolve();
                    }
                });
            });

            return promise.promise();
        } else {
            $container.trigger('tabchange', {'id': active, 'previous': prevActive});
            $container.trigger('appear');

            return $.Deferred().resolve();
        }
    }

    finalizeHeight (active, prevActive) {
        const $activeContent  = active     ? this.getContent(active) : $();
        const $prevContent    = prevActive ? this.getContent(prevActive) : $();
        const $container      = ($activeContent.length ? $activeContent : $prevContent).parent();

        if ($container.length) {
            $container.css('height', '').css('overflow', '').removeClass('animation--height');
        }
    }

    /**
     * Returns animation classname
     *
     * @param {string} animationState State, either 'in' or 'out'
     * @param {string} animationDirection Direction, either 'left' or 'right'
     * @returns {string} Animation classname
     * @protected
     */
    getAnimationName (animationState, animationDirection) {
        const options = this.options;

        if (animationState === 'in') {
            return animationDirection === 'right' ? options.animationInRight : options.animationInLeft;
        } else {
            return animationDirection === 'right' ? options.animationOutRight : options.animationOutLeft;
        }
    }
}


$.fn.tabs = createPlugin(Tabs, {
    'api': ['open', 'openByIndex', 'swap', 'getContent', 'getHeading', 'getActiveItemId', 'getCount', 'getIndex', 'hasContent', 'next', 'prev', 'instance']
});

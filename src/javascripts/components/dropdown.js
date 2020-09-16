/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';
import assign from 'lodash/assign';

import 'util/animation/jquery.transition';
import 'util/jquery.destroyed';
import detect from 'util/detect';
import namespace from 'util/namespace';
import { createPopper, reference } from '@popperjs/core';


const MOUSE_LEAVE_DELAY = 200;


/**
 * Dropdown component
 */
class Dropdown {

    static get Defaults () {
        return {
            // Popper placement
            'placement': 'bottom-start',

            // Popper offset
            'offset': null,

            // Parent element selector to which add dropdown menu
            'container': null,

            // Toggle element, optional, will use menuToggleSelector selector if blank
            'toggle': null,

            // Menu element, optional, will use menuSelector selector if blank
            'menu': null,

            // Use overlay over the page, only if 'container' is used
            'withOverlay': false,

            // CSS selectors
            'menuToggleSelector': '.dropdown__toggle',
            'menuSelector': '.dropdown__menu',
            'menuScrollableSelector': '.dropdown__menu__scrollable',
            'menuContentSelector': '.dropdown__menu__content',
            'arrowSelector': '.dropdown__menu__arrow',
            'itemSelector': '.dropdown__item',
            'closeSelector': '.js-dropdown-close',

            'referenceSelector': null,

            // Trigger events, either 'click' or 'hover'
            'trigger': 'click',

            // Auto close on click outside
            'autoClose': true,

            // Event names
            'eventShow': 'show.dropdown',
            'eventShown': 'shown.dropdown',
            'eventHide': 'hide.dropdown',
            'eventHidden': 'hidden.dropdown',

            // Animations
            'animationIn': 'dropdown-in',
            'animationOut': 'dropdown-out',

            // Position classnames
            'classNamePlacementRight': 'dropdown--right',
            'classNamePlacementLeft': 'dropdown--left',
            'classNamePlacementTop': 'dropdown--top',

            // State classnames
            'classNameOpen': 'is-open',
            'classNameDisabled': 'is-disabled',
            'classNameActive': 'is-active',
            'classNameFocused': 'is-focused',

            'classNameToggleActive': 'is-active',

            'classNameIndicator': 'dropdown__menu__indicator',
            'classNameIndicatorDropdown': 'dropdown__menu__indicator--dropdown',
        };
    }

    /**
     * Constructor
     *
     * @param {JQuery} $container Container element
     * @param {object} opts Plugin options
     */
    constructor ($container, opts) {
        const options = this.options = assign({}, this.constructor.Defaults, opts);

        if (options.trigger === 'hover' && !detect.hasHoverSupport()) {
            options.trigger = 'click';
        }

        this.$container = $container;
        this.$toggle = options.toggle || $container.children(options.menuToggleSelector).eq(0);
        this.$reference = this.$toggle;
        this.$menu = options.menu || $container.children(options.menuSelector);
        this.$menuScrollable = this.$menu.children(options.menuScrollableSelector);
        this.$menuContent = this.$menuScrollable.length ? this.$menuScrollable.children(options.menuContentSelector) : this.$menu.children(options.menuContentSelector);
        this.$arrow = this.$menuContent.children(options.arrowSelector);
        this.$overlay = null;
        this.$indicator = $(`<div class="${ options.classNameIndicator }"></div>`).prependTo(this.$menuContent);
        this.indicatorPositioned = false;

        this.$focused = null;
        this.mouseLeaveTimer = null;
        this.popper = false;

        this.ns = namespace();
        this.open = $container.attr('aria-expanded') == 'true';

        this.position =
            options.placement.indexOf('bottom') !== -1 ? 'bottom' :
            options.placement.indexOf('top') !== -1 ? 'top' :
            options.placement.indexOf('left') !== -1 ? 'left' : 'right';

        // Reference element relative to which popover is aligned
        if (options.referenceSelector) {
            let $reference = $container.find(options.referenceSelector);
            if (!$reference.length) {
                $reference = $container.closest(options.referenceSelector);
            }
            if (!$reference.length) {
                $reference = $(options.referenceSelector);
            }
            if ($reference.length) {
                this.$reference = $reference;
            }
        }

        // Events
        const $toggle = this.$toggle;

        $container.on('destroyed', this.handleDestroy.bind(this));

        $toggle
            .on('keydown', this.handleToggleKey.bind(this));

        if (options.trigger === 'hover') {
            $toggle
                .on('click', this.show.bind(this))
                .on('mouseenter', this.handleMouseEnter.bind(this));

            $container
                .on('mouseleave', this.handleMouseLeave.bind(this));
        } else {
            $toggle
                .on('click', this.toggle.bind(this));
        }

        // Position classnames
        this.updatePositionClassName();
    }

    /**
     * Toggle dropdown
     *
     * @param {JQuery.ClickEvent} [event] Event
     */
    toggle (event) {
        if (this.open) {
            this.hide(event);
        } else {
            this.show(event);
        }
    }

    /**
     * Show dropdown
     *
     * @param {JQuery.ClickEvent} [event] Optional event
     */
    show (event) {
        if (!this.isDisabled() && !this.open) {
            const { eventShow, itemSelector, closeSelector, classNameOpen, classNameToggleActive } = this.options;
            const namespace = this.ns;

            // Trigger event and show dropdown only if event wasn't prevented
            const showEventObject = $.Event(eventShow);
            this.$container.trigger(showEventObject);

            if (!showEventObject.isDefaultPrevented()) {
                this.open = true;

                this.$container.addClass(classNameOpen);
                this.$toggle.addClass(classNameToggleActive).attr('aria-expanded', true);

                this.createOverlay();
                this.createPopper();

                // Show overlay
                if (this.$overlay) {
                    this.$overlay.transitionstop(() => {
                        this.$overlay.transition('fade-in');
                    });
                }

                // Show dropdown menu
                this.$menu.transitionstop(() => {
                    this.$menu.transition(this.options.animationIn, {
                        'before': this.onShow.bind(this, event),
                        'after': this.onShown.bind(this, event),
                    });
                });

                // Add event listeners
                $(document)
                    .on(`click.${ namespace }`, this.handleDocumentClick.bind(this))
                    .on(`keydown.${ namespace }`, this.handleDocumentKey.bind(this));

                this.$menu
                    .on(`focus.${ namespace } mouseenter.${ namespace }`, itemSelector, this.handleItemMouseEnter.bind(this))
                    .on(`keydown.${ namespace }`, itemSelector, this.handleItemKey.bind(this))
                    .on(`keydown.${ namespace }`, this.handleMenuKey.bind(this))
                    .on(`click.${ namespace } returnkey.${ namespace }`, closeSelector, this.hide.bind(this));

                // Prevent clicking on a button from submitting a form or link navigation
                if (event && event.type === 'click') {
                    event.preventDefault();
                }
            }
        }
    }

    /**
     * Focus item when dropdown is shown
     *
     * @param {JQuery.ClickEvent} [event] Optional event
     * @protected
     */
    onShow (event) {
        this.updatePopper();

        if (event && event.type === 'keydown') {
            // Dropdown was opened using keyboard, focus active item
            // or first item we have
            if (!this.focusActiveItem()) {
                this.focusFirstItem();
            }
        } else {
            // Dropdown was opened using mouse, focus only if there is
            // an active item
            this.focusActiveItem();
        }
    }

    /**
     * After dropdown has been shown trigger 'shown' event
     *
     * @param {JQuery.ClickEvent} [event] Optional event
     * @protected
     */
    onShown (event) {
        const { eventShown } = this.options;
        this.$container.trigger(eventShown);
    }

    /**
     * Hide dropdown
     *
     * @param {JQuery.ClickEvent} [event] Optional event
     * @protected
     */
    hide (event) {
        if (!this.isDisabled() && this.open) {
            const { eventHide, classNameOpen, classNameToggleActive } = this.options;
            const namespace = this.ns;
            const hideEventObject = $.Event(eventHide);
            this.$container.trigger(hideEventObject);

            if (!hideEventObject.isDefaultPrevented()) {
                this.open = false;

                this.$container.removeClass(classNameOpen);
                this.$toggle.removeClass(classNameToggleActive).attr('aria-expanded', false);

                // Hide overlay
                if (this.$overlay) {
                    this.$overlay.transitionstop(() => {
                        this.$overlay.transition('fade-out');
                    });
                }

                // Hide dropdown menu
                this.$menu.transitionstop(() => {
                    this.$menu.transition(this.options.animationOut, {
                        'after': this.onHidden.bind(this, event),
                    });
                });

                // Focused element inside the dropdown
                if ($(document.activeElement).closest(this.$menu).length) {
                    this.$toggle.get(0).focus();
                }

                $(document).off(`.${ namespace }`);
                this.$menu.off(`.${ namespace }`);

                // Prevent clicking on a button from submitting a form or link navigation
                if (event && event.type === 'click') {
                    event.preventDefault();
                }
            }
        }
    }

    /**
     * After dropdown has been hidden trigger 'hidden' event and reset
     * indicator
     *
     * @param {JQuery.ClickEvent} [event] Optional event
     * @protected
     */
    onHidden (event) {
        const { eventHidden } = this.options;

        this.$container.trigger(eventHidden);

        // Destroy popper
        this.destroyPopper();

        // Reset indicator
        this.positionIndicator(null);

        // Unfocus item
        if (this.$focused) {
            this.blurItem(this.$focused);
            this.positionIndicator();
        }
    }

    /**
     * Returns list of all items
     *
     * @returns {JQuery} List of all items
     * @protected
     */
    getItems () {
        const { itemSelector, menuSelector, classNameDisabled } = this.options;
        const $menu = this.$menu;
        const $items = $menu.find(itemSelector).not($menu.find(`${ menuSelector} ${ itemSelector }`)).not(`.${ classNameDisabled }`);

        // Filter only visible items
        return $items.filter((_, element) => {
            return !!element.offsetParent;
        });
    }

    /**
     * Returns active item
     *
     * @returns {JQuery} Active item
     * @protected
     */
    getActiveItem () {
        return this.getItems().filter(`.${ this.options.classNameActive }`);
    }

    /**
     * Returns next item
     *
     * @param {JQuery} $item Item for which to return next item
     * @returns {JQuery} Next item
     * @protected
     */
    getNextItem ($item) {
        const $items = this.getItems();

        if ($item && $item.length) {
            const index = $items.index($item);
            const nextIndex = index === -1 ? 0 : (index + 1) % $items.length;
            return $items.eq(nextIndex);
        }  else {
            return $items.eq(0);
        }
    }

    /**
     * Returns previous item
     *
     * @param {JQuery} $item Item for which to return previous item
     * @returns {JQuery} Previous item
     * @protected
     */
    getPreviousItem ($item) {
        const $items = this.getItems();

        if ($item && $item.length) {
            const index = $items.index($item);
            const previousIndex = index === -1 ? 0 : (index + $items.length - 1) % $items.length;
            return $items.eq(previousIndex);
        }  else {
            return $items.eq(-1);
        }
    }

    /**
     * Returns true if dropdown is disabled
     *
     * @returns {boolean} True if disabled, otherwise false
     * @protected
     */
    isDisabled () {
        const $container = this.$container;
        return $container.hasClass(this.options.classNameDisabled) || $container.prop('disabled');
    }

    /**
     * Clean up dropdown
     *
     * @protected
     */
    handleDestroy () {
        // Cleanup global events
        $(window).add(document).off(`.${ this.ns }`);
    }


    /**
     * Focus / blur items
     * ------------------------------------------------------------------------
     */

    /**
     * Focus item element
     *
     * @param {JQuery} $item Item element
     */
    focusItem ($item) {
        const { classNameFocused } = this.options;

        if (this.$focused && this.$focused.length && !this.$focused.is($item)) {
            this.blurItem(this.$focused);
        }

        if ($item && $item.length) {
            if (!this.$focused || !this.$focused.is($item)) {
                this.$focused = $item;
                this.positionIndicator($item);
                $item.addClass(classNameFocused);
            }

            if (document.activeElement !== $item.get(0)) {
                $item.get(0).focus();
            }
        }
    }

    /**
     * Remove focus from item element
     *
     * @param {JQuery} $item Item element
     */
    blurItem ($item) {
        const { classNameFocused, menuToggleSelector } = this.options;

        $item.removeClass(classNameFocused);

        if ($item.is(menuToggleSelector)) {
            const $dropdown = $item.parent();
            if ($.app.hasPlugin($dropdown, 'dropdown')) {
                $dropdown.dropdown('hide');
            }
        }

        if (this.$focused && this.$focused.is($item)) {
            this.$focused = null;
        }
    }

    /**
     * Focus active item in the list
     *
     * @returns {boolean} True if active item was focused, otherwise false
     */
    focusActiveItem () {
        const $active = this.getActiveItem();

        if ($active.length) {
            this.focusItem($active);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Focus first item in the list
     */
    focusFirstItem () {
        const $first = this.getItems().eq(0);

        if ($first.length) {
            this.focusItem($first);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Focus last item in the list
     */
    focusLastItem () {
        const $last = this.getItems().eq(-1);

        if ($last.length) {
            this.focusItem($last);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Focus next item in the list
     */
    focusNextItem () {
        const $nextItem = this.getNextItem(this.$focused);

        if ($nextItem.length) {
            this.focusItem($nextItem);
        }
    }

    /**
     * Focus previous item in the list
     */
    focusPreviousItem () {
        const $previousItem = this.getPreviousItem(this.$focused);

        if ($previousItem.length) {
            this.focusItem($previousItem);
        }
    }

    /**
     * Focus first input in the menu
     */
    focusFirstInput () {
        const $inputs = this.$menu.find('input:not([type="hidden"]),textarea,select').not(':disabled');

        if ($inputs.length) {
            $inputs.eq(0).focus();
            return true;
        } else {
            return false;
        }
    }


    /**
     * Keyboard navigation
     * ------------------------------------------------------------------------
     */

    /**
     * Handle key press on one of the items
     *
     * @param {JQuery.KeyDownEvent} event Event
     * @protected
     */
    handleItemKey (event) {
        const $item = $(event.target);

        if (!event.isDefaultPrevented()) {
            if (event.key === 'ArrowDown' || event.key === 'Tab' || event.key === 'ArrowUp') {
                const $items = this.getItems();

                if ($items.index($item) !== -1) {
                    if (event.key === 'ArrowDown' || (event.key === 'Tab' && !event.shiftKey)) {
                        // Overwrite tab key to prevent going outside the menu
                        this.focusNextItem();
                    } else {
                        this.focusPreviousItem();
                    }

                    event.preventDefault();
                }
            } else if (event.key === 'Escape') {
                this.hide();
                event.preventDefault();
            } else if ((this.position === 'left' && event.key === 'ArrowRight') || (this.position === 'right' && event.key === 'ArrowLeft')) {
                this.hide();
                event.preventDefault();
            }
        }
    }

    /**
     * Handle key press on the menu
     *
     * @param {JQuery.KeyDownEvent} event Event
     */
    handleMenuKey (event) {
        if (!event.isDefaultPrevented() && event.key === 'Escape') {
            this.hide();
            event.preventDefault();
        }
    }

    /**
     * Handle key press on the toggle element
     *
     * @param {JQuery.KeyDownEvent} event Event
     * @protected
     */
    handleToggleKey (event) {
        if (!this.open) {
            console.log('handle toggle', this.position);

            if (
                (this.position === 'bottom' && event.key === 'ArrowDown') ||
                (this.position === 'top' && event.key === 'ArrowUp') ||
                (this.position === 'left' && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) ||
                (this.position === 'right' && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) ||
                (event.key === 'Enter')
            ) {
                this.show(event);
                event.preventDefault();
            }
        } else {
            // Toggle is focused, dropdown is open, tab key should focus first item
            if (event.key === 'Tab' && !event.shiftKey) {
                if (this.focusFirstItem()) {
                    event.preventDefault();
                } else if (this.focusFirstInput()) {
                    event.preventDefault();
                }
            }
        }
    }

    /**
     * Handle key press on the document element
     *
     * @param {JQuery.KeyDownEvent} event Event
     * @protected
     */
    handleDocumentKey (event) {
        // Dropdown is open, but none of the elements inside of it are focused, so
        // keyboard events are not captured
        if (this.open && !$(event.target).closest(this.$menu).length) {
            if (!this.$focused) {
                if (event.key === 'ArrowDown') {
                    this.focusFirstItem();
                    event.preventDefault();
                } else if (event.key === 'ArrowUp') {
                    this.focusLastItem();
                    event.preventDefault();
                }
            }
        }
    }

    /**
     * Handle click on document
     * Close dropdown if necessary
     *
     * @param {JQuery.ClickEvent} event Event
     * @protected
     */
    handleDocumentClick (event) {
        const $target = $(event.target);
        const $container = this.$container;
        const $menu = this.$menu;
        const autoClose = this.options.autoClose;

        if (autoClose && !$target.closest($container).length && !$target.closest($menu).length) {
            this.hide();
        }
    }


    /**
     * Indicator
     * ------------------------------------------------------------------------
     */

    /**
     * Position indicator below the item
     *
     * @param {JQuery} $item Item element
     * @protected
     */
    positionIndicator ($item) {
        if ($item && $item.length) {
            const menuBox = this.$menuContent.get(0).getBoundingClientRect();
            const itemBox = $item.get(0).getBoundingClientRect();

            this.$indicator
                .toggleClass(this.options.classNameIndicatorDropdown, $item.parent().hasClass('dropdown'))
                .css({
                    'width': itemBox.width,
                    'height': itemBox.height,
                    'transform': `translate(${ itemBox.left - menuBox.left }px, ${ itemBox.top - menuBox.top }px)`,
                    'opacity': 1
                });

            if (!this.indicatorPositioned) {
                this.$indicator.css('transition', 'none');

                requestAnimationFrame(() => {
                    this.$indicator.css('transition', '');
                });
            }
            this.indicatorPositioned = true;
        } else {
            this.$indicator
                .css({
                    'opacity': 0
                });

            this.indicatorPositioned = false;
        }
    }


    /**
     * Popper
     * ------------------------------------------------------------------------
     */

    /**
     * Create popper
     *
     * @protected
     */
    createPopper () {
        if (!this.popper) {
            const $menu = this.$menu;
            const isSubDropdown = !!this.$container.parent().closest('.dropdown').length;

            // Move to the document
            if (this.options.container && !isSubDropdown) {
                const $parent = $menu.closest(this.options.container);

                if ($parent.length) {
                    $parent.append($menu);
                }
            }

            // Show menu for poppoer to be able to read position
            $menu.removeClass('d-none').addClass('is-invisible');

            this.popper = createPopper(this.$reference.get(0), $menu.get(0), {
                placement: this.options.placement,
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: ({ placement }) => {
                                const offset = this.options.offset || (isSubDropdown ? 24 : 16);
                                const offsetArr = Array.isArray(offset) ? offset : [offset, offset];

                                // @TODO This doesn't seem correct for vertical placement
                                if (placement.indexOf('start') !== -1) {
                                    return [-offsetArr[0], offsetArr[1]];
                                } else if (placement.indexOf('end') !== -1) {
                                    return [offsetArr[0], offsetArr[1]];
                                } else {
                                    return [0, offsetArr[1]];
                                }
                            },
                        },
                    },
                ],
            });

            requestAnimationFrame(() => {
                $menu.addClass('d-none').removeClass('is-invisible');
            });
        }
    }

    /**
     * Destroy popper
     *
     * @protected
     */
    destroyPopper () {
        if (this.popper) {
            this.popper.destroy();
            this.popper = null;
        }
    }

    /**
     * Create overlay element
     *
     * @protected
     */
    createOverlay () {
        if (!this.$overlay && this.options.withOverlay && this.options.container) {
            const $parent = this.$menu.closest(this.options.container);
            this.$overlay = $('<div class="dropdown-overlay d-none"></div>').appendTo($parent);
        }
    }

    /**
     * Update popper position
     *
     * @protected
     */
    updatePopper () {
        this.popper.update();

        const placement = this.popper.state.placement;
        this.position =
            placement.indexOf('bottom') !== -1 ? 'bottom' :
            placement.indexOf('top') !== -1 ? 'top' :
            placement.indexOf('left') !== -1 ? 'left' : 'right';

        this.updatePositionClassName();
    }

    updatePositionClassName () {
        const options = this.options;
        const classNames = {
            right: options.classNamePlacementRight,
            left: options.classNamePlacementLeft,
            top: options.classNamePlacementTop
        };

        this.$container
            .removeClass(`${ options.classNamePlacementRight } ${ options.classNamePlacementLeft } ${ options.classNamePlacementTop }`)
            .addClass(classNames[this.position]);
    }


    /**
     * Hover mode
     * ------------------------------------------------------------------------
     */

     /**
      * On mouse enter reset leave timer or show the menu
      *
      * @protected
      */
    handleMouseEnter () {
        if (this.mouseLeaveTimer) {
            clearTimeout(this.mouseLeaveTimer);
            this.mouseLeaveTimer = null;
        }

        this.show();
    }

    /**
     * On mouse leave wait before hiding menu
     *
     * @protected
     */
    handleMouseLeave () {
        this.mouseLeaveTimer = setTimeout(() => {
            this.mouseLeaveTimer = null;
            this.hide();
        }, MOUSE_LEAVE_DELAY);
    }

    /**
     * Handle mouseover the item
     *
     * @param {object} event Event
     * @protected
     */
    handleItemMouseEnter (event) {
        const $items = this.getItems();
        const $item = $(event.target);

        if ($items.index($item) !== -1) {
            this.focusItem($item);
        }
    }
}

$.fn.dropdown = createPlugin(Dropdown);

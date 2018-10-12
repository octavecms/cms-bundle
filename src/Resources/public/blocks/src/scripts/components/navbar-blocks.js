import $ from 'lib/jquery';
import debounce from 'lodash/debounce';

const WIDGET_CONTAINER_SELECTOR = '[data-widget="navbar-blocks"]';


class NavBarBlocks {
    constructor ($container) {
        this.$container = $container;
        this.$list      = $container.find('.js-navbar-list');
        this.$next      = $container.find('.js-navbar-next');
        this.$prev      = $container.find('.js-navbar-previous');

        this.$next.on('click', this.scrollNext.bind(this));
        this.$prev.on('click', this.scrollPrevious.bind(this));

        this.nextEnabled = false;
        this.prevEnabled = false;

        this.updateButtons();
        this.$list.on('scroll', debounce(this.updateButtons.bind(this), 60));
        $(window).on('resize', debounce(this.updateButtons.bind(this), 60));

        if (!$container.closest('nav.navbar').length) {
            this.stickyPosition();
        }
    }

    /**
     * If not inside the sticky navigation bar then make block bar sticky itself.
     */
    stickyPosition () {
        const $container = this.$container;
        const $topNavbar = $('.navbar-static-top');
        const $navbar = $('nav.navbar');
        const $wrapper = $('.content-wrapper');

        const getStickyOffset = () => ($topNavbar.outerHeight() || 0) + ($navbar.outerHeight() || 0);

        // Make it sticky
        new Waypoint.Sticky({
            element: $container.get(0),
            offset: getStickyOffset,
            handler: (direction) => {
                if (direction == 'up') {
                    $container.width('auto').css('top', '');
                } else {
                    $container.width($wrapper.outerWidth()).css('top', getStickyOffset());
                }
            }
        });
    }

    scrollNext () {
        const $list = this.$list;
        const list  = $list.get(0);
        const width = list.offsetWidth;
        const maxScroll = list.scrollWidth - width;
        const scroll = Math.max(0, Math.min(list.scrollLeft + width, maxScroll));

        $list.animate({
            'scrollLeft': scroll
        });
    }

    scrollPrevious () {
        const $list = this.$list;
        const list  = $list.get(0);
        const width = list.offsetWidth;
        const maxScroll = list.scrollWidth - width;
        const scroll = Math.max(0, Math.min(list.scrollLeft - width, maxScroll));

        $list.animate({
            'scrollLeft': scroll
        });
    }

    updateButtons () {
        const list  = this.$list.get(0);
        const maxScroll = list.scrollWidth - list.offsetWidth;
        const scroll = list.scrollLeft;
        let   prevEnabled = scroll > 0;
        let   nextEnabled = scroll < maxScroll;
        
        if (this.nextEnabled !== nextEnabled) {
            this.nextEnabled = nextEnabled;
            this.$next
                .toggleClass('disabled', !nextEnabled)
                .attr('aria-disabled', !nextEnabled);
        }
        
        if (this.prevEnabled !== prevEnabled) {
            this.prevEnabled = prevEnabled;
            this.$prev
                .toggleClass('disabled', !prevEnabled)
                .attr('aria-disabled', !prevEnabled);
        }
    }

}



$(function () {
    $(WIDGET_CONTAINER_SELECTOR).each(function () {
        new NavBarBlocks($(this));
    });
});
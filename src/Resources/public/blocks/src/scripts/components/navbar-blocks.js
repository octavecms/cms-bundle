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
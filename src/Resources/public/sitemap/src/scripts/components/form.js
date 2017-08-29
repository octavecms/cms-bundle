import reduce from 'lodash/reduce';
import { addPage, removeTemporaryPage } from '../modules/actions';


let UID = 1;


export default class SitemapForm {
    static get defaultOptions () {
        return {
            store: null
        };
    }

    constructor ($container, options) {
        this.$container = $container;
        this.options = $.extend({}, this.constructor.defaultOptions, options);
        this.namespace = `sitemapform${ ++UID }`;
        this.states = {};

        this.init();
    }

    init () {
        const $container = this.$container;
        const $reset     = $container.find('button[type="reset"]');
        const $spinner   = $container.find('.overlay');

        $reset.on(`click.${ this.namespace }`, this.cancel.bind(this));
        $container.on(`submit.${ this.namespace }`, this.submit.bind(this));

        this.$spinner = $spinner;
        this.store = this.options.store;
    }

    submit (e) {
        e.preventDefault();

        const $container  = this.$container;
        const values = reduce($container.serializeArray(), (values, item) => {
            values[item.name] = item.value;
            return values;
        }, {});

        // Loading state
        this.$spinner.removeClass('hidden');

        // Add page
        values.parent = this.store.getState().tree.pages.temporary.parent;

        store.dispatch(addPage(values)).then(() => {
            this.$spinner.addClass('hidden');
        });
    }

    show ($target) {
        this.$target = $target;

        $target.popover({
            trigger: 'manual',
            html: true,
            placement: 'right',
            content: this.$container.removeClass('hidden'),
            container: 'body',
            offset: '0 10px'
        });

        $target.popover('show');
        $target.data('bs.popover').$tip.addClass('sitemap-form');
    }

    hide () {
        if (this.$target) {
            this.$spinner.addClass('hidden');
            this.$target.popover('hide').popover('destroy');
            this.$target = null;

            this.$container.get(0).reset();
        }
    }

    cancel () {
        this.store.dispatch(removeTemporaryPage());
    }
}
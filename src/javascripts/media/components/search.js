import $ from 'util/jquery';
import assign from 'lodash/assign';
import 'util/template/jquery.template';

import { setSearchQuery } from 'media/modules/actions-search';


/**
 * Search component
 */
export default class Search {

    static get Defaults () {
        return {
            store: null
        };
    }

    constructor ($container, opts) {
        const options = this.options = assign({}, this.constructor.Defaults, opts);
        this.$container = $container;
        this.$input = $container.find('input');
        this.store = options.store;

        $container.on('submit input change', this.update.bind(this));
    }

    update (event) {
        if (event.type === 'submit') {
            event.preventDefault();
        }

        setSearchQuery(this.store, this.$input.val());
    }
}
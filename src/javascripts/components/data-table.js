/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';
import assign from 'lodash/assign';

// import 'util/jquery.destroyed';
// import namespace from 'util/namespace';


/**
 * Data table
 */
class DataTable {

    static get Defaults () {
        return {
            elementSelector: '.js-data-table-element',
            selectAllSelector: null,
        };
    }

    constructor ($container, opts) {
        const options = this.options = assign({}, this.constructor.Defaults, opts);
        this.$container = $container;
        this.$selectall = null;

        if (options.selectAllSelector) {
            this.$selectall = $container.find(options.selectAllSelector);
            this.$selectall.on('click change', this.toggleAll.bind(this));
            this.$container.on('click change', 'input:checkbox', this.updateToggle.bind(this));
        }
        
        this.update();
    }

    update () {
        const $elements = this.$container.find(this.options.elementSelector);
        const updates = [];

        for (let i = 0; i < $elements.length; i++) {
            const $element = $elements.eq(i);
            const $row = $element.closest('tr');
            
            const elementBox = $element.get(0).getBoundingClientRect();
            const rowBox = $row.get(0).getBoundingClientRect();
            
            updates.push([
                $element,
                'height',
                $row.height() + 1
            ]);
            updates.push([
                $element,
                'margin-top',
                `${ rowBox.top - elementBox.top }px`
            ]);
        }

        for (let i = 0; i < updates.length; i++) {
            updates[i][0].css(updates[i][1], updates[i][2]);
        }
    }

    toggleAll () {
        const $selectall = this.$selectall;
        const $inputs = this.$container.find('input[type="checkbox"]').not($selectall);

        if ($selectall.is(':checked')) {
            $inputs.not(':checked').prop('checked', true).change();
        } else {
            $inputs.filter(':checked').prop('checked', false).change();
        }
    }

    updateToggle () {
        const $selectall = this.$selectall;
        const isChecked = !!this.$container.find('input[type="checkbox"]:checked').not($selectall).length;
        const wasChecked = $selectall.prop('checked');

        if (isChecked !== wasChecked) {
            $selectall.prop('checked', isChecked);
        }
    }
}

$.fn.dataTable = createPlugin(DataTable);

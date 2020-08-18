/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';
import assign from 'lodash/assign';


/**
 * Data table
 */
class DataTable {

    static get Defaults () {
        return {
            elementSelector: '.js-data-table-element',
            rowIdAttribute: 'data-data-table-row-id',
            selectAllSelector: null,
            selectItemSelector: null,
        };
    }

    constructor ($container, opts) {
        const options = this.options = assign({}, this.constructor.Defaults, opts);
        this.$container = $container;
        this.$selectall = null;

        if (options.selectAllSelector) {
            this.$selectall = $container.find(options.selectAllSelector);
            this.$selectall.on('click change', this.toggleAll.bind(this));
            this.$container.on('click change', options.selectItemSelector, this.updateToggle.bind(this));
        }

        this.update();
    }

    /**
     * Position elements to cover whole row
     *
     * @protected
     */
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


    /*
     * Row selection
     * ----------------------------------------------------
     */


    /**
     * Toggle all selected checkboxes
     *
     * @protected
     */
    toggleAll () {
        const $selectall = this.$selectall;
        const $inputs = this.$container.find(this.options.selectItemSelector).not($selectall);

        if ($selectall.is(':checked')) {
            $inputs.not(':checked').prop('checked', true).change();
        } else {
            $inputs.filter(':checked').prop('checked', false).change();
        }
    }

    /**
     * Update "All" checkbox
     *
     * @protected
     */
    updateToggle () {
        const $selectall = this.$selectall;
        const isChecked = !!this.$container.find(`${ this.options.selectItemSelector }:checked`).not($selectall).length;
        const wasChecked = $selectall.prop('checked');

        if (isChecked !== wasChecked) {
            $selectall.prop('checked', isChecked);
        }
    }


    /*
     * Rendering
     * ----------------------------------------------------
     */


    /**
     * Re-render data table item
     *
     * @param {object} data Item data
     */
    rerender (data) {
        if (data && data.id) {
            const $template = this.$template || (this.$template = this.$container.template({}))
            const attr = this.options.rowIdAttribute;
            const $rowPrev = this.$container.find(`[${ attr }="${ data.id }"]`);

            try {
                const $rowNext = $($template.template('compile', data));
                $rowPrev.after($rowNext);
                $rowPrev.remove();
                $rowNext.app();

                this.update();
            } catch (err) {
            }
        }
    }
}

$.fn.dataTable = createPlugin(DataTable);

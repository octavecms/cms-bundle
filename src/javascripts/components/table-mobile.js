/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';
import assign from 'lodash/assign';


/**
 * Component to convert table into mobile compatible
 * by addings classnames and setting data-th attributes
 *
 * Styles how table will look are controlled by CSS
 * - To each cell which has mobile heading is added data-th="...heading text..."
 * - Content of each cell with mobile heading is wrapped in <span class="mobile-table__content">...</span>
 * - To elements which shouldn't be visible on mobile is added "mobile-table__hide" classname
 * - If table has at least one cell with mobile heading then "mobile-table" classname is added to it
 */
class MobileTable {

    static get Defaults () {
        return {
            // Classname added to the table
            'className': 'mobile-table',

            // Classname to hide elements
            'classNameHide': 'mobile-table__hide',

            // Classname added to the cell wrapper elements
            'classNameContentWrap': 'mobile-table__content',

            // Show empty cells on mobile
            'showEmptyCells': false,

            // Wrap content in an element
            'contentWrap': true,
        };
    }

    constructor ($table, opts) {
        this.options = assign({}, this.constructor.Defaults, opts);
        this.$table = $table;

        this.create();
    }

    /**
     * Converts heading row elements into arrays of texts, one array for each row
     *
     * @param {array} headingRows Array with heading row elements
     * @returns {array} Arrays with heading texts
     * @protected
     */
    getHeadingObject (headingRows) {
        const headingsObject = [];

        for (let i = 0; i < headingRows.length; i++) {
            for (let j = 0; j < headingRows[i].length; j++) {
                const $heading = headingRows[i].eq(j);
                const colSpan = parseInt($heading.attr('colspan'), 10) || 1;

                if (!headingsObject[i]) {
                    headingsObject[i] = [];
                }

                for (var c = 0; c < colSpan; c++) {
                    headingsObject[i].push($heading.text());
                }
            }
        }

        return headingsObject;
    }

    /**
     * Returns a heading text
     *
     * @param {array} headings Arrays with heading texts
     * @param {number} colIndex Column index for which to get headings
     * @returns {string} Heading text
     * @protected
     */
    getHeadingText (headings, colIndex) {
        const text = [];

        for (var i = 0; i < headings.length; i++) {
            text.push(headings[i][colIndex]);
        }

        return text.join(': ');
    }

    /**
     * Returns true if row has only headings and no data cells
     *
     * @param {object} $row Row element
     * @returns {boolean} If row has only headings
     * @protected
     */
    isOnlyHeadings ($row) {
        return $row.find('td').length === 0;
    }

    /**
     * Setup row
     *
     * @param {object} $row Row element
     * @param {array} Arrays with heading texts
     * @returns {boolean} True if any cell was changed
     * @protected
     */
    setupRow ($row, headings) {
        const $cells = $row.children();
        const options = this.options;
        let cellIndex = 0;
        let changed = false;

        for (let i = 0; i < $cells.length; i++) {
            const $cell = $cells.eq(i);

            if (($cell.html().trim() === '' || $cell.html().trim() === '&nbsp;') && (!options.showEmptyCells)) {
                // Hide empty cells on mobile
                $cell.addClass(options.classNameHide);
            } else {
                const colSpan = parseInt($cell.attr('colspan'), 10) || 1;
                const text = this.getHeadingText(headings, cellIndex);

                if (text) {
                    changed = true;
                }

                $cell.attr('data-th', text);
                cellIndex += colSpan;
            }
        }

        return changed;
    }

    /**
     * Create mobile table
     */
    create () {
        const $table = this.$table;
        const options = this.options;
        const $rows = $table.find('tr');
        let headingRows = [];
        let headings = [];
        let isProcessingHeadings = true;
        let changed = false;

        for (let i = 0; i < $rows.length; i++) {
            const $row = $rows.eq(i);

            if (this.isOnlyHeadings($row)) {
                if (!isProcessingHeadings) {
                    // Reset heading data
                    isProcessingHeadings = true;
                    headingRows = [];
                    headings = [];
                }

                headingRows.push($row.children());

                // Hide heading row
                $row.addClass(options.classNameHide);
            } else {
                if (isProcessingHeadings) {
                    isProcessingHeadings = false;
                    headings = this.getHeadingObject(headingRows);
                }

                if (this.setupRow($row, headings)) {
                    changed = true;
                }
            }
        }

        if (changed) {
            $table.addClass(options.className);

            if (options.contentWrap) {
                $table.find('[data-th]').each((_, cell) => {
                    const $cell = $(cell);
                    if (!$cell.children().hasClass(options.classNameContentWrap)) {
                        $cell.wrapInner(`<span class="${ options.classNameContentWrap }" />`);
                    }
                });
            }

            // Hide thead if all rows are hidden (heading rows)
            if (!$table.find('thead').find('tr').not(`.${ options.classNameHide }`).length) {
                $table.find('thead').addClass(options.classNameHide);
            }
        } else {
            $table.find('[data-th]').removeAttr('data-th');
        }
    }

    /**
     * Unset all changes
     */
    cleanup () {
        const $table = this.$table;
        const options = this.options;

        $table.removeClass(options.className);
        $table.find(`.${ options.classNameHide }`).removeClass(options.classNameHide);
        $table.find(`.${ options.classNameContentWrap }`).unwrap();
        $table.find('[data-th]').removeAttr('data-th');
    }

    /**
     * Re-create mobile table
     * Should be used if table is changed dynamically
     */
    update () {
        this.cleanup();
        this.create();
    }
}

$.fn.mobileTable = createPlugin(function ($container, options) {
    if ($container.length === 1 && $container.is('table')) {
        return new MobileTable($container, options);
    } else {
        $container.find('table').addBack('table').each(function () {
            $(this).mobileTable(options);
        });
    }
}, {
    'api': ['cleanup', 'update', 'instance']
});

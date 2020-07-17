/* eslint no-unused-vars: ["off"] */
import $ from 'jquery';

import each from 'lodash/each';
import filter from 'lodash/filter';
import map from 'lodash/map';


const COL_SELECTOR_REGEX = /.col-([a-z]+)-([\d]+)/;
const COL_UNIT_REGEX = /width:\s*[\d.]+(%|vw|vh|vmin|vmax|em|px|rem)/;

function getAllSelectors (parent) {
    let selectors = [];
    let rules = null;

    try {
        rules = parent.rules || parent.cssRules;
    } catch (err) {
        // CSS files which are not from same origin will fail
    }

    each(rules || {}, (rule) => {
        if (rule.type === CSSRule.MEDIA_RULE) {
            selectors = selectors.concat(getAllSelectors(rule));
        } else if ('selectorText' in rule) {
            selectors = selectors.concat(map(rule.selectorText.split(','), (selector) => {
                return {
                    'selector': selector.trim(),
                    'cssText': rule.cssText
                };
            }));
        }
    });

    return selectors;
}


/**
 * Generates grid based on detected CSS classnames
 */
class GridGenerator {

    constructor ($container) {
        this.$container = $container;
        this.generate();
    }

    getColumnCount () {
        const columns = {};

        each(document.styleSheets, (stylesheet) => {
            each(getAllSelectors(stylesheet), (selector) => {
                const match = selector.selector.match(COL_SELECTOR_REGEX);

                if (match) {
                    columns[match[1]] = columns[match[1]] || {'count': 0, 'unit': ''};
                    columns[match[1]].count = Math.max(columns[match[1]].count, parseInt(match[2]));
                    columns[match[1]].unit = columns[match[1]].unit || (selector.cssText.match(COL_UNIT_REGEX) || [])[1];
                }
            });
        });

        return columns;
    }

    generate () {
        const columns = this.getColumnCount();
        const breakpoints = Object.keys(columns);
        let html = '';

        // Summary
        html += `<section class="my-5 container-h">
            <table><tr><th>Breakpoint</th><th>Column count</th><th>Column unit</th></tr>

            ${ map(columns, (column, breakpoint) => {
                return `<tr>
                    <td>${ breakpoint }</td>
                    <td>${ column.count }</td>
                    <td>${ column.unit }</td>
                </tr>`;
            }).join('') }
            </table>
            <p class="block-top">
                Resize browser to see different grid examples for other breakpoints
            </p>
        </section>`;

        // Columns
        console.log(columns);
        html += map(columns, (column, breakpoint) => {
            const visibilityClassName = map(filter(breakpoints, b => b !== breakpoint), b => `is-hidden--${ b }-down`).join(' ') + ` is-visible--${ breakpoint }`;
            let html = '';

            // Summary
            html += `
                <section class="my-5 container-h ${ visibilityClassName }">
                    <h3>With padding, current breakpoint: ${ breakpoint.toUpperCase() }</h3>
                    <p>
                        Column count for ${ breakpoint } breakpoint: <b>${ column.count }</b><br />
                        Column units for ${ breakpoint } breakpoint: <b>${ column.unit }</b><br />
                        Using <code>container-h</code> in the example: ${ column.unit === '%' ? '<b>Yes</b>' : '<b>No</b>, unable to detect if it wouldn\'t break this example' }
                    </p>
                </section>
            `;

            // Only for % based grids use horizontal container
            html += `<section class="my-5 container-h ${ visibilityClassName }">`;

            // With padding
            for (let i = 0; i < column.count; i++) {
                html += '<div class="row row--pad">';
                if (i > 0) {
                    html += `<div class="col col-${ breakpoint }-${ i }"><code>col col-${ breakpoint }-${ i }</code></div>`;
                }
                html += `<div class="col col-${ breakpoint }-${ column.count - i }"><code>col col-${ breakpoint }-${ column.count - i }</code></div>`;
                html += '</div>';
            }

            // Without padding
            html += `<h3>Without padding, current breakpoint: ${ breakpoint.toUpperCase() }</h3>`;

            for (let i = 0; i < column.count; i++) {
                html += '<div class="row">';
                if (i > 0) {
                    html += `<div class="col col-${ breakpoint }-${ i }"><code>col col-${ breakpoint }-${ i }</code></div>`;
                }
                html += `<div class="col col-${ breakpoint }-${ column.count - i }"><code>col col-${ breakpoint }-${ column.count - i }</code></div>`;
                html += '</div>';
            }

            html += '</section>';
            return html;
        }).join('');
        
        this.$container.html(html);
    }
}

$(() => {
    $('[data-grid-generator]').each(function () {
        new GridGenerator($(this));
    });
});

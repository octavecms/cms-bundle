import $ from 'lib/jquery';

const REGEX_MATCH_INDEX = /(?:^|[^a-z0-9])(\d+)(?:$|[^a-z0-9])/g;

// Since it's possible that inside collection items will other collections
// for each place where we have "__name__" we need to replace only first occurance
// &#x5B; === [
// &#x5D; === ]
// &amp;&#x23;x5B&#x3B; === [ double encoded
// &amp;&#x23;x5D&#x3B; === ] double encoded
export const REGEX_NAME = /([a-z0-9-_\[\]]|&#x5D;|&#x5B;|&amp;&#x23;x5B&#x3B;|&amp;&#x23;x5D&#x3B;)*__name__([a-z0-9-_\[\]]|&#x5D;|&#x5B;|&amp;&#x23;x5B&#x3B;|&amp;&#x23;x5D&#x3B;)*/ig;

/**
 * Tries to find maximum index of a child in the list
 * Note that not all collections have order inputs
 * 
 * IMPORTANT!!!
 * Before incrementing and using found index validate it with validateItemIndex()
 * 
 * @param {jQuery} $list List element
 * @param {string} orderCssSelector CSS selector for order inputs
 * @returns {number} Max index found
 */
export function getItemMaxIndex ($list, orderCssSelector = '') {
    const $inputs = orderCssSelector ? $list.find(orderCssSelector) : [];
    let  index   = -1;

    if ($inputs.length) {
        $inputs.each((i, input) => {
            const numbers = [];

            $(input).attr('name').replace(REGEX_MATCH_INDEX, (_, num) => {
                numbers.push(parseInt(num, 10));
            });

            index = Math.max(index, ...numbers);
        });
    } else {
        // Make an assumption that indexes start from 0
        index = $list.children().length - 1;
    }

    return index;
}

/**
 * Validate that item with such index doesn't already exist
 * 
 * @param {jQuery} $list List element
 * @param {number} index Index which we need to validate
 * @param {string} html Item template
 * @returns {boolean} True if element with such index doesn't exist and false if it exists
 */
export function validateItemIndex ($list, index, html) {
    var $inputs = $list.find('input[name]');
    var ids = [];

    // Find all occurances where we replace __name__ with index
    html = html.replace(REGEX_NAME, function (all) {
        ids.push(all.replace('__name__', index));
    });

    // Check if input with such name or id already exists
    for (let k = 0; k < $inputs.length; k++) {
        const name = $inputs.eq(k).attr('name');
        const id = $inputs.eq(k).attr('id');

        for (let i = 0; i < ids.length; i++) {
            if (name === ids[i] || id === ids[i]) {
                return false;
            }
        }
    }

    return true;
}
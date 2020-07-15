/**
 * Format number by adding thousand separator if value is more than 9999 and there is a decimal separator
 * This is a very simple version of Intl.NumberFormat; if it makes sense maybe replace with Intl
 * everywhere instead of using this
 *
 * @param {number|string} number number
 * @returns {string} Formatted number
 */

const numberThousandSeparator = window.LOCALES && (window.LOCALES.numberThousandSeparator || window.LOCALES.numberThousandSeparator === '') ? window.LOCALES.numberThousandSeparator : ' ';
const numberDecimalSeparator  = window.LOCALES && (window.LOCALES.numberDecimalSeparator || window.LOCALES.numberDecimalSeparator === '') ? window.LOCALES.numberDecimalSeparator : '.';

function numberFormat (number, decimals = 0, decimalSeparator, thousandSeparator) {
    let num = parseFloat(number);
    let str = '';

    // Round to number of decimal symbols
    num = Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);

    // Convert to string
    if (num === 0) {
        return '0';
    } else if (decimals) {
        str = num.toFixed(decimals);
    } else {
        str = '' + num;
    }

    return str
            .replace(/(\d)(\d{3})(\.|$)/, '$1' + (numberThousandSeparator || thousandSeparator) + '$2$3')
            .replace(/(\d)(\d{3})(\s)/, '$1' + (numberThousandSeparator || thousandSeparator) + '$2$3')
            .replace('.', decimalSeparator || numberDecimalSeparator);
}

export default numberFormat;

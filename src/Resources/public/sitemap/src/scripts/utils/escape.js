const REGEX_AMPESTRAND = /&/g;
const REGEX_QUOTE = /"/g;
const REGEX_APOS = /'/g;
const REGEX_LT = /</g;
const REGEX_GT = />/g;

const REGEX_NEWLINE = /\n/g;

const CHAR_AMPESTRAND = '&amp;';
const CHAR_APOS		  = '&apos;';
const CHAR_QUOTE      = '&quot;';
const CHAR_LOWER      = '&lt;';
const CHAR_GREATER    = '&gt;';
const CHAR_SPACE      = '&#8201;';

export default {

    /**
     * Escape text for safe use in HTML
     *
     * @param {String|Number} text Text
     * @returns {String} Text which is safe to be inserted into HTML
     */
    html: function (text) {
        var str = $.isPlainObject(text) ? JSON.stringify(text) : String(text === 0 ? '0' : text || '');

        return str
            .replace(REGEX_AMPESTRAND, CHAR_AMPESTRAND)
            .replace(REGEX_APOS, CHAR_APOS)
            .replace(REGEX_QUOTE, CHAR_QUOTE)
            .replace(REGEX_LT,  CHAR_LOWER)
            .replace(REGEX_GT,  CHAR_GREATER);
    },

    /**
     * Replace new lines with <br /> tags
     *
     * @param {String} text Text
     * @returns {String} Text with new lines replaces with breaks
     */
    nl2br: function (text) {
        return String(text).replace(REGEX_NEWLINE, '<br />');
    }

};

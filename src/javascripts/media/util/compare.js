/**
 * Compare two values
 * Compares objects and arrays, but non-deep, onyl first depth level
 * 
 * @param {any} a Value A
 * @param {any} b Value B
 * @returns {boolean} True if values are the same, otherwise false
 */
export default function compare (a, b) {
    if (a === b) {
        return true;
    } else if (a && b) {
        if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
            for (let i = 0; i < a.length; i++) {
                if (a[i] !== b[i]) return false;
            }

            return true;
        } else if (typeof a === 'object' && typeof b === 'object') {
            var aKeys = Object.keys(a);
            var bKeys = Object.keys(b);

            if (aKeys.length === bKeys.length) {
                for (let i = 0; i < aKeys.length; i++) {
                    if (aKeys[i] !== bKeys[i] || a[aKeys[i]] !== b[aKeys[i]]) {
                        return false;
                    }
                }

                return true;
            }
        }
    }

    return false;
}
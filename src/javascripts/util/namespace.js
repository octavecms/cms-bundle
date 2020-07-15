// guid counter
let UID = 0;

/**
 * Generate non-random string
 *
 * Each generated string is unique only for single page and may
 * change for same call after page reload
 *
 * @returns {string} String
 */
export default function namespace () {
    return `ns${UID++}`;
}

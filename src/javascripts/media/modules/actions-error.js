/**
 * Set error messages
 * 
 * @param {object} state State
 * @param {string} message Error messages
 */
export function setErrorMessage (state, message) {
    state.files.error.set({
        message: message,
        visible: !!message
    });
}
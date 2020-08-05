/**
 * Returns previous section id
 * 
 * @param {object} store Store
 * @param {string|number} id Section ID
 * @returns {string|number} Previous section ID or null
 */
export function getPreviousSection (store, id) {
    const order = store.sections.order.get();
    const parent = store.sections.list[id].parent.get();
    let   index = order.indexOf(id) - 1;

    while (index >= 0) {
        // Search for item with the same parent
        const refParent = store.sections.list[order[index]].parent.get();

        if (refParent === parent) {
            return order[index];
        }

        index--;
    }

    return null;
}

/**
 * Returns next section id
 * 
 * @param {object} store Store
 * @param {string|number} id Section ID
 * @returns {string|number} Next section ID or null
 */
export function getNextSection (store, id) {
    const order = store.sections.order.get();
    const parent = store.sections.list[id].parent.get();
    let   index = order.indexOf(id) + 1;

    while (index < order.length) {
        // Search for item with the same parent
        const refParent = store.sections.list[order[index]].parent.get();

        if (refParent === parent) {
            return order[index];
        }

        index++;
    }

    return null;
}
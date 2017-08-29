export function isDescendantOf (id, parent, state) {
    let page = state.tree.pages[id];

    while (page && page.id !== parent) {
        page = state.tree.pages[page.parent];
    }

    return page && page.id === parent ? true : false;
};

export function isChildOf (id, parent, state) {
    return state.tree.pages[id].parent === parent;
}

export function isEmpty (id, state) {
    // Check for sub-pages
    if (!state.tree.pages[id].children || !state.tree.pages[id].children.length) {
        return true;
    }

    return false;
}
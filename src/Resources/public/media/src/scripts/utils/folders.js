export function isDescendantOf (id, parent, state) {
    let folder = (id in state.files ? state.tree.folders[state.categoryId] : state.tree.folders[id]);

    while (folder && folder.id !== parent) {
        folder = state.tree.folders[folder.parent];
    }

    return folder && folder.id === parent ? true : false;
};

export function isChildOf (id, parent, state) {
    if (id in state.files) {
        // File
        return parent === state.categoryId;
    } else {
        // Folder
        return state.tree.folders[id].parent === parent;
    }
}

export function isEmpty (id, state) {
    // Check if there are any files in the folder
    if (id in state.categories && !state.categories[id].length) {
        // Check for sub-folders
        if (!state.tree.folders[id].children.length) {
            return true;
        }
    }

    return false;
}
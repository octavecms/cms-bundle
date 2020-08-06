import without from 'lodash/without';
import namespace from 'util/namespace';

import { loadFiles } from './actions-files';
import { fetchData } from './actions-fetch';
import { setStaticState } from './actions-static-state';

/**
 * Delete folder
 * 
 * @param {object} store State store
 * @param {number} id Folder id
 */
export function deleteFolder (store, id) {
    const folder = store.folders.list[id].get();
    
    // If deleting selected folder, then open parent
    if (store.folders.selected.get() === id) {
        setSelectedFolder(store, folder.parent);
    }

    // Remove folder
    removeFolderFromTheList(store, id);

    // Save folder on server
    fetchData(MEDIA_API_ENDPOINTS.folderRemove, {
        'method': 'POST',
        'data': {
            'folder': id
        }
    })
        .catch((err) => {
            // Error occured, add folder back
            addFolderToTheList(store, folder);
        })
}


/**
 * Create folder
 * 
 * @param {object} store State store
 * @param {string} name Folder name
 * @param {number} parent Parent folder id
 */
export function createFolder (store, name, parent) {
    // Add tempoary folder
    const folder = {'id': namespace() , 'name': name, 'parent': parent, 'children':[], 'disabled': true, 'loading': true, 'expanded': false};
    addFolderToTheList(store, folder);

    // Save folder on server
    fetchData(MEDIA_API_ENDPOINTS.folderAdd, {
        'method': 'POST',
        'data': {
            'name': name,
            'parent': parent
        }
    })
        .then((response) => {
            // Replace temporary folder with actual folder
            removeFolderFromTheList(store, folder.id);
            addFolderToTheList(store, response);
        })
        .catch((err) => {
            // Error occured, remove temporary folder
            removeFolderFromTheList(store, folder.id);
        })
}

/**
 * Add folder
 * 
 * @param {object} store State store
 * @param {object} folder Folder data
 */
export function addFolderToTheList (store, folder) {
    // Set folder data
    store.folders.list[folder.id].set(folder);
    
    // Update parent
    let parentChildren = store.folders.list[folder.parent].children.get([]);
    parentChildren = [].concat(parentChildren, folder.id);
    
    // Sort by name
    parentChildren = parentChildren.sort((aId, bId) => {
        const aName = store.folders.list[aId].name.get('');
        const bName = store.folders.list[bId].name.get('');
        return aName.localeCompare(bName);
    });

    store.folders.list[folder.parent].children.set(parentChildren);
}


/**
 * Remove folder from the list
 * 
 * @param {object} store State store
 * @param {object} id Folder ID
 */
export function removeFolderFromTheList (store, id) {
    const folder = store.folders.list[id].get();

    // Remove folder from parent
    if (store.folders.list[folder.parent].has()) {
        const parent = store.folders.list[folder.parent];
        const children = without(parent.children.get(), id);

        parent.children.set(children);
    }

    // Remove folder from the list
    store.folders.list[id].remove();
}


/**
 * Set selected folder
 * 
 * @param {object} store State store
 * @param {number} folderId Folder ID
 */
export function setSelectedFolder (store, folderId) {
    const isDisabled = store.folders.list[folderId].disabled.get(false);

    if (!isDisabled) {
        store.folders.selected.set(folderId);
        setStaticState({'folders': {'selected': folderId}});
        loadFiles(store, folderId);
    }
}


/**
 * Toggle folder
 * 
 * @param {object} store State store
 * @param {number} folderId Folder ID
 */

export function toggleFolder (store, folderId) {
    const folder = store.folders.list[folderId];
    const isExpanded = folder.expanded.get(0);

    if (folder) {
        folder.expanded.set(!isExpanded);
    }
}

export function expandFolder (store, folderId) {
    const folder = store.folders.list[folderId];

    if (folder) {
        folder.expanded.set(true);
    }
}

export function collapseFolder (store, folderId) {
    const folder = store.folders.list[folderId];

    if (folder) {
        folder.expanded.set(false);
    }
}


/**
 * Move folder
 * 
 * @param {number} folderId Folder ID which to move
 * @param {number} parentId Parent folder ID into which to move
 */

export function moveFolder (store, folderId, parentId) {
    const folder = store.folders.list[folderId].get(0);
    const parentPrevId = folder.parent;

    // Parent didn't changed, ignoring
    if (parentId === parentPrevId) return;

    // Move folder instantly
    removeFolderFromTheList(store, folderId);

    folder.parent = parentId;
    folder.loading = true;

    addFolderToTheList(store, folder);

    // Expand new parent folder
    expandFolder(store, parentId);

    fetchData(MEDIA_API_ENDPOINTS.folderMove, {
        'method': 'POST',
        'data': {
            'id': folderId,
            'parent': parentId
        }
    })
        .then((response) => {
            store.folders.list[folderId].loading.set(false);
        })
        .catch((err) => {
            store.folders.list[folderId].loading.set(false);
            
            // Revert
            removeFolderFromTheList(store, folderId);
            folder.parent = parentPrevId;
            addFolderToTheList(store, folder);
        })
}
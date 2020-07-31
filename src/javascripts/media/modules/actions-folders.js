import without from 'lodash/without';
import namespace from 'util/namespace';

import { loadFiles } from './actions-files';
import { fetchData } from './actions-fetch';


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
    fetchData(API_ENDPOINTS.folderAdd, {
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
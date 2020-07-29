import remove from 'lodash/remove';
import namespace from 'utils/namespace';

import { setErrorMessage } from './actions-error';
import { setFiles } from './actions-files';


/**
 * Create folder
 * 
 * @param {object} state State
 * @param {string} name Folder name
 * @param {number} parent Parent folder id
 */
export function createFolder (state, name, parent) {
    // Add tempoary folder
    const folder = {'id': namespace() , 'name': name, 'parent': parent, 'children':[], 'temporary': true};
    addFolderToTheList(state, folder);

    // Save folder on server
    fetch(API_ENDPOINTS.folderAdd, {
        'method': 'POST',
        'credentials': 'same-origin',
        'headers': {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        'body': decodeURIComponent($.param({
            'name': name,
            'parent': parent
        }))
    })
        .then(response => response.json())
        .then(json => {
            if (json && json.status) {
                // Replace temporary folder with actual folder
                removeFolderFromTheList(state, folder.id);
                addFolderToTheList(state, json.data);
            } else if (json && json.message) {
                setErrorMessage(state, json.message);
            }
        })
}

/**
 * Add folder
 * 
 * @param {object} state State
 * @param {object} folder Folder data
 */
export function addFolderToTheList (state, folder) {
    // Set folder data
    state.list.folders[folder.id].set(folder);
    
    // Update parent
    let parentChildren = state.folders.list[folder.parent].children.get([]);
    parentChildren = [].concat(parentChildren, action.folder.id);

    // Sort by name
    parentChildren.sort((aId, bId) => {
        const aName = state.list.folders[aId].name;
        const bName = state.list.folders[bId].name;
        return aName.localeCompare(bName);
    });

    state.list.folders[folder.parent].children.set(parentChildren);
}


/**
 * Remove folder from the list
 * 
 * @param {object} state State
 * @param {object} id Folder ID
 */
export function removeFolderFromTheList (state, id) {
    const folder = state.list.folders[id].get();

    // Remove folder from parent
    if (state.list.folders[folder.parent].has()) {
        const parent = state.list.folders[folder.parent];
        const children = remove([].concat(parent.children.get()), {'id': id});

        parent.children.set(children);
    }

    // Remove folder from the list
    state.list.folders[id].remove();
}


/**
 * Set selected folder
 * 
 * @param {object} state State
 * @param {number} folderId Folder ID
 */
export function setSelectedFolder (state, folderId) {
    state.folder.selected.set(folderId);
    state.files.loading.set(true);

    fetch(`${ API_ENDPOINTS.filesList }?category=${ encodeURIComponent(folderId) }`, {
        'credentials': 'same-origin'
    })
        .then(response => response.json())
        .then(json => {
            state.files.loading.set(false);
            
            if (json && json.status) {
                setFiles(state, json.data);
            } else if (json && json.message) {
                setErrorMessage(state, json.message);
            }
        });
}
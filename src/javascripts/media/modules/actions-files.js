import map from 'lodash/map';
import each from 'lodash/each';
import filter from 'lodash/filter';
import reduce from 'lodash/reduce';
import without from 'lodash/without';
import FILE_ICONS from 'media/util/file-icons';
import namespace from 'util/namespace';

import { fetchData } from './actions-fetch';
import { setSearchQuery } from './actions-search';


/**
 * Delete files
 * 
 * @param {object} store State store
 * @param {array} ids List of file ids
 */
export function deleteFiles (store, ids) {
    removeFilesFromTheGrid(store, ids);

    // Change parent folder for files
    const prevFolderIds = [];
    const tempFolderId = namespace();
    each(ids, (fileId) => {
        prevFolderIds.push(store.files.list[fileId].parent.get());
        store.files.list[fileId].parent.set(tempFolderId);
    });

    // Remove from selected
    let selected = [].concat(store.files.selected.get());
    let selectedChanged = false;

    each(ids, (fileId) => {
        const index = selected.indexOf(fileId);
        if (index !== -1) {
            selectedChanged = true;
            selected.splice(index, 1);
        }
    });

    if (selectedChanged) {
        store.files.selected.set(selected);
    }

    // Get file list
    fetchData(API_ENDPOINTS.filesRemove, {
        'method': 'GET',
        'data': {
            'files': ids
        }
    })
        .then((response) => {
            // Permanently delete
            each(ids, (fileId) => {
                store.files.list[fileId].remove();
            });
        })
        .catch((err) => {
            // Revert            
            each(ids, (fileId, index) => {
                store.files.list[fileId].parent.set(prevFolderIds[index]);
            });

            addFilesToTheGrid(store, ids);
        });
}


/**
 * Set selected file ids
 * 
 * @param {object} store State store
 * @param {array} ids List of file ids
 */
export function setSelectedFiles (store, ids) {
    store.files.selected.set(ids);
}


/**
 * Set files
 * 
 * @param {object} store State store
 * @param {array} files List of files
 */
export function setFiles (store, files) {    
    each(files, (file) => {
        // Add icons to the files
        if (!file.thumbnail && !file.icon) {
            const extension = file.fileName.replace(/^.*\./, '');
            const icon = filter(FILE_ICONS, (icon) => icon.extensions.indexOf(extension) !== -1);

            file.icon = icon ? icon.icon : 'unknown';
        }

        // Loading state
        file.loading = file.loading || false;

        // Search match
        file.searchMatch = file.searchMatch || true;
    });

    // List of file ids
    const grid = map(files, file => file.id);

    // List of files where keys are ids
    const list = reduce(files, (list, file) => {
        list[file.id] = file;
        return list;
    }, {});

    store.files.list.set({...store.files.list.get(), ...list});
    store.files.grid.set(grid);

    // Update file list filter
    setSearchQuery(store, store.files.searchFilter.get());
}


/**
 * Load files
 * 
 * @param {object} store State store
 * @param {number} folderId Folder id
 */
export function loadFiles (store, folderId) {
    store.files.loading.set(true);
    store.files.selected.set([]);

    // Get file list
    fetchData(API_ENDPOINTS.filesList, {
        'method': 'GET',
        'data': {
            'category': folderId
        }
    })
        .then((response) => {
            store.files.loading.set(false);
            setFiles(store, response);
        })
        .catch((err) => {
            store.files.loading.set(false);
        });
}


/**
 * Move files
 * 
 * @param {object} store State store
 * @param {array} fileIds File ids
 * @param {number} folderId Folder id
 */
export function moveFiles (store, fileIds, folderId) {
    removeFilesFromTheGrid(store, fileIds);

    // Show folder loading icon
    store.folders.list[folderId].loading.set(true);
    store.folders.list[folderId].disabled.set(true);
    
    // Change parent folder for files
    const prevFolderIds = [];
    each(fileIds, (fileId) => {
        prevFolderIds.push(store.files.list[fileId].parent.get());
        store.files.list[fileId].parent.set(folderId);
    });

    // Get file list
    fetchData(API_ENDPOINTS.filesMove, {
        'method': 'GET',
        'data': {
            'category': folderId
        }
    })
        .catch((err) => {
            // Revert            
            each(fileIds, (fileId, index) => {
                store.files.list[fileId].parent.set(prevFolderIds[index]);
            });

            addFilesToTheGrid(store, fileIds);
        })
        .finally(() => {
            // Hide folder loading icon
            store.folders.list[folderId].loading.set(false);
            store.folders.list[folderId].disabled.set(false);
        });
}


/**
 * Remove files from the grid
 * 
 * @param {object} store State store
 * @param {array} fileIds File ids
 */
export function removeFilesFromTheGrid (store, fileIds) {
    let grid = store.files.grid.get();
    grid = filter(grid, id => fileIds.indexOf(id) === -1);
    store.files.grid.set(grid);
}


/**
 * Remove files from the grid
 * 
 * @param {object} store State store
 * @param {array} fileIds File ids
 */
export function addFilesToTheGrid (store, fileIds) {
    let grid = store.files.grid.get();
    grid = filter(grid, id => fileIds.indexOf(id) === -1);
    grid = [].concat(grid, fileIds);

    // Sort by filename
    grid = grid.sort((aId, bId) => {
        const aName = store.files.list[aId].fileName.get('');
        const bName = store.files.list[bId].fileName.get('');
        return aName.localeCompare(bName);
    });

    store.files.grid.set(grid);
}
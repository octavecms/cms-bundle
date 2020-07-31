import map from 'lodash/map';
import each from 'lodash/each';
import filter from 'lodash/filter';
import reduce from 'lodash/reduce';
import FILE_ICONS from 'media/utils/file-icons';

import { fetchData } from './actions-fetch';


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
    // Add icons to the files
    each(files, (file) => {
        if (!file.image && !file.icon) {
            const extension = file.filename.replace(/^.*\./, '');
            const icon = filter(FILE_ICONS, (icon) => icon.extensions.indexOf(extension) !== -1);

            file.icon = icon ? icon.icon : 'unknown';
        }
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
}


/**
 * Load files
 * 
 * @param {object} store State store
 * @param {number} folderId Folder id
 */
export function loadFiles (store, folderId) {
    store.files.loading.set(true);

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
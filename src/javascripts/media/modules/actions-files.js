import map from 'lodash/map';
import each from 'lodash/each';
import filter from 'lodash/filter';
import reduce from 'lodash/reduce';
import FILE_ICONS from '../utils/file-icons';


/**
 * Set selected file ids
 * 
 * @param {object} state State
 * @param {array} ids List of file ids
 */
export function setSelectedFiles (state, ids) {
    state.files.selected.set(ids);
}


/**
 * Set files
 * 
 * @param {object} state State
 * @param {array} files List of files
 */
export function setFiles (state, files) {
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
    
    state.files.set({
        ...state.files.get(),
        grid: grid,
        list: list
    });
}
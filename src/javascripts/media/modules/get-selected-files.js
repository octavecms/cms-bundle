import map from 'lodash/map';
import omit from 'lodash/omit';

export default function getSelectedFiles (store) {
    let ids = store.files.selected.get();

    if (!ids.length && store.multiselect.get()) {
        // There is no file selected (folder is selected), but multiselect is allowed
        // so we select all files in the folder
        ids = store.files.grid.get();
    }
    
    return map(ids, (id) => {
        return omit(store.files.list[id].get(), ['loading', 'searchMatch']);
    });
}
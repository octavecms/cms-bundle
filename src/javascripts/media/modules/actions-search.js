import without from 'lodash/without';
import getSearchMatch from 'media/util/get-search-match';


/**
 * Set search query
 * 
 * @param {object} store State store
 * @param {string} query Search query
 */
export function setSearchQuery (state, query) {
    query = query.trim();

    state.files.searchFilter.set(query);

    const files = state.files.list.get();
    let hasSearchResults = !query;
    // let selected = [].concat(store.files.selected.get());
    // let selectedChanged = false;

    for (let key in files) {
        const id = files[key].id;
        const matches = !query || getSearchMatch(query, files[id].fileName);
        state.files.list[id].searchMatch.set(matches);

        if (matches) {
            hasSearchResults = true;
        }

        // Remove non-matching items from selected file list
        // if (query && !matches) {
        //     const index = selected.indexOf(id);
        //     if (index !== -1) {
        //         selectedChanged = true;
        //         selected.splice(index, 1);
        //     }
        // }
    }

    state.files.hasSearchResults.set(hasSearchResults);

    // 
    // if (selectedChanged) {
    //     state.files.selected.set(selected);
    // }
}
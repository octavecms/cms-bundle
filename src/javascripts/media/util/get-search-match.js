const REGEX_SPLIT = /\s/;

export default function getSearchMatch (search, str) {
    if (str.indexOf(search) !== -1) {
        return true;
    } else {
        const searchParts = search.split(REGEX_SPLIT);
        let score = 0;
    
        for (let i = 0; i < searchParts; i++) {
            if (searchParts[i].length >= 2) {
                if (str.indexOf(searchParts[i]) !== -1) {
                    return true;
                }
            }
        }
    
        return false;
    }
}
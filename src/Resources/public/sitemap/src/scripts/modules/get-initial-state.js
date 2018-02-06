import map from 'lodash/map';
import reduce from 'lodash/reduce';


function transformTreeBranch (pages) {
    let pageList = [];

    map(pages, (page) => {
        pageList.push(page);

        if (page.children) {
            pageList.push(...transformTreeBranch(page.children));
            page.children = map(page.children, page => page.id);
        }
    });

    return pageList;
}

function transformTreeRoot (state) {
    if (state.tree.root) {
        const pages = state.tree.pages.concat(transformTreeBranch([state.tree.root]));
        state.tree.pages = reduce(pages, (list, page) => { list[page.id] = page; return list; }, {});
        state.tree.root = state.tree.root.id;
    }

    return state;
}

export default function (state) {
    return transformTreeRoot($.extend(true, {
        'tree': {
            // Root page id; if an object is passed from SITEMAP_INITIAL_STATE, then it will be transformed into 'page' object
            'root': null,

            'pages': [
                // {...folder information..}
            ],

            'temporary': false
        },

        'error': {
            'visible': false,
            'message': '' 
        }
    }, window.SITEMAP_INITIAL_STATE, state));
};
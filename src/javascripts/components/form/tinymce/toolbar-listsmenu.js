const isListNode = matchNodeNames(/^(OL|UL|DL)$/);
const isTableCellNode = matchNodeNames(/^(TH|TD)$/);

function isCustomList (list) {
    return /\btox\-/.test(list.className);
};

function matchNodeNames (regex) {
    return function (node) {
        return node && regex.test(node.nodeName);
    };
}

/**
 * Update list button state
 * 
 * @param {object} editor Editor
 * @param {function} activate Callback function
 */
function listState (editor, activate) {
    return function () {
        var nodeChangeHandler = function (e) {
            let inList = false;

            for (let i = 0; i < e.parents.length; i++) {
                const element = e.parents[i];
                if (isTableCellNode(element)) {
                    break;
                } else if (isListNode(element) && !isCustomList(element)) {
                    inList = true;
                    break;
                }
            }
            
            activate(inList);
        };

        editor.on('NodeChange', nodeChangeHandler);
        return function () {
            return editor.off('NodeChange', nodeChangeHandler);
        };
    };
};

export default function setupToolbarListsMenu (editor) {
    editor.ui.registry.addMenuButton('listmenu', {
        type: 'menubutton',
        text: '',
        tooltip: 'Lists',
        icon: 'unordered-list',

        fetch: (callback) => {
            callback([
                {
                    type: 'menuitem',
                    icon: 'unordered-list',
                    tooltip: 'Bullet list',
                    onAction: () => { editor.execCommand('InsertUnorderedList'); },
                },
                {
                    type: 'menuitem',
                    icon: 'ordered-list',
                    tooltip: 'Numbered list',
                    onAction: () => { editor.execCommand('InsertOrderedList'); },
                },
                {
                    type: 'menuitem',
                    icon: 'indent',
                    tooltip: 'Indent list',
                    onAction: () => { editor.execCommand('indent'); },
                    onSetup: function (api) {
                        return listState(editor, function (active) {
                            console.log('setDisabled', !active);
                            return api.setDisabled(!active); // @TODO Not working!!!
                        });
                    }
                },
                {
                    type: 'menuitem',
                    icon: 'outdent',
                    tooltip: 'Outdent list',
                    onAction: () => { editor.execCommand('outdent'); },
                    onSetup: function (api) {
                        return listState(editor, function (active) {
                            console.log('setDisabled', !active);
                            return api.setDisabled(!active); // @TODO Not working!!!
                        });
                    }
                },
            ]);
        }
    });
}
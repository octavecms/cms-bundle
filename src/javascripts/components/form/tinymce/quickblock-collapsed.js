function isImage (node) {
    return node.nodeName === 'IMG' || node.nodeName === 'FIGURE' && /image/i.test(node.className);
};
function isEditable (editor, node) {
    return editor.dom.getContentEditableParent(node) !== 'false';
};
function isEmtpy (node) {

}

/**
 * When text selection is collapsed show toolbar with "Bold", "Italic", etc. buttons too
 * 
 * @param {object} editor Editor instance
 */
export default function setupQuickblockCollapsedToolbar (editor) {
    const collapsedToolbarItems = editor.getParam('quickbars_collapsed_toolbar', '');

    if (collapsedToolbarItems && collapsedToolbarItems.trim().length > 0) {
        editor.ui.registry.addContextToolbar('textscollapsed', {
            predicate: function (node) {
                return !isImage(node) && editor.selection.isCollapsed() && isEditable(editor, node) && !editor.dom.isEmpty(node);
            },
            items: collapsedToolbarItems,
            position: 'node',
            scope: 'editor'
        });
    }
}
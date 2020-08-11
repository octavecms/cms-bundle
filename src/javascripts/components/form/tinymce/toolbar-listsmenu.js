export default function setupToolbarListsMenu (editor) {
    editor.ui.registry.addMenuButton('listmenu', {
        type: 'menubutton',
        text: '',
        tooltip: 'Insert list',
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
                },
                {
                    type: 'menuitem',
                    icon: 'outdent',
                    tooltip: 'Outdent list',
                    onAction: () => { editor.execCommand('outdent'); },
                },
            ]);
        }
    });
}
/**
 * Insert link using link command from quicklink plugin
 * 
 * @param {object} editor Editor object
 * @param {object} formApi FormAPI object
 * @param {string} value Link url
 */
function insertAnchorElement (editor, formApi, value) {
    const quicklink = editor.ui.registry.getAll().contextToolbars.quicklink;
    const linkCommand = quicklink.commands[0];

    linkCommand.onAction({
        'getValue': () => value,
        'hide': formApi.hide.bind(formApi)
    });
}

/**
 * Add a button to the quicklink toolbar which will open
 * media library
 * 
 * @param {object} editor Editor object
 */
function addButton (editor) {
    const quicklink = editor.ui.registry.getAll().contextToolbars.quicklink;

    if (quicklink) {
        quicklink.commands.push({
            type: 'contextformbutton',
            icon: 'image',
            tooltip: 'Select file from media library',
            onSetup: function (buttonApi) {
                return function () {};
            },
            onAction: function (formApi) {
                $.ajaxmodal.open('/media-modal.html', null, {
                    // Media library args
                    'select': true,
                    'multiselect': false,
                    'onselect': (files) => {
                        if (files.length) {
                            const value = files[0].url;
                            insertAnchorElement(editor, formApi, value);
                        }
                    }
                });
            },
        });

        return true;
    } else {
        return false;
    }
}

/**
 * Add a button to the quicklink toolbar which will open
 * media library
 * 
 * @param {object} editor Editor object
 */
export default function setupQuickLinkMediaLibraryLink (editor) {
    // Re-try for 1 second to add a button, give up after that
    let retries = 10;
    const check = () => {
        if (!addButton(editor) && retries) {
            retries--;
            setTimeout(check, 100);
        }
    };

    check();
}
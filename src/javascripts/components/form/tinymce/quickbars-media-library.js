/**
 * Add buttons to the quickbars toolbar which will open
 * media library to insert or replace image
 * 
 * @param {object} editor Editor object
 */
function addButton (editor) {
    const imageAction = function () {
        $.ajaxmodal.open('/media-modal.html', null, {
            // Media library args
            'select': true,
            'multiselect': false,
            'filter': 'images',
            'onselect': (files) => {
                if (files.length) {
                    const image = files[0];

                    editor.execCommand('mceUpdateImage', null, {
                        'src': image.url,
                        'width': image.width,
                        'height': image.height
                    });
                }
            }
        });
    };

    editor.ui.registry.addButton('quickimage-ml-insert', {
        icon: 'image',
        tooltip: 'Insert image',
        onAction: imageAction
    });

    editor.ui.registry.addButton('quickimage-ml-replace', {
        icon: 'image',
        tooltip: 'Edit image',
        onAction: imageAction
    });

    // Overwrite image menu item
    editor.ui.registry.addMenuItem('image', {
        icon: 'image',
        text: 'Image...',
        onAction: imageAction
    });
}

/**
 * Add buttons to the quickbars toolbar which will open
 * media library to insert or replace image
 * 
 * @param {object} editor Editor object
 */
export default function setupQuickBarsMediaLibraryImage (editor) {
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
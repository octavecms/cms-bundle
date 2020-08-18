/**
 * Disable table toolbar, as per design
 *
 * @param {object} editor Editor instance
 */
export default function setupTableDisable (editor) {
    editor.ui.registry.addContextToolbar('table', {
        predicate: () => false,
        items: '',
        scope: 'node',
        position: 'node'
    });
}

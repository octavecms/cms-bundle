export function addSelectedFile (store, id) {
    const isDisabled = store.files.list[id].disabled.get();
    let selected = [].concat(store.files.selected.get());

    if (!isDisabled && selected.indexOf(id) === -1) {
        selected.push(id);
        store.files.selected.set(selected);
    }
}

export function setSelectedFile (store, id) {
    const isDisabled = store.files.list[id].disabled.get();

    if (!isDisabled) {
        store.files.selected.set([id]);
    }
}

export function expandSelectedFileList (store, id) {
    let selected = [].concat(store.files.selected.get());

    if (!selected.length) {
        setSelectedFile(store, id);
    } else {
        const grid = store.files.grid.get();
        const itemIndex = grid.indexOf(id);
        const lastIndex = grid.indexOf(selected[selected.length - 1]);
    
        for (let i = Math.min(itemIndex, lastIndex); i <= Math.max(itemIndex, lastIndex); i++) {
            const itemId = grid[i];
            const isDisabled = store.files.list[itemId].disabled.get();
    
            if (!isDisabled) {
                if (selected.indexOf(itemId) === -1) {
                    selected.push(itemId);
                }
            }
        }
    
        store.files.selected.set(selected);
    }
}

export function toggleSelectedFile (store, id) {
    const isDisabled = store.files.list[id].disabled.get();

    if (!isDisabled) {
        let selected = [].concat(store.files.selected.get());

        if (selected.indexOf(id) !== -1) {
            selected = without(selected, id);
        } else {
            selected.push(id);
        }

        store.files.selected.set(selected);
    }
}
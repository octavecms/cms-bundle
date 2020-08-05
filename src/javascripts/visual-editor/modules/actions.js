import map from 'lodash/map';
import reduce from 'lodash/reduce';
import without from 'lodash/without';
import { fetchData } from 'media/modules/actions-fetch';

import { getPreviousSection, getNextSection } from 'visual-editor/modules/sections';


/**
 * Change page language
 * 
 * @param {object} store Store
 * @param {string} language Language
 */
export function setLanguage (store, language) {
    store.language.set(language);
    loadPage(store, store.id.get(), language);
}

/**
 * Load page
 * 
 * @param {object} store Store
 * @param {string|number} id Page ID
 * @param {string} language Language
 */
export function loadPage (store, id, language) {
    store.loading.set(true);

    fetchData(VISUAL_EDITOR_API_ENDPOINTS.getPage, {
        'id': id,
        'language': language,
    })
        .then((response) => {
            setIframeHTML(store, response.html);
            setSections(store, response.sections);
        })
        .finally(() => {
            store.loading.set(false);
        });
}

function setIframeHTML (store, html) {
    store.iframe.html.set(html);
}

function setSections (store, sections) {
    const list = reduce(sections, (list, section) => {
        list[section.id] = section;

        // Add properties
        section.loading = section.loading || false;
        section.visible = true;
        
        return list;
    }, {});

    const order = map(sections, (section) => section.id);
    
    store.sections.list.set(list);
    store.sections.order.set(order);
}

/**
 * Add section to the list
 * 
 * @param {object} store Store
 * @param {string|number} parent Parent id
 * @param {string|number} reference Reference if before which to insert section
 * @param {string} type Section type id
 */
export function addSection (store, parent, reference, type) {
    fetchData(VISUAL_EDITOR_API_ENDPOINTS.addSection, {
        'method': 'POST',
        'data': {
            'type': type,
            'insert': 'before',
            'reference': reference,
            'parent': parent,
            'language': store.language.get()
        }
    })
        .then((data) => {
            // Make sure it doesn't exist yet (for DEV mode where server data is static)
            if (!store.insert[data.id].get()) {
                data.loading = true;
                data.visible = true;
                data.reference = reference;
    
                store.insert[data.id].set(data);
            }
        });
}

/**
 * Move section up
 * 
 * @param {object} store Store
 * @param {string|number} id Section ID
 */
export function moveSectionUp (store, id) {
    const refId = getPreviousSection(store, id);

    if (refId) {
        moveSection(store, id, refId);
    }
}

/**
 * Move section down
 * 
 * @param {object} store Store
 * @param {string|number} id Section ID
 */
export function moveSectionDown (store, id) {
    const refId = getNextSection(store, getNextSection(store, id));

    moveSection(store, id, refId);
}

/**
 * Move section before the reference element
 * 
 * @param {object} store Store
 * @param {string|number} id Section ID
 * @param {string|number} reference Reference section ID before which to move section
 */
export function moveSection (store, id, reference) {
    const order = [].concat(store.sections.order.get());
    const prevOrder = [].concat(order);
    const idIndex = order.indexOf(id);
    const referenceIndex = reference ? order.indexOf(reference) : null;

    if (referenceIndex || referenceIndex === 0) {
        if (idIndex < referenceIndex) {
            order.splice(referenceIndex, 0, id);
            order.splice(idIndex, 1);
        } else {
            order.splice(idIndex, 1);
            order.splice(referenceIndex, 0, id);
        }
    } else {
        order.splice(idIndex, 1);
        order.push(id);
    }

    store.sections.order.set(order);
    store.sections.list[id].loading.set(true);

    fetchData(VISUAL_EDITOR_API_ENDPOINTS.moveSection, {
        'method': 'POST',
        'data': {
            'id': id,
            'insert': 'before',
            'reference': reference,
            'language': store.language.get()
        }
    })
        .finally(() => {
            store.sections.list[id].loading.set(false);
        })
        .catch(() => {
            // Restore previous order
            store.sections.order.set(prevOrder);
        });
}

/**
 * Remove section
 * 
 * @param {object} store Store
 * @param {string|number} id Section ID
 */
export function removeSection (store, id) {
    store.sections.list[id].visible.set(false);
    store.sections.list[id].loading.set(true);

    fetchData(VISUAL_EDITOR_API_ENDPOINTS.removeSection, {
        'method': 'POST',
        'data': {
            'id': id,
            'language': store.language.get()
        }
    })
        .then(() => {
            const order = [].concat(store.sections.order.get());

            store.sections.list[id].remove();
            store.sections.order.set(without(order, id));
            store.iframe.offsets[id].remove();
            store.iframe.heights[id].remove();
        })
        .catch(() => {
            // Restore previous state
            store.sections.list[id].visible.set(true);
            store.sections.list[id].loading.set(false);
        });
}

/**
 * Update sections 'published' state
 * 
 * @param {object} store Store
 * @param {string|number} id Section ID
 * @param {boolean} published Published state
 */
export function updateSection (store, id, published) {
    const prevPublished = store.sections.list[id].published.get();
    if (prevPublished === published) return;

    store.sections.list[id].published.set(published);
    store.sections.list[id].loading.set(true);

    fetchData(VISUAL_EDITOR_API_ENDPOINTS.updateSection, {
        'method': 'POST',
        'data': {
            'id': id,
            'published': published,
            'language': store.language.get()
        }
    })
        .finally(() => {
            store.sections.list[id].loading.set(false);
        })
        .catch(() => {
            // Restore previous state
            store.sections.list[id].published.set(prevPublished);
        });
}
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import { fetchData } from 'media/modules/actions-fetch';

export function loadPage (store) {
    store.loading.set(true);

    fetchData(VISUAL_EDITOR_API_ENDPOINTS.getPage, {
        'id': store.id.get(),
        'language': store.language.get()
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
        section.height = section.height || 0;
        section.offset = section.offset || 0;
        
        return list;
    }, {});

    const order = map(sections, (section) => section.id);
    
    store.sections.list.set(list);
    store.sections.order.set(order);
}

export function addSection (store, id, reference, type) {

}

export function moveSectionUp (store, id) {

}

export function moveSectionDown (store, id) {
    
}

export function moveSection (store, id, reference) {

}

export function removeSection (store, id) {

}

export function updateSection (store, id, published) {
    
}
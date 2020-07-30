const staticMediaState = window.MEDIA_LIBRARY_STATIC_STATE || (window.MEDIA_LIBRARY_STATIC_STATE = {
    'folders': {
        'selected': null
    }
});

export function setStaticState (state) {
    $.extend(true, staticMediaState, state);
}

export function getStaticState () {
    return staticMediaState;
}
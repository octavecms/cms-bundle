const staticMediaState = window.MEDIA_LIBRARY_STATIC_STATE || (window.MEDIA_LIBRARY_STATIC_STATE = {
    'categoryId': null
});

export function setStaticInitialState (state) {
    $.extend(true, staticMediaState, state);
}

export function getStaticInitialState () {
    return staticMediaState;
}

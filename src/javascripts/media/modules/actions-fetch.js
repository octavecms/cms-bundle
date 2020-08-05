import { setErrorMessage } from './actions-error';

// const IS_DEV_MODE = (document.location.hostname === 'localhost' || document.location.hostname === '127.0.0.1') && document.location.port === '3000';
const IS_DEV_MODE = true;
const USE_DEV_MODE_DELAY = true;
const USE_DEV_MODE_OVERWRITE = true;


function devModeFetchDelay (url, request, response) {
    if (IS_DEV_MODE && USE_DEV_MODE_DELAY) {
        const delay = url.indexOf('-list') !== -1 ? 250 : 1000;

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(response);
            }, delay);
        });
    } else {
        return response;
    }
}

function devModeFetchOverwrites (params) {
    if (IS_DEV_MODE && USE_DEV_MODE_OVERWRITE) {
        params.method = 'GET';
    }

    return params;
}

/**
 * Encode data into fetch body or url
 * 
 * @param {object} params Request parameters
 * @returns {object} Request parameters
 */
function encodeData (params) {
    // Convert data into body
    if (params.data) {
        if (params.method.toUpperCase() === 'POST') {
            params.headers = { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' };
            params.body = decodeURIComponent($.param(params.data));
        } else {
            params.url = params.url + (params.url.indexOf('?') !== -1 ? '&' : '?') + $.param(params.data);
        }
    }

    delete(params.data);
    return params;
}

export function fetchData (url, options) {
    if (url) {
        let params = {
            'method': 'GET',
            'url': url,
            'credentials': 'same-origin',
            ...options
        };
    
        params = devModeFetchOverwrites(params);
        params = encodeData(params);
    
        // Get url, it may have been overwritten by dev mode
        url = params.url;
        delete(params.url);
    
        return fetch(url, params)
            .then((response) => {
                return response.json();
            })
            .then(devModeFetchDelay.bind(null, url, params))
            .then((json) => {
                if (json && json.status) {
                    return json.data;
                } else if (json && json.message) {
                    setErrorMessage(store, json.message);
                    return Promise.reject(json.message);
                } else {
                    return Promise.reject();
                }
            });
    } else {
        // Resolve immediatelly
        return Promise.resolve(null);
    }
}
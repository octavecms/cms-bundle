export function processOptions (options) {
    return {
        mobileOnly: options.mobileOnly === false ? false : true,
        enableMq: options.enableMq || null,
        properties: options.properties || null
    };
}

export default {
    processOptions
};

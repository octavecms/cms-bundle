export default function formatSize (size) {
    let value = size / 1024;
    let unit  = 'Kb';

    if (value > 1024) {
        value = value / 1024;
        unit = 'Mb';

        if (value > 1024) {
            value = value / 1024;
            unit = 'Gb';
        }
    }

    return `${ Math.ceil(value) } ${ unit }`;
}
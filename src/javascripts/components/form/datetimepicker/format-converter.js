const FORMATS = {
    // Date
    'MMMM': 'F', // January, December
    'MMM': 'M', // Jan, Dec
    'MM': 'm', // Month: 01, 12
    'Mo': 'n', // Month: 1, 12
    'M': 'n', // Month: 1, 12

    'DD': 'd', // Date: 01, 02, 31,
    'Do': 'J', // Date: 1st, 2nd, 31st
    'D': 'j', // Date: 1, 2, 31

    // Quarter
    'Qo': '',
    'Q': '',

    // Day of the year
    'DDD': '',
    'DDDo': '',
    'DDDD': '',

    'dddd': 'l', // Sunday through Saturday
    'ddd': 'D', // Mon through Sun
    'dd': 'D', // Mo -> Mon, Su -> Sun
    'do': 'D', // 0th -> Mon, 6th -> Sun
    'd': 'w', // 0, 1, 6

    'WO': 'W', // week of the year
    'WW': 'W', // week of the year
    'W': 'W', // week of the year
    'wo': 'W', // week of the year
    'ww': 'W', // week of the year
    'w': 'W', // week of the year

    'YYYYYY': 'Y',
    'YYYY': 'Y', // Year 1999, 2003
    'YY': 'y', // Year: 99, 03
    'Y': 'Y',
    'y': 'Y',

    'X': 'U', // Timestamp
    'x': 'U', // Timestamp

    // Locale aware formats
    'LLLL': 'l, F j Y '
    LLLL	Thursday, September 4 1986 8:30 PM	Day of week, month name, day of month, year, time

    L	04/09/1986	Date (in local format)
    LL	September 4 1986	Month name, day of month, year
    LLL	September 4 1986 8:30 PM	Month name, day of month, year, time
    LT	8:30 PM	Time (without seconds)
    LTS	8:30:00 PM	Time (with seconds)

    // Time
    'HH': 'H', // 00 to 23
    'hh': 'G', // 01 to 12
    'h': 'h', // 1 to 12


    // H	Hours (24 hours)	00 to 23
    // h	Hours	1 to 12
    // G	Hours, 2 digits with leading zeros	1 to 12
    i	Minutes	00 to 59
    S	Seconds, 2 digits	00 to 59
    s	Seconds	0, 1 to 59
    K	AM/PM	AM or PM

    H	0 1 ... 22 23
    // HH	00 01 ... 22 23
    // h	1 2 ... 11 12
    // hh	01 02 ... 11 12
    k	1 2 ... 23 24
    kk	01 02 ... 23 24
};

/**
 * Convert date format from moment.js into flatpickr
 * 
 * @param {string} format Date format
 * @returns {string} Flatpickr format
 */
export default function convertMomentToFlatPickrFormat (format) {
    const regex = new Regexp(`(${ Object.keys(FORMATS).join('|') })`, 'g');
    
    return format.replace(regex, (key) => {
        return FORMATS[key];
    });
}
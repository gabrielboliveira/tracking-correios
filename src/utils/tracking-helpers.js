const _isString = require('lodash/isString');
const { VALID_INITIALS } = require('./consts');

function matchesPattern (object) {
    return /^([A-Z]{2}[0-9]{9}[A-Z]{2}){1}$/.test(object);
}

function category (object) {
    if (! matchesPattern(object) || ! _isString(object)) {
        return;
    }

    return VALID_INITIALS[object.substr(0, 2)];
}

function isValid (object) {
    return category(object) !== undefined;
}

module.exports = {
    category, isValid,
};

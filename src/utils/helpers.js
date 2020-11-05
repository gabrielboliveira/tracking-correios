const _isString = require('lodash/isString');
const _isObject = require('lodash/isObject');

function expand (item) {
    if (Array.isArray(item)) {
        if (item.length === 1) {
            return expand(item[0]);
        }

        return item.map(expand);
    }

    if (_isObject(item)) {
        for (let key in item) {
            item[key] = expand(item[key]);
        }

        return item;
    }

    if (_isString(item)) {
        return item.trim();
    }
}

function arrayOf (item) {
    return Array.isArray(item) ? item : (item !== undefined ? [ item ] : []);
}

module.exports = {
    expand,
    arrayOf,
};

function expand (item) {
    if (Array.isArray(item)) {
        if (item.length === 1) {
            return expand(item[0])
        }
        return item.map(expand)
    } else if(isObject(item)) {
        for(let key in item) {
            item[key] = expand(item[key])
        }
    } else if (isString(item)) {
        item = item.trim()
    }
    return item
}

function isObject (item) {
    return item === Object(item)
}

function isString (item) {
    return typeof item === 'string' || item instanceof String
}

function arrayOf (item) {
    return Array.isArray(item) ? item : ( item !== undefined ? [ item ] : [] )
}

module.exports = {
    expand, isObject, isString, arrayOf
}

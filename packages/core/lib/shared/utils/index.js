import 'rxjs';

/**
 * @function isArray
 */
const isArray = Array.isArray;
function isStringOrNumber(value) {
    const type = typeof value;
    return type === 'string' || type === 'number';
}
function isNullOrUndef(value) {
    return value === void 0 || value === null;
}
function isFunction(value) {
    return typeof value === 'function';
}
function isString(value) {
    return typeof value === 'string';
}
function isBoolean(value) {
    return value === true || value === false;
}
function isIndexFirstInArray(index) {
    return index === 0;
}
function isIndexLastInArray(index, array) {
    return index === array.length - 1;
}

export { isArray, isBoolean, isFunction, isIndexFirstInArray, isIndexLastInArray, isNullOrUndef, isString, isStringOrNumber };

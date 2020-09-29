/**
 * Compare function for sortNestedIndexes()
 * @param {string} indexA
 * @param {string} indexB
 * @returns {number}
 */
const nestedIndexCompare = (indexA, indexB) => {
    const partsOfIndexA = indexA.split('.');
    const partsOfIndexB = indexB.split('.');
    if (partsOfIndexA.length > partsOfIndexB.length) {
        for (let i = 0; i < partsOfIndexB.length; i++) {
            const partToCheckA = Number(partsOfIndexA[i]);
            const partToCheckB = Number(partsOfIndexB[i]);
            if (partToCheckA !== partToCheckB) {
                return partToCheckA - partToCheckB;
            }
        }
    }
    else {
        for (let i = 0; i < partsOfIndexA.length; i++) {
            const partToCheckA = Number(partsOfIndexA[i]);
            const partToCheckB = Number(partsOfIndexB[i]);
            if (partToCheckA !== partToCheckB) {
                return partToCheckA - partToCheckB;
            }
        }
    }
    return 0;
};
/**
 * Sorting function for Array.prototype.sort() callback.
 * Sorting indexes which could be nested (it means ie. '1', but also '1.0.2')
 * @example
 * Before: ['4', '3', '3.4', '3.1', '0', '3.3', '3.3.1', '6', '3.2', '3.3.0' '5', '1', '3.0']
 * After: ['0', '1', '3', '3.0', '3.1', '3.2', '3.3', '3.3.0', '3.3.1', '3.4', '4', '5', '6']
 * @func sortNestedIndexes
 * @param {string[]} indexes - have to be string of /^\d+(.\d+)*$/ pattern ('1' or '3.0.23' etc.)
 * @returns {string[]}
 */
var sortNestedIndexes = (indexes) => indexes.sort(nestedIndexCompare);

export default sortNestedIndexes;

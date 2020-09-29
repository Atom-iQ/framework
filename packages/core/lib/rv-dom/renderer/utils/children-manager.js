import { isIndexLastInArray, isIndexFirstInArray } from '../../../shared/utils/index.js';
import { _FRAGMENT } from '../../../shared/constants.js';
import sortNestedIndexes from '../../../shared/utils/sort-nested-indexes.js';

/**
 * Utility class for keeping the order of rendered element children.
 * Class is internal for the ES Module, for external usage factory
 * function is exported and for typings {@link CreatedChildrenManager}
 * interface should be used
 */
class ChildrenManager {
    constructor() {
        /**
         * Get iterator for Children Map
         */
        this[Symbol.iterator] = () => {
            return this.toEntriesArray()[Symbol.iterator]();
        };
        this.indexes = [];
        this.children = {};
        this.fragmentIndexes = [];
        this.fragmentChildren = {};
        this.has = (key) => !!this.children[key];
        this.get = (key) => this.children[key];
        this.hasFragment = (key) => !!this.fragmentChildren[key];
        this.getFragment = (key) => this.fragmentChildren[key];
        this.setFnFactory = (mode, isFragment = false) => (key, value) => {
            try {
                const isAddMode = mode === 'add';
                const hasKey = isFragment ? !!this.fragmentChildren[key] : !!this.children[key];
                const shouldSet = isAddMode ? !hasKey : hasKey;
                if (shouldSet) {
                    if (isFragment) {
                        if (isAddMode)
                            this.fragmentIndexes = this.fragmentIndexes.concat(key);
                        this.fragmentChildren[key] = value;
                    }
                    else {
                        if (isAddMode)
                            this.indexes = this.indexes.concat(key);
                        this.children[key] = value;
                    }
                    return true;
                }
                return false;
            }
            catch (e) {
                return false;
            }
        };
        this.add = this.setFnFactory('add');
        this.replace = this.setFnFactory('replace');
        this.addFragment = this.setFnFactory('add', true);
        this.replaceFragment = this.setFnFactory('replace', true);
        this.createEmptyFragment = (index) => this.addFragment(index, {
            index,
            element: _FRAGMENT,
            fragmentChildIndexes: [],
            fragmentChildKeys: {},
            fragmentChildrenLength: 0
        });
        this.remove = (key) => this.has(key) && this.delete(key);
        this.removeFragment = (key) => this.hasFragment(key) && this.delete(key, true);
        this.size = () => this.indexes.length;
        this.empty = () => this.indexes.length === 0;
        this.getAll = () => this.indexes.map(index => this.children[index]);
        this.getKeys = () => this.indexes;
        this.removeAll = () => {
            this.indexes = [];
            this.children = {};
            return true;
        };
        this.toEntriesArray = () => this.indexes.map(this.mapToEntry);
        this.getFirstIndex = () => this.indexes[0];
        this.getFirstChild = () => this.children[this.indexes[0]];
        this.hasOneChild = () => this.indexes.length === 1;
        this.delete = (key, isFragment = false) => {
            try {
                if (isFragment) {
                    this.fragmentIndexes = this.fragmentIndexes.filter(index => index !== key);
                    delete this.fragmentChildren[key];
                }
                else {
                    this.indexes = this.indexes.filter(index => index !== key);
                    delete this.children[key];
                }
                return true;
            }
            catch (e) {
                return false;
            }
        };
        this.mapToEntry = (index) => ([index, this.children[index]]);
        this.getChildOrNull = (exists, getSiblingIndex) => {
            if (!exists) {
                return null;
            }
            return this.children[getSiblingIndex()];
        };
        this.getPositionInfoForNewChild = (index) => {
            const allSortedIndexes = ChildrenManager.sortIndexes(this.indexes.concat(index));
            const indexInArray = allSortedIndexes.indexOf(index);
            const isFirst = isIndexFirstInArray(indexInArray);
            const isLast = isIndexLastInArray(indexInArray, allSortedIndexes);
            const firstChild = this.getChildOrNull(!isFirst, () => allSortedIndexes[0]);
            const previousSibling = this.getChildOrNull(!isFirst, () => allSortedIndexes[indexInArray - 1]);
            const nextSibling = this.getChildOrNull(!isLast, () => allSortedIndexes[indexInArray + 1]);
            return {
                indexInArray,
                allSortedIndexes,
                isFirst,
                isLast,
                previousSibling,
                nextSibling,
                firstChild
            };
        };
    }
    /**
     * Object.prototype.toString() implementation
     */
    get [Symbol.toStringTag]() {
        return JSON.stringify(this.indexes);
    }
}
ChildrenManager.sortIndexes = (indexes) => sortNestedIndexes(indexes);
const getSortedFragmentChildIndexes = (fragment) => ChildrenManager.sortIndexes(fragment.fragmentChildIndexes);
/**
 * @func createdChildrenManager
 */
var createChildrenManager = () => (new ChildrenManager());

export default createChildrenManager;
export { getSortedFragmentChildIndexes };

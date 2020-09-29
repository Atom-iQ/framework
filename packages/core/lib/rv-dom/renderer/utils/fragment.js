import 'rxjs';
import 'rxjs/operators';

const childrenArrayToFragment = (children) => ({
    props: null,
    type: '_Fragment',
    children
});
const getFlattenFragmentChildren = (createdChildren, onlyIndexes = false) => (all, index) => {
    const child = createdChildren.get(index) || createdChildren.getFragment(index);
    return child.fragmentChildIndexes ?
        all.concat(child.fragmentChildIndexes.reduce(getFlattenFragmentChildren(createdChildren, onlyIndexes), [])) : all.concat(onlyIndexes ? child.index : child);
};

export { childrenArrayToFragment, getFlattenFragmentChildren };

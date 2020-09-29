function createRvdElement(type, props, children) {
    return _createElement(type, props, children, props.key, props.ref);
}
function _createElement(type, props, children, key, ref) {
    const rvdElement = {
        type,
        props,
        children
    };
    if (key)
        rvdElement.key = key;
    if (ref)
        rvdElement.ref = ref;
    if (isComponentType(type))
        rvdElement._component = type;
    return rvdElement;
}
function isComponentType(type) {
    return typeof type === 'function';
}

export { createRvdElement };

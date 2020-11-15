# Atom-iQ Babel Plugin JSX
###### `@atom-iq/babel-plugin-jsx`
This plugin transforms **JSX** into **Atom-iQ _Reactive Virtual DOM_ Nodes**:
- `RvdElementNode` for **HTML** and **SVG Elements**
- `RvdComponentNode` for **Components**
- `RvdFragmentNode` for **Fragments** (`<>{...}</>` or `<Fragment>{...}</Fragment>`
- `normalizeProps` function - called additionally for **Elements** with spread props

It's based on [**InfernoJS Babel Plugin**](https://github.com/infernojs/babel-plugin-inferno),
re-implemented for **Atom-iQ**. It's adding **Atom-iQ** specific **Element** and **Child** flags,
for faster checks on runtime. They're different from flags in
[**InfernoJS**](https://github.com/infernojs/inferno), specific for `rvDOM` architecture. It's also
simplified, as some optimizations aren't needed in **Atom-iQ** - in example it's not creating
(`rvDOM`) Text Nodes, just returning strings.

### How to use
It's recommended to use [**iQ CLI**](../cli) - it has included this plugin in standard build config.

Otherwise, include it in `plugins` in Babel config - in the current version it has no config.

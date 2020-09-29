/* eslint-disable no-case-declarations */
'use strict'
const jsx = require('@babel/plugin-syntax-jsx').default
const flags = require('./flags')
const t = require('@babel/types')
const svgAttributes = require('./attrsSVG')
const VNodeTypes = require('./vNodeTypes')
const VNodeFlags = flags.VNodeFlags
const ChildFlags = flags.ChildFlags

const fnNormalize = 'normalizeProps'
const fnNode = 'createRvdNode'
const fnComponent = 'createRvdComponentNode'
const fnFragment = 'createRvdFragmentNode'

function isComponent(name) {
  const firstLetter = name.charAt(0)

  return firstLetter.toUpperCase() === firstLetter
}

function isNullOrUndefined(obj) {
  return obj === undefined || obj === null
}

function isFragment(name) {
  return name === 'Fragment'
}

const NULL = t.identifier('null')

// All special attributes
const PROP_HasKeyedChildren = '$HasKeyedChildren'
const PROP_HasNonKeyedChildren = '$HasNonKeyedChildren'
const PROP_VNODE_CHILDREN = '$HasVNodeChildren'
const PROP_TEXT_CHILDREN = '$HasTextChildren'
const PROP_ReCreate = '$ReCreate'
const PROP_ChildFlag = '$ChildFlag'
const PROP_FLAGS = '$Flags'

const TYPE_ELEMENT = 0
const TYPE_COMPONENT = 1
const TYPE_FRAGMENT = 2

function _stringLiteralTrimmer(lastNonEmptyLine, lineCount, line, i) {
  const isFirstLine = i === 0
  const isLastLine = i === lineCount - 1
  const isLastNonEmptyLine = i === lastNonEmptyLine
  // replace rendered whitespace tabs with spaces
  let trimmedLine = line.replace(/\t/g, ' ')
  // trim leading whitespace
  if (!isFirstLine) {
    trimmedLine = trimmedLine.replace(/^[ ]+/, '')
  }
  // trim trailing whitespace
  if (!isLastLine) {
    trimmedLine = trimmedLine.replace(/[ ]+$/, '')
  }
  if (trimmedLine.length > 0) {
    if (!isLastNonEmptyLine) {
      trimmedLine += ' '
    }
    return trimmedLine
  }
  return ''
}

function handleWhiteSpace(value) {
  const lines = value.split(/\r\n|\n|\r/)
  let lastNonEmptyLine = 0

  for (let i = lines.length - 1; i > 0; i--) {
    if (lines[i].match(/[^ \t]/)) {
      lastNonEmptyLine = i
      break
    }
  }
  const str = lines
    .map(_stringLiteralTrimmer.bind(null, lastNonEmptyLine, lines.length))
    .filter(function (line) {
      return line.length > 0
    })
    .join('')

  if (str.length > 0) {
    return str
  }
  return ''
}

function jsxMemberExpressionReference(t, node) {
  if (t.isJSXIdentifier(node)) {
    return t.identifier(node.name)
  }
  if (t.isJSXMemberExpression(node)) {
    return t.memberExpression(
      jsxMemberExpressionReference(t, node.object),
      jsxMemberExpressionReference(t, node.property)
    )
  }
}

function getVNodeType(astNode) {
  const astType = astNode.type
  let flags
  let type
  let vNodeType

  if (astType === 'JSXIdentifier') {
    const astName = astNode.name

    if (isFragment(astName)) {
      vNodeType = TYPE_FRAGMENT
    } else if (isComponent(astName)) {
      vNodeType = TYPE_COMPONENT
      type = t.identifier(astName)
      flags = VNodeFlags.ComponentFunction
    } else {
      vNodeType = TYPE_ELEMENT
      type = t.StringLiteral(astName)
      flags = VNodeTypes[astName] || VNodeFlags.HtmlElement
    }
  } else if (astType === 'JSXMemberExpression') {
    vNodeType = TYPE_COMPONENT
    type = jsxMemberExpressionReference(t, astNode)
    flags = VNodeFlags.ComponentFunction
  }
  return {
    type: type,
    vNodeType: vNodeType,
    flags: flags
  }
}

function getVNodeChildren(astChildren, opts, fileState, defineAll) {
  let children = []
  let parentCanBeKeyed = false
  let requiresNormalization = false
  let foundText = false

  for (let i = 0; i < astChildren.length; i++) {
    const child = astChildren[i]
    const vNode = createVNode(child, opts, fileState, defineAll)

    if (child.type === 'JSXExpressionContainer') {
      requiresNormalization = true
    } else if (child.type === 'JSXText' && handleWhiteSpace(child.value) !== '') {
      foundText = true
    }

    if (!isNullOrUndefined(vNode)) {
      children.push(vNode)

      /*
       * Loop direct children to check if they have key property set
       * If they do, flag parent as hasKeyedChildren to increase runtime performance of Inferno
       * When key already found within one of its children, they must all be keyed
       */
      if (parentCanBeKeyed === false && child.openingElement) {
        const astProps = child.openingElement.attributes
        let len = astProps.length

        while (parentCanBeKeyed === false && len-- > 0) {
          const prop = astProps[len]

          if (prop.name && prop.name.name === 'key') {
            parentCanBeKeyed = true
          }
        }
      }
    }
  }

  // Fix: When there is single child parent cant be keyed either, its faster
  // to use patch than patchKeyed routine in that case
  const hasSingleChild = children.length === 1

  children = hasSingleChild ? children[0] : t.arrayExpression(children)

  return {
    parentCanBeKeyed: !hasSingleChild && parentCanBeKeyed,
    children: children,
    foundText: foundText,
    parentCanBeNonKeyed:
      !hasSingleChild && !parentCanBeKeyed && !requiresNormalization && astChildren.length > 1,
    requiresNormalization: requiresNormalization,
    hasSingleChild: hasSingleChild
  }
}

function getValue(t, value) {
  if (!value) {
    return t.BooleanLiteral(true)
  }

  if (value.type === 'JSXExpressionContainer') {
    return value.expression
  }

  return value
}

function getName(t, name) {
  if (name.indexOf('-') !== 0) {
    return t.StringLiteral(name)
  }
  return t.identifier(name)
}

function getVNodeProps(astProps, isComponent) {
  let props = []
  let key = null
  let ref = null
  let className = null
  let hasTextChildren = false
  let hasKeyedChildren = false
  let hasNonKeyedChildren = false
  let childrenKnown = false
  let needsNormalization = false
  let hasReCreateFlag = false
  let propChildren = null
  let childFlags = null
  let flagsOverride = null
  let contentEditable = false

  for (let i = 0; i < astProps.length; i++) {
    const astProp = astProps[i]

    if (astProp.type === 'JSXSpreadAttribute') {
      needsNormalization = true
      props.push({
        astName: null,
        astValue: null,
        astSpread: astProp.argument
      })
    } else {
      let propName = astProp.name

      if (propName.type === 'JSXIdentifier') {
        propName = propName.name
      } else if (propName.type === 'JSXNamespacedName') {
        propName = propName.namespace.name + ':' + propName.name.name
      }

      if (!isComponent && (propName === 'className' || propName === 'class')) {
        className = getValue(t, astProp.value)
      } else if (!isComponent && propName === 'htmlFor') {
        props.push({
          astName: getName(t, 'for'),
          astValue: getValue(t, astProp.value),
          astSpread: null
        })
      } else if (!isComponent && propName === 'onDoubleClick') {
        props.push({
          astName: getName(t, 'onDblClick'),
          astValue: getValue(t, astProp.value),
          astSpread: null
        })
      } else if (propName.substr(0, 11) === 'onComponent' && isComponent) {
        if (!ref) {
          ref = t.ObjectExpression([])
        }
        ref.properties.push(t.ObjectProperty(getName(t, propName), getValue(t, astProp.value)))
      } else if (!isComponent && propName in svgAttributes) {
        // React compatibility for SVG Attributes
        props.push({
          astName: getName(t, svgAttributes[propName]),
          astValue: getValue(t, astProp.value),
          astSpread: null
        })
      } else {
        switch (propName) {
          case PROP_ChildFlag:
            childrenKnown = true
            childFlags = getValue(t, astProp.value)
            break
          case PROP_VNODE_CHILDREN:
            childrenKnown = true
            break
          case PROP_FLAGS:
            flagsOverride = getValue(t, astProp.value)
            break
          case PROP_TEXT_CHILDREN:
            childrenKnown = true
            hasTextChildren = true
            break
          case PROP_HasNonKeyedChildren:
            childrenKnown = true
            hasNonKeyedChildren = true
            break
          case PROP_HasKeyedChildren:
            childrenKnown = true
            hasKeyedChildren = true
            break
          case 'ref':
            ref = getValue(t, astProp.value)
            break
          case 'key':
            key = getValue(t, astProp.value)
            break
          case PROP_ReCreate:
            hasReCreateFlag = true
            break
          default:
            if (propName === 'children') {
              propChildren = astProp
            }
            if (propName.toLowerCase() === 'contenteditable') {
              contentEditable = true
            }
            props.push({
              astName: getName(t, propName),
              astValue: getValue(t, astProp.value),
              astSpread: null
            })
        }
      }
    }
  }
  /* eslint no-return-assign:0 */
  return {
    props: isNullOrUndefined(props)
      ? NULL
      : (props = t.ObjectExpression(
          props.map(function (prop) {
            if (prop.astSpread) {
              // Babel 6 uses 'SpreadProperty' and Babel 7 uses SpreadElement
              const SpreadOperator =
                'SpreadProperty' in t.DEPRECATED_KEYS ? t.SpreadElement : t.SpreadProperty

              return SpreadOperator(prop.astSpread)
            }

            return t.ObjectProperty(prop.astName, prop.astValue)
          })
        )),
    key: isNullOrUndefined(key) ? NULL : key,
    ref: isNullOrUndefined(ref) ? NULL : ref,
    hasKeyedChildren: hasKeyedChildren,
    hasNonKeyedChildren: hasNonKeyedChildren,
    propChildren: propChildren,
    childrenKnown: childrenKnown,
    className: isNullOrUndefined(className) ? NULL : className,
    childFlags: childFlags,
    hasReCreateFlag: hasReCreateFlag,
    needsNormalization: needsNormalization,
    contentEditable: contentEditable,
    hasTextChildren: hasTextChildren,
    flagsOverride: flagsOverride
  }
}

function isAstNull(ast) {
  if (!ast) {
    return true
  }
  if (ast.type === 'ArrayExpression' && ast.elements.length === 0) {
    return true
  }
  return ast.name === 'null'
}

function createVNodeArgs(flags, type, className, children, childFlags, props, key, ref, defineAll) {
  const args = []
  const hasClassName = !isAstNull(className)
  const hasChildren = !isAstNull(children)
  const hasChildFlags = childFlags !== ChildFlags.HasInvalidChildren
  const hasProps = props.properties && props.properties.length > 0
  const hasKey = !isAstNull(key)
  const hasRef = !isAstNull(ref)
  args.push(typeof flags === 'number' ? t.NumericLiteral(flags) : flags)
  args.push(type)

  if (hasClassName) {
    args.push(className)
  } else if (defineAll || hasChildren || hasChildFlags || hasProps || hasKey || hasRef) {
    args.push(NULL)
  }

  if (hasChildren) {
    args.push(children)
  } else if (defineAll || hasChildFlags || hasProps || hasKey || hasRef) {
    args.push(NULL)
  }

  if (hasChildFlags) {
    args.push(typeof childFlags === 'number' ? t.NumericLiteral(childFlags) : childFlags)
  } else if (defineAll || hasProps || hasKey || hasRef) {
    args.push(t.NumericLiteral(ChildFlags.HasInvalidChildren))
  }

  if (hasProps) {
    args.push(props)
  } else if (defineAll || hasKey || hasRef) {
    args.push(NULL)
  }

  if (hasKey) {
    args.push(key)
  } else if (defineAll || hasRef) {
    args.push(NULL)
  }

  if (defineAll || hasRef) {
    args.push(ref)
  }

  return args
}

function createFragmentVNodeArgs(children, childFlags, key, defineAll) {
  const args = []
  const hasChildren = !isAstNull(children)
  const hasChildFlags = hasChildren && childFlags !== ChildFlags.HasInvalidChildren
  const hasKey = !isAstNull(key)

  if (hasChildren) {
    if (
      childFlags === ChildFlags.HasNonKeyedChildren ||
      childFlags === ChildFlags.HasKeyedChildren ||
      childFlags === ChildFlags.UnknownChildren ||
      children.type === 'ArrayExpression'
    ) {
      args.push(children)
    } else {
      args.push(t.arrayExpression([children]))
    }
  } else if (defineAll || hasChildFlags || hasKey) {
    args.push(NULL)
  }

  if (hasChildFlags) {
    args.push(typeof childFlags === 'number' ? t.NumericLiteral(childFlags) : childFlags)
  } else if (defineAll || hasKey) {
    args.push(t.NumericLiteral(ChildFlags.HasInvalidChildren))
  }

  if (defineAll || hasKey) {
    args.push(key)
  }

  return args
}

function createComponentVNodeArgs(flags, type, props, key, ref, defineAll) {
  const args = []
  const hasProps = props.properties && props.properties.length > 0
  const hasKey = !isAstNull(key)
  const hasRef = !isAstNull(ref)
  args.push(typeof flags === 'number' ? t.NumericLiteral(flags) : flags)
  args.push(type)

  if (hasProps) {
    args.push(props)
  } else if (defineAll || hasKey || hasRef) {
    args.push(NULL)
  }

  if (hasKey) {
    args.push(key)
  } else if (defineAll || hasRef) {
    args.push(NULL)
  }

  if (defineAll || hasRef) {
    args.push(ref)
  }

  return args
}

function createVNode(astNode, opts, fileState, defineAll) {
  const astType = astNode.type
  let text
  let childrenResults
  let vChildren

  switch (astType) {
    case 'JSXFragment':
      childrenResults = getVNodeChildren(astNode.children, opts, fileState, defineAll)
      vChildren = childrenResults.children
      if (!childrenResults.requiresNormalization) {
        if (childrenResults.parentCanBeKeyed) {
          childFlags = ChildFlags.HasKeyedChildren
        } else {
          childFlags = ChildFlags.HasNonKeyedChildren
        }
        if (childrenResults.hasSingleChild) {
          vChildren = t.arrayExpression([vChildren])
        }
      } else {
        childFlags = ChildFlags.UnknownChildren
      }

      if (vChildren && vChildren !== NULL && childrenResults.foundText) {
        vChildren = transformTextNodes(vChildren, childrenResults, opts, fileState)
      }

      fileState.set(fnFragment, true)

      return t.callExpression(
        t.identifier(fnFragment),
        createFragmentVNodeArgs(vChildren, childFlags, defineAll)
      )
    case 'JSXElement':
      const openingElement = astNode.openingElement
      const vType = getVNodeType(openingElement.name)
      const vNodeType = vType.vNodeType
      const vProps = getVNodeProps(openingElement.attributes, vNodeType === TYPE_COMPONENT)
      childrenResults = getVNodeChildren(astNode.children, opts, fileState, defineAll)
      vChildren = childrenResults.children

      let childFlags = ChildFlags.HasInvalidChildren
      let flags = vType.flags
      let props = vProps.props
      let childIndex = -1
      let i = 0

      if (vProps.hasReCreateFlag) {
        flags = flags | VNodeFlags.ReCreate
      }
      if (vProps.contentEditable) {
        flags = flags | VNodeFlags.ContentEditable
      }
      if (vNodeType === TYPE_COMPONENT) {
        if (vChildren) {
          if (!(vChildren.type === 'ArrayExpression' && vChildren.elements.length === 0)) {
            // Remove children from props, if it exists

            for (i = 0; i < props.properties.length; i++) {
              if (props.properties[i].key && props.properties[i].key.value === 'children') {
                childIndex = i
                break
              }
            }
            if (childIndex !== -1) {
              props.properties.splice(childIndex, 1) // Remove prop children
            }
            props.properties.push(t.ObjectProperty(t.identifier('children'), vChildren))
          }
          vChildren = NULL
        }
      } else {
        if (
          vProps.propChildren &&
          vChildren.type === 'ArrayExpression' &&
          vChildren.elements.length === 0
        ) {
          if (vProps.propChildren.value.type === 'StringLiteral') {
            text = handleWhiteSpace(vProps.propChildren.value.value)

            if (text !== '') {
              if (vNodeType !== TYPE_FRAGMENT) {
                childrenResults.foundText = true
                childrenResults.hasSingleChild = true
              }
              vChildren = t.StringLiteral(text)
            } else {
              vChildren = NULL
              childFlags = ChildFlags.HasInvalidChildren
            }
          } else if (vProps.propChildren.value.type === 'JSXExpressionContainer') {
            if (
              vProps.propChildren.value.expression.type === 'JSXEmptyExpression' ||
              vProps.propChildren.value.expression.type === 'NullLiteral'
            ) {
              vChildren = NULL
              childFlags = ChildFlags.HasInvalidChildren
            } else {
              vChildren = vProps.propChildren.value.expression
              childFlags = ChildFlags.HasVNodeChildren
            }
          } else {
            vChildren = NULL
            childFlags = ChildFlags.HasInvalidChildren
          }
        }
        if (!childrenResults.requiresNormalization || vProps.childrenKnown) {
          if (vProps.hasKeyedChildren || childrenResults.parentCanBeKeyed) {
            childFlags = ChildFlags.HasKeyedChildren
          } else if (vProps.hasNonKeyedChildren || childrenResults.parentCanBeNonKeyed) {
            childFlags = ChildFlags.HasNonKeyedChildren
          } else if (
            vProps.hasTextChildren ||
            (childrenResults.foundText && childrenResults.hasSingleChild)
          ) {
            childrenResults.foundText = vNodeType === TYPE_FRAGMENT
            childFlags =
              vNodeType === TYPE_FRAGMENT
                ? ChildFlags.HasNonKeyedChildren
                : ChildFlags.HasTextChildren
          } else if (childrenResults.hasSingleChild) {
            childFlags =
              vNodeType === TYPE_FRAGMENT
                ? ChildFlags.HasNonKeyedChildren
                : ChildFlags.HasVNodeChildren
          }
        } else {
          if (vProps.hasKeyedChildren) {
            childFlags = ChildFlags.HasKeyedChildren
          } else if (vProps.hasNonKeyedChildren) {
            childFlags = ChildFlags.HasNonKeyedChildren
          }
        }

        // Remove children from props, if it exists
        childIndex = -1

        for (i = 0; i < props.properties.length; i++) {
          if (props.properties[i].key && props.properties[i].key.value === 'children') {
            childIndex = i
            break
          }
        }
        if (childIndex !== -1) {
          props.properties.splice(childIndex, 1) // Remove prop children
        }
      }
      if (vChildren && vChildren !== NULL && childrenResults.foundText) {
        vChildren = transformTextNodes(vChildren, childrenResults, opts, fileState)
      }

      if (vProps.childFlags) {
        // If $ChildFlag is provided it is runtime dependant
        childFlags = vProps.childFlags
      } else {
        childFlags =
          vNodeType !== TYPE_COMPONENT &&
          childrenResults.requiresNormalization &&
          !vProps.childrenKnown
            ? ChildFlags.UnknownChildren
            : childFlags
      }

      let createVNodeCall

      switch (vNodeType) {
        case TYPE_COMPONENT:
          fileState.set(fnComponent, true)
          createVNodeCall = t.callExpression(
            t.identifier(fnComponent),
            createComponentVNodeArgs(
              vProps.flagsOverride || flags,
              vType.type,
              props,
              vProps.key,
              vProps.ref,
              defineAll
            )
          )
          break
        case TYPE_ELEMENT:
          fileState.set(fnNode, true)
          createVNodeCall = t.callExpression(
            t.identifier(fnNode),
            createVNodeArgs(
              vProps.flagsOverride || flags,
              vType.type,
              vProps.className,
              vChildren,
              childFlags,
              props,
              vProps.key,
              vProps.ref,
              defineAll
            )
          )
          break
        case TYPE_FRAGMENT:
          fileState.set(fnFragment, true)
          if (!childrenResults.requiresNormalization && childrenResults.hasSingleChild) {
            vChildren = t.arrayExpression([vChildren])
          }
          return t.callExpression(
            t.identifier(opts.pragmaFragmentVNode || 'createFragment'),
            createFragmentVNodeArgs(vChildren, childFlags, vProps.key, defineAll)
          )
      }

      // NormalizeProps will normalizeChildren too
      if (vProps.needsNormalization) {
        fileState.set('normalizeProps', true)
        createVNodeCall = t.callExpression(
          t.identifier(opts.pragmaNormalizeProps || 'normalizeProps'),
          [createVNodeCall]
        )
      }

      return createVNodeCall
    case 'JSXText':
      text = handleWhiteSpace(astNode.value)

      if (text !== '') {
        return t.StringLiteral(text)
      }
      break
    case 'JSXExpressionContainer':
      const expression = astNode.expression

      if (expression && expression.type !== 'JSXEmptyExpression') {
        return expression
      }
      break
    default:
      break
  }
}

function getHoistedNode(lastNode, path) {
  if (path.parentPath === null) {
    const body = path.node.body
    const index = body.indexOf(lastNode)
    return {
      node: path.node,
      index: index
    }
  } else {
    return getHoistedNode(path.node, path.parentPath)
  }
}

function visitorEnter(path, state) {
  const opts = state.opts
  const defineAll = opts.defineAllArguments === true || opts.defineAllArguments === 'true'
  const node = createVNode(path.node, opts, state.file, defineAll)

  path.replaceWith(node)

  if (opts.imports === false || opts.imports === 'false') {
    if (!opts.hoistCreateVNode) {
      opts.hoistCreateVNode = true
      opts.constNode = getHoistedNode(path.node, path.parentPath)
    }
  }
}

module.exports = function () {
  return {
    visitor: {
      Program: {
        enter: function (path, state) {
          // Keep status in state which imports are needed by the file
          const fileState = state.file

          fileState.set('normalizeProps', false)
          fileState.set('createRvdComponentNode', false)
          fileState.set('createRvdNode', false)
          fileState.set('createRvdFragmentNode', false)
        },
        exit: function (path, state) {
          const fileState = state.file

          const needsAnyImports = Boolean(
            fileState.get('createRvdComponentNode') ||
              fileState.get('createRvdNode') ||
              fileState.get('createRvdFragmentNode') ||
              fileState.get('normalizeProps')
          )

          if (needsAnyImports) {
            const opts = state.opts
            const importIdentifier = '@atom-iq/core/jsx'

            const importArray = []

            if (fileState.get('createVNode') && !path.scope.hasBinding('createVNode')) {
              importArray.push(
                t.importSpecifier(
                  t.identifier(opts.pragma || 'createVNode'),
                  t.identifier('createVNode')
                )
              )
            }
            if (fileState.get('createFragment') && !path.scope.hasBinding('createFragment')) {
              importArray.push(
                t.importSpecifier(
                  t.identifier(opts.pragmaFragmentVNode || 'createFragment'),
                  t.identifier('createFragment')
                )
              )
            }
            if (
              fileState.get('createComponentVNode') &&
              !path.scope.hasBinding('createComponentVNode')
            ) {
              importArray.push(
                t.importSpecifier(
                  t.identifier('createComponentVNode'),
                  t.identifier('createComponentVNode')
                )
              )
            }
            if (fileState.get('normalizeProps') && !path.scope.hasBinding('normalizeProps')) {
              importArray.push(
                t.importSpecifier(t.identifier('normalizeProps'), t.identifier('normalizeProps'))
              )
            }
            if (fileState.get('createTextVNode') && !path.scope.hasBinding('createTextVNode')) {
              importArray.push(
                t.importSpecifier(t.identifier('createTextVNode'), t.identifier('createTextVNode'))
              )
            }

            if (importArray.length > 0) {
              path.node.body.unshift(
                t.importDeclaration(importArray, t.stringLiteral(importIdentifier))
              )
            }
          }
        }
      },
      JSXElement: {
        enter: visitorEnter
      },
      JSXFragment: {
        enter: visitorEnter
      }
    },
    inherits: jsx
  }
}

/* eslint-disable no-case-declarations */
'use strict'
const jsx = require('@babel/plugin-syntax-jsx').default
const flags = require('./flags')
const t = require('@babel/types')
const svgAttributes = require('./attrsSVG')
const RvdElementTypes = require('./rvdElementTypes')
const RvdElementFlags = flags.RvdElementFlags
const RvdChildFlags = flags.RvdChildFlags

const fnNormalize = 'normalizeProps'

const _FRAGMENT = '_F_'

const typeProperty = 'type'
const propsProperty = 'props'
const classNameProperty = 'className'
const childrenProperty = 'children'
const keyProperty = 'key'
const refProperty = 'ref'
const flagProperty = 'flag'
const childFlagsProperty = 'childFlags'

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

function jsxMemberExpressionReference(node) {
  if (t.isJSXIdentifier(node)) {
    return t.identifier(node.name)
  }
  if (t.isJSXMemberExpression(node)) {
    return t.memberExpression(
      jsxMemberExpressionReference(node.object),
      jsxMemberExpressionReference(node.property)
    )
  }
}

function getRvdElementType(astNode) {
  const astType = astNode.type
  let nodeFlag
  let elementType
  let rvdNodeType

  if (astType === 'JSXIdentifier') {
    const astName = astNode.name

    if (isFragment(astName)) {
      rvdNodeType = TYPE_FRAGMENT
    } else if (isComponent(astName)) {
      rvdNodeType = TYPE_COMPONENT
      elementType = t.identifier(astName)
      nodeFlag = RvdElementFlags.Component
    } else {
      rvdNodeType = TYPE_ELEMENT
      elementType = t.stringLiteral(astName)
      nodeFlag = RvdElementTypes[astName] || RvdElementFlags.HtmlElement
    }
  } else if (astType === 'JSXMemberExpression') {
    rvdNodeType = TYPE_COMPONENT
    elementType = jsxMemberExpressionReference(astNode)
    nodeFlag = RvdElementFlags.Component
  }
  return {
    elementType,
    rvdElementType: rvdNodeType,
    flag: nodeFlag
  }
}

function getRvdElementChildren(astChildren, opts, fileState) {
  let children = []
  let hasKeyedChildren = false

  let childFlags = RvdChildFlags.HasOnlyStaticChildren

  for (let i = 0; i < astChildren.length; i++) {
    const child = astChildren[i]
    const vNode = createRvdNode(child, opts, fileState)

    if (child.type === 'JSXExpressionContainer') {
      childFlags = RvdChildFlags.HasUnknownChildren
    }

    if (!isNullOrUndefined(vNode)) {
      children.push(vNode)

      /*
       * Loop direct children to check if they have key property set
       * When all children are static and no key is found, flag fragment
       * as RvdElementFlags.NonKeyedFragment - for improving runtime performance.
       * When some child has key or is expression, flag fragment a RvdElementFlags.Fragment
       */
      if (hasKeyedChildren === false && child.openingElement) {
        const astProps = child.openingElement.attributes
        let len = astProps.length

        while (hasKeyedChildren === false && len-- > 0) {
          const prop = astProps[len]

          if (prop.name && prop.name.name === 'key') {
            hasKeyedChildren = true
          }
        }
      }
    }
  }

  const hasSingleChild = children.length === 1

  children = hasSingleChild ? children[0] : t.arrayExpression(children)

  if (hasSingleChild) {
    childFlags =
      childFlags === RvdChildFlags.HasOnlyStaticChildren
        ? RvdChildFlags.HasSingleStaticChild
        : RvdChildFlags.HasSingleUnknownChild
  } else {
    childFlags =
      childFlags === RvdChildFlags.HasOnlyStaticChildren
        ? RvdChildFlags.HasMultipleStaticChildren
        : RvdChildFlags.HasMultipleUnknownChildren
  }

  return {
    children,
    childFlags,
    hasKeyedChildren
  }
}

function getValue(value) {
  if (!value) {
    return t.booleanLiteral(true)
  }

  if (value.type === 'JSXExpressionContainer') {
    return value.expression
  }

  return value
}

function getName(name) {
  if (name.indexOf('-') !== 0) {
    return t.stringLiteral(name)
  }
  return t.identifier(name)
}

function getRvdElementProps(astProps, isComponent) {
  let props = []
  let key = null
  let ref = null
  let className = null
  let needsNormalization = false
  let propChildren = null

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
        className = getValue(astProp.value)
      } else if (!isComponent && propName === 'htmlFor') {
        props.push({
          astName: getName('for'),
          astValue: getValue(astProp.value),
          astSpread: null
        })
      } else if (!isComponent && propName === 'onDoubleClick') {
        props.push({
          astName: getName('onDblClick'),
          astValue: getValue(astProp.value),
          astSpread: null
        })
      } else if (!isComponent && propName in svgAttributes) {
        // React compatibility for SVG Attributes
        props.push({
          astName: getName(svgAttributes[propName]),
          astValue: getValue(astProp.value),
          astSpread: null
        })
      } else {
        switch (propName) {
          case 'ref':
            ref = getValue(astProp.value)
            break
          case 'key':
            key = getValue(astProp.value)
            break
          default:
            if (propName === 'children') {
              propChildren = astProp
            }
            props.push({
              astName: getName(propName),
              astValue: getValue(astProp.value),
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
      : (props = t.objectExpression(
          props.map(function (prop) {
            if (prop.astSpread) {
              return t.spreadElement(prop.astSpread)
            }

            return t.objectProperty(prop.astName, prop.astValue)
          })
        )),
    key: isNullOrUndefined(key) ? NULL : key,
    ref: isNullOrUndefined(ref) ? NULL : ref,
    propChildren: propChildren,
    className: isNullOrUndefined(className) ? NULL : className,
    needsNormalization: needsNormalization
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

/**
 * Creates and returns RvdElementNode expression
 * @param nodeFlag
 * @param type
 * @param className
 * @param props
 * @param children
 * @param childFlags
 * @param key
 * @param ref
 */
function createRvdElementNode(nodeFlag, type, className, props, children, childFlags, key, ref) {
  const args = []
  const hasClassName = !isAstNull(className)
  const hasChildren = !isAstNull(children)
  const hasProps = props.properties && props.properties.length > 0
  const hasKey = !isAstNull(key)
  const hasRef = !isAstNull(ref)

  args.push(t.objectProperty(t.identifier(typeProperty), type))
  args.push(t.objectProperty(t.identifier(flagProperty), t.numericLiteral(nodeFlag)))

  if (hasClassName) {
    args.push(t.objectProperty(t.identifier(classNameProperty), className))
  }

  if (hasProps) {
    args.push(t.objectProperty(t.identifier(propsProperty), props))
  }

  if (hasChildren) {
    args.push(t.objectProperty(t.identifier(childrenProperty), children))
    args.push(t.objectProperty(t.identifier(childFlagsProperty), t.numericLiteral(childFlags)))
  }

  if (hasKey) {
    args.push(t.objectProperty(t.identifier(keyProperty), key))
  }

  if (hasRef) {
    args.push(t.objectProperty(t.identifier(refProperty), ref))
  }

  return t.objectExpression(args)
}

function createRvdFragmentNode(children, childFlags, hasKeyedChildren, key) {
  const args = []
  const hasChildren = !isAstNull(children)
  const hasKey = !isAstNull(key)

  if (!hasChildren || !childFlags) {
    return NULL
  }

  args.push(t.objectProperty(t.identifier(typeProperty), t.stringLiteral(_FRAGMENT)))

  if (!hasKeyedChildren && (childFlags & RvdChildFlags.HasOnlyStaticChildren) !== 0) {
    args.push(
      t.objectProperty(
        t.identifier(flagProperty),
        t.numericLiteral(RvdElementFlags.NonKeyedFragment)
      )
    )
  } else {
    args.push(
      t.objectProperty(t.identifier(flagProperty), t.numericLiteral(RvdElementFlags.Fragment))
    )
  }

  if (
    (childFlags & RvdChildFlags.HasMultipleChildren) !== 0 ||
    children.type === 'ArrayExpression'
  ) {
    args.push(t.objectProperty(t.identifier(childrenProperty), children))
  } else {
    args.push(t.objectProperty(t.identifier(childrenProperty), t.arrayExpression([children])))
  }
  args.push(t.objectProperty(t.identifier(childFlagsProperty), t.numericLiteral(childFlags)))

  if (hasKey) {
    args.push(t.objectProperty(t.identifier(keyProperty), key))
  }

  return t.objectExpression(args)
}

function createRvdComponentNode(type, props, key, ref) {
  const args = []
  const hasProps = props.properties && props.properties.length > 0
  const hasKey = !isAstNull(key)
  const hasRef = !isAstNull(ref)

  args.push(t.objectProperty(t.identifier(typeProperty), type))
  args.push(
    t.objectProperty(t.identifier(flagProperty), t.numericLiteral(RvdElementFlags.Component))
  )

  if (hasProps) {
    args.push(t.objectProperty(t.identifier(propsProperty), props))
  }

  if (hasKey) {
    args.push(t.objectProperty(t.identifier(keyProperty), key))
  }

  if (hasRef) {
    args.push(t.objectProperty(t.identifier(refProperty), ref))
  }

  return t.objectExpression(args)
}

function createRvdNode(astNode, opts, fileState) {
  const astType = astNode.type
  switch (astType) {
    case 'JSXFragment': {
      const { children, hasKeyedChildren, childFlags } = getRvdElementChildren(
        astNode.children,
        opts,
        fileState
      )

      return createRvdFragmentNode(children, childFlags, hasKeyedChildren)
    }

    case 'JSXElement': {
      const openingElement = astNode.openingElement
      const typeData = getRvdElementType(openingElement.name)
      const rvdElementType = typeData.rvdElementType
      const flag = typeData.flag

      const rvdElementProps = getRvdElementProps(
        openingElement.attributes,
        rvdElementType === TYPE_COMPONENT
      )

      const rvdElementChildren = getRvdElementChildren(astNode.children, opts, fileState)

      let children = rvdElementChildren.children
      let childFlags = rvdElementChildren.childFlags
      const hasKeyedChildren = rvdElementChildren.hasKeyedChildren

      let props = rvdElementProps.props
      let childIndex = -1
      let i = 0

      if (rvdElementType === TYPE_COMPONENT) {
        if (children) {
          if (!(children.type === 'ArrayExpression' && children.elements.length === 0)) {
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
            props.properties.push(t.objectProperty(t.identifier('children'), children))
          }
          children = NULL
        }
      } else {
        if (
          rvdElementProps.propChildren &&
          children.type === 'ArrayExpression' &&
          children.elements.length === 0
        ) {
          if (rvdElementProps.propChildren.value.type === 'StringLiteral') {
            let text = handleWhiteSpace(rvdElementProps.propChildren.value.value)

            if (text !== '') {
              childFlags = RvdChildFlags.HasSingleStaticChild
              children = t.stringLiteral(text)
            } else {
              children = NULL
              childFlags = NULL
            }
          } else if (rvdElementProps.propChildren.value.type === 'JSXExpressionContainer') {
            if (
              rvdElementProps.propChildren.value.expression.type === 'JSXEmptyExpression' ||
              rvdElementProps.propChildren.value.expression.type === 'NullLiteral'
            ) {
              children = NULL
              childFlags = NULL
            } else {
              children = rvdElementProps.propChildren.value.expression
              childFlags = RvdChildFlags.HasSingleUnknownChild
            }
          } else {
            children = NULL
            childFlags = NULL
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

      let rvdNode

      switch (rvdElementType) {
        case TYPE_COMPONENT:
          rvdNode = createRvdComponentNode(
            typeData.elementType,
            props,
            rvdElementProps.key,
            rvdElementProps.ref
          )
          break
        case TYPE_ELEMENT:
          rvdNode = createRvdElementNode(
            flag,
            typeData.elementType,
            rvdElementProps.className,
            props,
            children,
            childFlags,
            rvdElementProps.key,
            rvdElementProps.ref
          )

          if (rvdElementProps.needsNormalization) {
            fileState.set(fnNormalize, true)
            rvdNode = t.callExpression(t.identifier(fnNormalize), [rvdNode])
          }
          break
        case TYPE_FRAGMENT:
          return createRvdFragmentNode(children, childFlags, hasKeyedChildren, rvdElementProps.key)
      }
      return rvdNode
    }

    case 'JSXText':
      const text = handleWhiteSpace(astNode.value)

      if (text !== '') {
        return t.stringLiteral(text)
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

function visitorEnter(path, state) {
  const node = createRvdNode(path.node, state.opts, state.file)

  path.replaceWith(node)
}

module.exports = function () {
  return {
    visitor: {
      Program: {
        enter: function (path, state) {
          // Keep status in state which imports are needed by the file
          const fileState = state.file

          fileState.set(fnNormalize, false)
        },
        exit: function (path, state) {
          const fileState = state.file
          const opts = state.opts

          const noImports = opts.noImports || false
          // TODO: Left this code if we'll need switching back to functions
          const needsAnyImports = Boolean(fileState.get(fnNormalize))

          if (needsAnyImports && !noImports) {
            const importIdentifier = '@atom-iq/core'

            const importArray = []

            if (fileState.get(fnNormalize) && !path.scope.hasBinding(fnNormalize)) {
              importArray.push(
                t.importSpecifier(t.identifier(fnNormalize), t.identifier(fnNormalize))
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

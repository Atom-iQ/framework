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
const fnElement = 'createRvdElement'
const fnComponent = 'createRvdComponent'
const fnFragment = 'createRvdFragment'

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
    elementFlag: nodeFlag
  }
}

function getRvdElementChildren(astChildren, opts, fileState) {
  let children = []
  let hasKeyedChildren = false

  let childFlags = RvdChildFlags.HasOnlyStaticChildren

  for (let i = 0; i < astChildren.length; i++) {
    const child = astChildren[i]
    const vNode = createRvdElement(child, opts, fileState)

    if (child.type === 'JSXExpressionContainer') {
      childFlags = RvdChildFlags.HasUnknownChildren
    }

    if (!isNullOrUndefined(vNode)) {
      children.push(vNode)

      /*
       * Loop direct children to check if they have key property set
       * If they do, flag parent as hasKeyedChildren to increase runtime performance of Inferno
       * When key already found within one of its children, they must all be keyed
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

function createRvdElementArgs(nodeFlag, type, className, props, children, childFlags, key, ref) {
  const args = []
  const hasClassName = !isAstNull(className)
  const hasChildren = !isAstNull(children)
  const hasProps = props.properties && props.properties.length > 0
  const hasKey = !isAstNull(key)
  const hasRef = !isAstNull(ref)
  args.push(t.numericLiteral(nodeFlag))
  args.push(type)

  if (hasClassName) {
    args.push(className)
  } else if (hasChildren || hasProps || hasKey || hasRef) {
    args.push(NULL)
  }

  if (hasProps) {
    args.push(props)
  } else if (hasChildren || hasKey || hasRef) {
    args.push(NULL)
  }

  if (hasChildren) {
    args.push(children)
    args.push(t.numericLiteral(childFlags))
  } else if (hasKey || hasRef) {
    args.push(NULL)
    args.push(NULL)
  }

  if (hasKey) {
    args.push(key)
  } else if (hasRef) {
    args.push(NULL)
  }

  if (hasRef) {
    args.push(ref)
  }

  return args
}

function createRvdFragmentArgs(children, childFlags, hasKeyedChildren, key) {
  const args = []
  const hasChildren = !isAstNull(children)
  const hasKey = !isAstNull(key)

  if (!hasKeyedChildren && childFlags & (RvdChildFlags.HasOnlyStaticChildren !== 0)) {
    args.push(t.numericLiteral(RvdElementFlags.NonKeyedFragment))
  } else {
    args.push(t.numericLiteral(RvdElementFlags.Fragment))
  }

  if (hasChildren) {
    if (
      childFlags & (RvdChildFlags.HasMultipleChildren !== 0) ||
      children.type === 'ArrayExpression'
    ) {
      args.push(children)
    } else {
      args.push(t.arrayExpression([children]))
    }
    args.push(t.numericLiteral(childFlags))
  } else if (hasKey) {
    args.push(NULL)
    args.push(NULL)
  }

  if (hasKey) {
    args.push(key)
  }

  return args
}

function createRvdComponentArgs(type, props, key, ref) {
  const args = []
  const hasProps = props.properties && props.properties.length > 0
  const hasKey = !isAstNull(key)
  const hasRef = !isAstNull(ref)

  args.push(type)

  if (hasProps) {
    args.push(props)
  } else if (hasKey || hasRef) {
    args.push(NULL)
  }

  if (hasKey) {
    args.push(key)
  } else if (hasRef) {
    args.push(NULL)
  }

  if (hasRef) {
    args.push(ref)
  }

  return args
}

function createRvdElement(astNode, opts, fileState) {
  const astType = astNode.type
  switch (astType) {
    case 'JSXFragment': {
      const { children, hasKeyedChildren, childFlags } = getRvdElementChildren(
        astNode.children,
        opts,
        fileState
      )

      fileState.set(fnFragment, true)

      return t.callExpression(
        t.identifier(fnFragment),
        createRvdFragmentArgs(children, childFlags, hasKeyedChildren)
      )
    }

    case 'JSXElement': {
      const openingElement = astNode.openingElement
      const typeData = getRvdElementType(openingElement.name)
      const rvdElementType = typeData.rvdElementType
      const elementFlag = typeData.elementFlag

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
              childFlags = RvdChildFlags.HasMultipleUnknownChildren
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

      let createVNodeCall

      switch (rvdElementType) {
        case TYPE_COMPONENT:
          fileState.set(fnComponent, true)
          createVNodeCall = t.callExpression(
            t.identifier(fnComponent),
            createRvdComponentArgs(
              typeData.elementType,
              props,
              rvdElementProps.key,
              rvdElementProps.ref
            )
          )
          break
        case TYPE_ELEMENT:
          fileState.set(fnElement, true)
          createVNodeCall = t.callExpression(
            t.identifier(fnElement),
            createRvdElementArgs(
              elementFlag,
              typeData.elementType,
              rvdElementProps.className,
              props,
              children,
              childFlags,
              rvdElementProps.key,
              rvdElementProps.ref
            )
          )

          if (rvdElementProps.needsNormalization) {
            fileState.set(fnNormalize, true)
            createVNodeCall = t.callExpression(t.identifier(fnNormalize), [createVNodeCall])
          }

          break
        case TYPE_FRAGMENT:
          fileState.set(fnFragment, true)
          return t.callExpression(
            t.identifier(fnFragment),
            createRvdFragmentArgs(children, childFlags, hasKeyedChildren, rvdElementProps.key)
          )
      }

      return createVNodeCall
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
  const node = createRvdElement(path.node, state.opts, state.file)

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
          fileState.set(fnComponent, false)
          fileState.set(fnElement, false)
          fileState.set(fnFragment, false)
        },
        exit: function (path, state) {
          const fileState = state.file

          const needsAnyImports = Boolean(
            fileState.get(fnComponent) ||
              fileState.get(fnElement) ||
              fileState.get(fnFragment) ||
              fileState.get(fnNormalize)
          )

          if (needsAnyImports) {
            const opts = state.opts
            const importIdentifier = '@atom-iq/core/dist/es/jsx'

            const importArray = []

            if (fileState.get(fnElement) && !path.scope.hasBinding(fnElement)) {
              importArray.push(
                t.importSpecifier(t.identifier(opts.pragma || fnElement), t.identifier(fnElement))
              )
            }
            if (fileState.get(fnFragment) && !path.scope.hasBinding(fnFragment)) {
              importArray.push(
                t.importSpecifier(t.identifier(fnFragment), t.identifier(fnFragment))
              )
            }
            if (fileState.get(fnComponent) && !path.scope.hasBinding(fnComponent)) {
              importArray.push(
                t.importSpecifier(t.identifier(fnComponent), t.identifier(fnComponent))
              )
            }
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

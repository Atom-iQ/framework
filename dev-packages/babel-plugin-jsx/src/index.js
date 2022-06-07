/* eslint-disable no-case-declarations */
'use strict'
const jsx = require('@babel/plugin-syntax-jsx').default
const flags = require('./flags')
const t = require('@babel/types')
const svgAttributes = require('./attrsSVG')
const RvdElementTypes = require('./rvdElementTypes')
const RvdNodeFlags = flags.RvdNodeFlags

const fnNormalize = 'normalizeProps'
const fnElement = 'createRvdElement'
const fnComponent = 'createRvdComponent'
const fnFragment = 'createRvdFragment'
const fnList = 'createRvdList'

const TYPE_ELEMENT = 0
const TYPE_COMPONENT = 1
const TYPE_FRAGMENT = 2
const TYPE_LIST = 3

const NULL = t.identifier('null')

function isNullOrUndefined(obj) {
  return obj === undefined || obj === null
}

function isComponent(name) {
  const firstLetter = name.charAt(0)

  return firstLetter.toUpperCase() === firstLetter
}

function isFragment(name) {
  return name === 'Fragment'
}

function isList(name) {
  return name === 'iq-for' || name === '$for'
}

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
  let flag
  let elementType
  let nodeType

  if (astType === 'JSXIdentifier') {
    const astName = astNode.name

    if (isFragment(astName)) {
      nodeType = TYPE_FRAGMENT
      flag = RvdNodeFlags.Fragment
    } else if (isList(astName)) {
      nodeType = TYPE_LIST
      flag = RvdNodeFlags.List
    } else if (isComponent(astName)) {
      nodeType = TYPE_COMPONENT
      elementType = t.identifier(astName)
      flag = RvdNodeFlags.Component
    } else {
      nodeType = TYPE_ELEMENT
      elementType = t.stringLiteral(astName)
      flag = RvdElementTypes[astName] || RvdNodeFlags.HtmlElement
    }
  } else if (astType === 'JSXMemberExpression') {
    nodeType = TYPE_COMPONENT
    elementType = jsxMemberExpressionReference(astNode)
    flag = RvdNodeFlags.Component
  }
  return {
    elementType,
    nodeType,
    flag
  }
}

function getRvdElementChildren(astChildren, opts, fileState) {
  let children = []

  for (let i = 0; i < astChildren.length; i++) {
    const child = astChildren[i]
    const vNode = createRvdNode(child, opts, fileState)

    if (!isNullOrUndefined(vNode)) {
      children.push(vNode)
    }
  }

  const hasSingleChild = children.length === 1

  return hasSingleChild ? children[0] : t.arrayExpression(children)
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
  if (name.indexOf('-') !== -1) {
    return t.stringLiteral(name)
  }
  return t.identifier(name)
}

function getRvdElementProps(astProps, isElement) {
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

      if (isElement && (propName === 'className' || propName === 'class')) {
        className = getValue(astProp.value)
      } else if (isElement && propName === 'htmlFor') {
        props.push({
          astName: getName('for'),
          astValue: getValue(astProp.value),
          astSpread: null
        })
      } else if (isElement && propName === 'onDoubleClick') {
        props.push({
          astName: getName('onDblClick'),
          astValue: getValue(astProp.value),
          astSpread: null
        })
      } else if (isElement && propName in svgAttributes) {
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
      : t.objectExpression(
          props.map(function (prop) {
            if (prop.astSpread) {
              return t.spreadElement(prop.astSpread)
            }

            return t.objectProperty(prop.astName, prop.astValue)
          })
        ),
    key: isNullOrUndefined(key) ? NULL : key,
    ref: isNullOrUndefined(ref) ? NULL : ref,
    propChildren,
    className: isNullOrUndefined(className) ? NULL : className,
    needsNormalization
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
 * @param flag
 * @param type
 * @param className
 * @param props
 * @param children
 * @param key
 * @param ref
 */
function createRvdElementArgs(flag, type, className, props, children, key, ref) {
  const args = []
  const hasClassName = !isAstNull(className)
  const hasChildren = !isAstNull(children)
  const hasProps = props.properties && props.properties.length > 0
  const hasKey = !isAstNull(key)
  const hasRef = !isAstNull(ref)

  args.push(type)
  args.push(t.numericLiteral(flag))

  if (hasClassName) {
    args.push(className)
  } else if (hasProps || hasChildren || hasKey || hasRef) {
    args.push(NULL)
  }

  if (hasProps) {
    args.push(props)
  } else if (hasChildren || hasKey || hasRef) {
    args.push(NULL)
  }

  if (hasChildren) {
    args.push(children)
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

function createRvdFragmentArgs(children, key) {
  const args = []
  const hasKey = !isAstNull(key)

  args.push(
    children.type === 'ArrayExpression' ? children : t.arrayExpression([children])
  )

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

function createRvdListArgs(props, children) {
  const args = []
  const hasProps = props.properties && props.properties.length > 0
  const hasChildren = !isAstNull(children)

  if (hasProps) {
    args.push(props)
  } else if (hasChildren) {
    args.push(NULL)
  }

  if (hasChildren) {
    args.push(children)
  }

  return args
}

function removeChildrenFromProps(props) {
  // Remove children from props, if it exists
  let childIndex = -1
  for (let i = 0; i < props.properties.length; i++) {
    if (props.properties[i].key && props.properties[i].key.value === 'children') {
      childIndex = i
      break
    }
  }

  if (childIndex !== -1) {
    props.properties.splice(childIndex, 1) // Remove prop children
  }
}

function createRvdNode(astNode, opts, fileState) {
  const astType = astNode.type
  switch (astType) {
    case 'JSXFragment': {
      const children = getRvdElementChildren(astNode.children, opts, fileState)

      if (isAstNull(children)) {
        return NULL
      }
      fileState.set(fnFragment, true)

      return t.callExpression(
        t.identifier(fnFragment),
        createRvdFragmentArgs(children)
      )
    }

    case 'JSXElement': {
      const openingElement = astNode.openingElement
      const typeData = getRvdElementType(openingElement.name)
      const nodeType = typeData.nodeType
      const flag = typeData.flag

      const rvdElementProps = getRvdElementProps(
        openingElement.attributes,
        nodeType === TYPE_ELEMENT
      )

      let children = getRvdElementChildren(astNode.children, opts, fileState)

      const props = rvdElementProps.props

      if (nodeType === TYPE_COMPONENT) {
        if (!(children.type === 'ArrayExpression' && children.elements.length === 0)) {
          removeChildrenFromProps(props)
          props.properties.push(t.objectProperty(t.identifier('children'), children))
        }
        children = NULL
      } else {
        if (
          rvdElementProps.propChildren &&
          children.type === 'ArrayExpression' &&
          children.elements.length === 0
        ) {
          if (rvdElementProps.propChildren.value.type === 'StringLiteral') {
            let text = handleWhiteSpace(rvdElementProps.propChildren.value.value)

            if (text !== '') {
              children = t.stringLiteral(text)
            } else {
              children = NULL
            }
          } else if (rvdElementProps.propChildren.value.type === 'JSXExpressionContainer') {
            if (
              rvdElementProps.propChildren.value.expression.type === 'JSXEmptyExpression' ||
              rvdElementProps.propChildren.value.expression.type === 'NullLiteral'
            ) {
              children = NULL
            } else {
              children = rvdElementProps.propChildren.value.expression
            }
          } else {
            children = NULL
          }
        }

        removeChildrenFromProps(props)
      }

      let rvdNode

      switch (nodeType) {
        case TYPE_COMPONENT:
          fileState.set(fnComponent, true)
          rvdNode = t.callExpression(
            t.identifier(fnComponent),
            createRvdComponentArgs(
              typeData.elementType,
              props,
              rvdElementProps.key,
              rvdElementProps.ref
            )
          )
          break
        case TYPE_LIST:
          fileState.set(fnList, true)
          rvdNode = t.callExpression(
            t.identifier(fnList),
            createRvdListArgs(props, children)
          )
          break
        case TYPE_ELEMENT:
          fileState.set(fnElement, true)
          rvdNode = t.callExpression(
            t.identifier(fnElement),
            createRvdElementArgs(
              flag,
              typeData.elementType,
              rvdElementProps.className,
              props,
              children,
              rvdElementProps.key,
              rvdElementProps.ref
            )
          )

          if (rvdElementProps.needsNormalization) {
            fileState.set(fnNormalize, true)
            rvdNode = t.callExpression(t.identifier(fnNormalize), [rvdNode])
          }
          break
        case TYPE_FRAGMENT:
          if (isAstNull(children)) {
            return NULL
          }
          fileState.set(fnFragment, true)
          rvdNode = t.callExpression(
            t.identifier(fnFragment),
            createRvdFragmentArgs(children, rvdElementProps.key)
          )
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
          fileState.set(fnComponent, false)
          fileState.set(fnElement, false)
          fileState.set(fnFragment, false)
          fileState.set(fnList, false)
        },
        exit: function (path, state) {
          const fileState = state.file
          const opts = state.opts

          const noImports = opts.noImports || false

          const needsAnyImports = Boolean(
            fileState.get(fnComponent) ||
            fileState.get(fnElement) ||
            fileState.get(fnFragment) ||
            fileState.get(fnList) ||
            fileState.get(fnNormalize)
          )

          if (needsAnyImports && !noImports) {
            const importIdentifier = '@atom-iq/core'

            const importArray = []

            const shouldImport = function (fnName) {
              return fileState.get(fnName) && !path.scope.hasBinding(fnName)
            }

            const getImport = function (fnName) {
              return t.importSpecifier(t.identifier(fnName), t.identifier(fnName))
            }

            if (shouldImport(fnElement)) {
              importArray.push(getImport(fnElement))
            }
            if (shouldImport(fnFragment)) {
              importArray.push(getImport(fnFragment))
            }
            if (shouldImport(fnComponent)) {
              importArray.push(getImport(fnComponent))
            }
            if (shouldImport(fnList)) {
              importArray.push(getImport(fnList))
            }
            if (shouldImport(fnNormalize)) {
              importArray.push(getImport(fnNormalize))
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

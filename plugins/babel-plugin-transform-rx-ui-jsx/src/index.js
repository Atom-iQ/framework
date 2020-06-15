const isArray = require('lodash/isArray');
const esutils = require('esutils');
const t = require('@babel/types');

module.exports = function () {
  /* ==========================================================================
   * Utilities
   * ======================================================================= */

  const transformOnType = transforms => node => {
    const transformer = transforms[node.type];
    if (transformer) {
      return transformer(node);
    }
    throw new Error(`${node.type} could not be transformed`);
  };

  /* ==========================================================================
   * Initial configuration
   * ======================================================================= */

  const initConfig = (path) => {
    const variablesRegex = /^[A-Z]/;

    // If the constructor function will be retrieved from a module.
    const moduleName = path.scope.generateUidIdentifier('_jsx');
    const jsxObjectTransformer = (type, props, children) => {
      return t.callExpression(
        moduleName,
        [type, props, children]
      );
    };

    const importDeclaration = t.importDeclaration(
      [t.importDefaultSpecifier(moduleName)],
      t.stringLiteral('rx-dom/jsx')
    );

    // Add the import declration to the top of the file.
    path.findParent(p => p.isProgram()).unshiftContainer('body', importDeclaration);


    return {
      variablesRegex,
      jsxObjectTransformer
    };
  };

  /* =========================================================================
   * Visitors
   * ======================================================================= */

  const visitJSXElement = (path, state) => {
    if (!state.get('jsxConfig')) {
      state.set('jsxConfig', initConfig(path));
    }

    const {
      variablesRegex,
      jsxObjectTransformer
    } = state.get('jsxConfig');

    /* ==========================================================================
     * Node Transformers
     * ======================================================================= */

    const JSXIdentifier = node => t.stringLiteral(node.name);

    const JSXNamespacedName = node => t.stringLiteral(`${node.namespace.name}:${node.name.name}`);

    const JSXMemberExpression = transformOnType({
      JSXIdentifier: node => t.identifier(node.name),
      JSXMemberExpression: node => (
        t.memberExpression(
          JSXMemberExpression(node.object),
          JSXMemberExpression(node.property)
        )
      )
    });

    const JSXElementName = transformOnType({
      JSXIdentifier: node => (
        variablesRegex.test(node.name) ?
          t.identifier(node.name) :
          JSXIdentifier(node)
      ),
      JSXNamespacedName,
      JSXMemberExpression
    });

    const JSXExpressionContainer = node => node.expression;

    const JSXAttributeName = transformOnType({
      JSXIdentifier,
      JSXNamespacedName,
      JSXMemberExpression
    });

    const JSXAttributeValue = transformOnType({
      StringLiteral: node => node,
      JSXExpressionContainer
    });

    const JSXAttributes = nodes => {
      let object = [];
      const objects = [];

      nodes.forEach(node => {
        switch (node.type) {
        case 'JSXAttribute': {
          if (!object) {
            object = [];
          }

          const attributeName = JSXAttributeName(node.name);
          const objectKey = esutils.keyword.isIdentifierNameES6(attributeName.value) ?
            t.identifier(attributeName.value) : attributeName;

          object.push(t.objectProperty(objectKey, JSXAttributeValue(node.value)));
          break;
        }
        case 'JSXSpreadAttribute': {
          if (object) {
            objects.push(t.objectExpression(object));
            object = null;
          }

          objects.push(node.argument);
          break;
        }
        default:
          throw new Error(`${node.type} cannot be used as a JSX attribute`);
        }
      });

      if (object && object.length > 0) {
        objects.push(t.objectExpression(object));
      }

      if (objects.length === 0) {
        return t.objectExpression([]);
      } else if (objects.length === 1) {
        return objects[0];
      }

      return (
        t.callExpression(
          state.addHelper('extends'),
          objects
        )
      );
    };

    const JSXText = node => {
      const value = node.value.replace(/\n\s*/g, '');
      return value === '' ? null : t.stringLiteral(value);
    };



    const JSXElement = node => {
      const isFragment = !node.openingElement;

      const type = isFragment ?
        JSXIdentifier({ name: '_Fragment' }) :
        JSXElementName(node.openingElement.name);

      const childrenInProps = isFragment ?
        null : node.openingElement.attributes.find(
          attribute => {
            const attributeName = JSXAttributeName(attribute.name);
            if (attributeName && attributeName.value) {
              return attributeName.value === 'children';
            }
            return false;
          }
        );

      const props = isFragment ?
        t.nullLiteral() :
        JSXAttributes(childrenInProps ?
          node.openingElement.attributes.filter(
            attribute => {
              const attributeName = JSXAttributeName(attribute.name);
              if (attributeName && attributeName.value) {
                return attributeName.value !== 'children';
              }
              return true;
            }
          ) :
          node.openingElement.attributes
        );

      const getChildren = () => {
        if (node.children && node.children.length > 0) {
          return node.children;
        }

        if (childrenInProps) {
          return isArray(childrenInProps) ?
            JSXAttributeValue(childrenInProps.value) :
            [JSXAttributeValue(childrenInProps.value)];
        }
        return node.children;
      };

      const elementHasChildren = node.closingElement ||
          childrenInProps || isFragment;

      const children = elementHasChildren ?
        JSXChildren(getChildren()) :
        t.nullLiteral();

      return jsxObjectTransformer(
        type,
        props,
        children
      );
    };

    const JSXChild = transformOnType({
      JSXText,
      JSXElement,
      JSXExpressionContainer,
      JSXFragment: JSXElement
    });

    const JSXChildren = nodes => t.arrayExpression(
      nodes
        .map(JSXChild)
        .filter(Boolean)
      // Normalize all of our string children into one big string. This can be
      // an optimization as we minimize the number of nodes created.
      // This step just turns `['1', '2']` into `['12']`.
        .reduce((children, child) => {
          const lastChild = children.length > 0 ? children[children.length - 1] : null;

          // If this is a string literal, and the last child is a string literal, merge them.
          if (child.type === 'StringLiteral' && lastChild && lastChild.type === 'StringLiteral') {
            return [...children.slice(0, -1), t.stringLiteral(lastChild.value + child.value)];
          }

          // Otherwise just append the child to our array normally.
          return [...children, child];
        }, [])
    );

    path.replaceWith(JSXElement(path.node));
  };

  /* ==========================================================================
   * Plugin
   * ======================================================================= */

  return {
    inherits: require('babel-plugin-syntax-jsx'),
    visitor: {
      JSXElement: visitJSXElement
    }
  };
};

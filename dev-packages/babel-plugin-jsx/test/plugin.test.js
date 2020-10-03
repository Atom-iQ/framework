/* eslint-disable max-len */
// const { describe, test, expect } = require('jest')

const plugin = require('../src/index.js')
const babel = require('@babel/core')
const babelSettings = {
  filename: '',
  presets: [
    [
      require.resolve('@babel/preset-env'),
      { modules: false, loose: true, targets: { browsers: 'last 1 Chrome versions' } }
    ]
  ],
  plugins: [
    [
      plugin,
      {
        imports: true,
        defineAllArguments: false
      }
    ],
    require.resolve('@babel/plugin-syntax-jsx')
  ]
}

describe('Babel Plugin JSX', function () {
  function pluginTransform(input) {
    return babel.transform(input, babelSettings).code
  }

  function transform(input) {
    return pluginTransform(input).replace(new RegExp('import.*"@atom-iq/core";\\n'), '')
  }

  describe('Dynamic children', function () {
    test('Should add HasSingleUnknownChild child flag to element with single interpolated child', function () {
      expect(transform('<div>{a}</div>')).toEqual('createRvdElement(1, "div", null, null, a, 9);')
    })

    test('Should add HasMultipleUnknownChildren child flag when there is dynamic and static children mixed', function () {
      expect(transform('<div>{a}<div>1</div></div>')).toEqual(
        'createRvdElement(1, "div", null, null, [a, createRvdElement(1, "div", null, null, "1", 3)], 12);'
      )
    })

    test('Should add HasMultipleStaticChildren child flag, when all children are static (not expression)', function () {
      expect(transform('<div><FooBar/><div>1</div></div>')).toEqual(
        'createRvdElement(1, "div", null, null, [createRvdComponent(FooBar), createRvdElement(1, "div", null, null, "1", 3)], 6);'
      )
    })

    test('Should not normalize Component prop children', function () {
      expect(transform('<Com>{a}</Com>')).toEqual('createRvdComponent(Com, {\n  children: a\n});')
    })

    test('Should not normalize component children as they are in props', function () {
      expect(transform('<Com>{a}{b}{c}</Com>')).toEqual(
        'createRvdComponent(Com, {\n  children: [a, b, c]\n});'
      )
    })
  })

  describe('different types', function () {
    test('Should transform img', function () {
      expect(transform('<img>foobar</img>')).toEqual(
        'createRvdElement(1, "img", null, null, "foobar", 3);'
      )
    })

    test('Should transform br', function () {
      expect(transform('<br>foobar</br>')).toEqual(
        'createRvdElement(1, "br", null, null, "foobar", 3);'
      )
    })

    test('Should transform media', function () {
      expect(transform('<media>foobar</media>')).toEqual(
        'createRvdElement(1, "media", null, null, "foobar", 3);'
      )
    })

    test('Should transform textarea', function () {
      expect(transform('<textarea>foobar</textarea>')).toEqual(
        'createRvdElement(8, "textarea", null, null, "foobar", 3);'
      )
    })
  })

  describe('spreadOperator', function () {
    test('Should add call to normalizeProps when spread operator is used', function () {
      expect(transform('<div {...props}>1</div>')).toEqual(
        'normalizeProps(createRvdElement(1, "div", null, { ...props\n}, "1", 3));'
      )
    })

    test('Should add call to normalizeProps when spread operator is used #2', function () {
      expect(transform('<div foo="bar" className="test" {...props}/>')).toEqual(
        'normalizeProps(createRvdElement(1, "div", "test", {\n  "foo": "bar",\n  ...props\n}));'
      )
    })

    test('Should not add call to normalizeProps when spread operator is used inside children for Component', function () {
      expect(transform('<FooBar><BarFoo {...props}/><NoNormalize/></FooBar>')).toEqual(
        'createRvdComponent(FooBar, {\n  children: [createRvdComponent(BarFoo, { ...props\n  }), createRvdComponent(NoNormalize)]\n});'
      )
    })
  })

  describe('Basic scenarios', function () {
    test('Should transform div', function () {
      expect(transform('<div></div>')).toEqual('createRvdElement(1, "div");')
    })

    test('Should transform single div', function () {
      expect(transform('<div>1</div>')).toEqual('createRvdElement(1, "div", null, null, "1", 3);')
    })

    test('className should be in third parameter as string when its element', function () {
      expect(transform('<div className="first second">1</div>')).toEqual(
        'createRvdElement(1, "div", "first second", null, "1", 3);'
      )
    })

    test('className should be in props when its component', function () {
      expect(transform('<UnknownComponent className="first second">1</UnknownComponent>')).toEqual(
        'createRvdComponent(UnknownComponent, {\n  "className": "first second",\n  children: "1"\n});'
      )
    })

    test('JSXMemberExpressions should work', function () {
      expect(transform('<Components.Unknown>1</Components.Unknown>')).toEqual(
        'createRvdComponent(Components.Unknown, {\n  children: "1"\n});'
      )
    })

    test('class should be in third parameter as variable', function () {
      expect(transform('<div class={variable}>1</div>')).toEqual(
        'createRvdElement(1, "div", variable, null, "1", 3);'
      )
    })

    test('Should call createRvdElement twice and text children', function () {
      expect(
        transform(`<div>
          <div>single</div>
        </div>`)
      ).toEqual(
        'createRvdElement(1, "div", null, null, createRvdElement(1, "div", null, null, "single", 3), 3);'
      )
    })

    test('Events should be in props', function () {
      expect(transform('<div id="test" onClick={func} class={variable}>1</div>')).toEqual(
        'createRvdElement(1, "div", variable, {\n  "id": "test",\n  "onClick": func\n}, "1", 3);'
      )
    })

    test('Should transform input and htmlFor correctly', function () {
      const result = transform(
        '<label htmlFor={id}><input id={id} name={name} value={value} onChange={onChange} onInput={onInput} onKeyup={onKeyup} onFocus={onFocus} onClick={onClick} type="number" pattern="[0-9]+([,.][0-9]+)?" inputMode="numeric" min={minimum}/></label>'
      )
      const expected =
        'createRvdElement(1, "label", null, {\n  "for": id\n}, createRvdElement(4, "input", null, {\n  "id": id,\n  "name": name,\n  "value": value,\n  "onChange": onChange,\n  "onInput": onInput,\n  "onKeyup": onKeyup,\n  "onFocus": onFocus,\n  "onClick": onClick,\n  "type": "number",\n  "pattern": "[0-9]+([,.][0-9]+)?",\n  "inputMode": "numeric",\n  "min": minimum\n}), 3);'
      expect(result).toEqual(expected)
    })

    test('Should transform onDoubleClick to native html event', function () {
      expect(transform('<div onDoubleClick={foobar}></div>')).toEqual(
        'createRvdElement(1, "div", null, {\n  "onDblClick": foobar\n});'
      )
    })
  })

  /**
   * In Inferno all SVG attributes are written as in DOM standard
   * however for compatibility reasons we want to support React like syntax
   *
   * Same for Atom-iQ
   */
  describe('SVG attributes React syntax support', function () {
    test('Should transform xlinkHref to xlink:href', function () {
      expect(transform('<svg><use xlinkHref="#tester"></use></svg>')).toEqual(
        'createRvdElement(2, "svg", null, null, createRvdElement(2, "use", null, {\n  "xlink:href": "#tester"\n}), 3);'
      )
    })

    test('Should transform strokeWidth to stroke-width', function () {
      expect(transform('<svg><rect strokeWidth="1px"></rect></svg>')).toEqual(
        'createRvdElement(2, "svg", null, null, createRvdElement(2, "rect", null, {\n  "stroke-width": "1px"\n}), 3);'
      )
    })

    test('Should transform fillOpacity to fill-opacity', function () {
      expect(transform('<svg><rect fillOpacity="1"></rect></svg>')).toEqual(
        'createRvdElement(2, "svg", null, null, createRvdElement(2, "rect", null, {\n  "fill-opacity": "1"\n}), 3);'
      )
    })
  })

  describe('Imports', function () {
    test('Should not fail if createRvdElement is already imported', function () {
      expect(
        pluginTransform('import {createRvdElement} from "@atom-iq/core"; var foo = <div/>;')
      ).toEqual(
        'import { createRvdElement } from "@atom-iq/core";\nvar foo = createRvdElement(1, "div");'
      )
    })

    test('Should add import to createRvdComponent but not to createRvdElement if createRvdElement is already delcared', function () {
      expect(
        pluginTransform('import {createRvdElement} from "@atom-iq/core"; var foo = <FooBar/>;')
      ).toEqual(
        'import { createRvdComponent } from "@atom-iq/core";\nimport { createRvdElement } from "@atom-iq/core";\nvar foo = createRvdComponent(FooBar);'
      )
    })
  })

  describe('Children', function () {
    test('Element Should prefer child element over children props', function () {
      expect(transform('<div children="ab">test</div>')).toEqual(
        'createRvdElement(1, "div", null, null, "test", 3);'
      )
    })

    test('Element Should prefer prop over empty children', function () {
      expect(transform('<div children="ab"></div>')).toEqual(
        'createRvdElement(1, "div", null, null, "ab", 3);'
      )
    })

    test('Element Should use prop if no children exists', function () {
      expect(transform('<div children="ab"/>')).toEqual(
        'createRvdElement(1, "div", null, null, "ab", 3);'
      )
    })

    test('Component Should prefer child element over children props', function () {
      expect(transform('<Com children="ab">test</Com>')).toEqual(
        'createRvdComponent(Com, {\n  children: "test"\n});'
      )
    })

    test('Component Should prefer prop over empty children', function () {
      expect(transform('<Com children="ab"></Com>')).toEqual(
        'createRvdComponent(Com, {\n  "children": "ab"\n});'
      )
    })

    test('Component Should use prop if no children exists', function () {
      expect(transform('<Com children="ab"/>')).toEqual(
        'createRvdComponent(Com, {\n  "children": "ab"\n});'
      )
    })

    test('Component Array empty children', function () {
      expect(transform('<Com>{[]}</Com>')).toEqual('createRvdComponent(Com);')
    })

    test('Component should create RvdElement for children', function () {
      expect(transform('<Com children={<div>1</div>}/>')).toEqual(
        'createRvdComponent(Com, {\n  "children": createRvdElement(1, "div", null, null, "1", 3)\n});'
      )
    })

    test('Should prefer xml children over props', function () {
      expect(transform('<foo children={<span>b</span>}></foo>')).toEqual(
        'createRvdElement(1, "foo", null, null, createRvdElement(1, "span", null, null, "b", 3), 9);'
      )
    })

    test('Should prefer xml children over props (null)', function () {
      expect(transform('<foo children={null}></foo>')).toEqual('createRvdElement(1, "foo");')
    })
  })

  describe('Fragments', function () {
    describe('Short syntax', function () {
      test('Should create empty RvdFragment', function () {
        expect(transform('<></>')).toEqual('createRvdFragment(128);')
      })

      test('Should create RvdFragment', function () {
        expect(transform('<>Test</>')).toEqual('createRvdFragment(128, ["Test"], 3);')
      })

      test('Should create RvdFragment dynamic children', function () {
        expect(transform('<>{dynamic}</>')).toEqual('createRvdFragment(64, [dynamic], 9);')
      })

      test('Should createRvdFragment keyed children', function () {
        expect(transform('<><span key="ok">kk</span><div key="ok2">ok</div></>')).toEqual(
          'createRvdFragment(64, [createRvdElement(1, "span", null, null, "kk", 3, "ok"), createRvdElement(1, "div", null, null, "ok", 3, "ok2")], 6);'
        )
      })

      test('Should createRvdFragment non keyed children', function () {
        expect(transform('<><div>1</div><span>foo</span></>')).toEqual(
          'createRvdFragment(128, [createRvdElement(1, "div", null, null, "1", 3), createRvdElement(1, "span", null, null, "foo", 3)], 6);'
        )
      })
    })

    describe('Long syntax', function () {
      describe('Fragment', function () {
        test('Should create empty createRvdFragment', function () {
          expect(transform('<Fragment></Fragment>')).toEqual('createRvdFragment(128);')
          expect(transform('<Fragment/>')).toEqual('createRvdFragment(128);')
        })

        test('Should createRvdFragment', function () {
          expect(transform('<Fragment>Test</Fragment>')).toEqual(
            'createRvdFragment(128, ["Test"], 3);'
          )
        })

        test('Should createRvdFragment dynamic children', function () {
          expect(transform('<Fragment>{dynamic}</Fragment>')).toEqual(
            'createRvdFragment(64, [dynamic], 9);'
          )
        })

        test('Should createRvdFragment keyed children', function () {
          expect(
            transform('<Fragment><span key="ok">kk</span><div key="ok2">ok</div></Fragment>')
          ).toEqual(
            'createRvdFragment(64, [createRvdElement(1, "span", null, null, "kk", 3, "ok"), createRvdElement(1, "div", null, null, "ok", 3, "ok2")], 6);'
          )
        })

        test('Should createRvdFragment non keyed children', function () {
          expect(transform('<Fragment><div>1</div><span>foo</span></Fragment>')).toEqual(
            'createRvdFragment(128, [createRvdElement(1, "div", null, null, "1", 3), createRvdElement(1, "span", null, null, "foo", 3)], 6);'
          )
        })

        // Long syntax specials
        test('Should create keyed RvdFragment', function () {
          expect(transform('<Fragment key="foo"><div>1</div><span>foo</span></Fragment>')).toEqual(
            'createRvdFragment(128, [createRvdElement(1, "div", null, null, "1", 3), createRvdElement(1, "span", null, null, "foo", 3)], 6, "foo");'
          )
        })
      })
    })
  })
})

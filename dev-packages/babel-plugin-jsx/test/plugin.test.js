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
    return babel
      .transform(input, babelSettings)
      .code.replace('"use strict";', '')
      .replace(/[\n\s]/g, '')
  }

  function transform(input) {
    return pluginTransform(input)
      .replace('import{normalizeProps}from"@atom-iq/core";', '')
      .replace('var_core=require("@atom-iq/core");(0,_core.normalizeProps)', 'normalizeProps')
  }

  describe('Dynamic children', function () {
    test('Should add HasSingleUnknownChild child flag to element with single interpolated child', function () {
      expect(transform('<div>{a}</div>')).toEqual('({type:"div",flag:1,children:a});')
    })

    test('Should add HasMultipleUnknownChildren child flag when there is dynamic and static children mixed', function () {
      expect(transform('<div>{a}<div>1</div></div>')).toEqual(
        '({type:"div",flag:1,children:[a,{type:"div",flag:1,children:"1"}]});'
      )
    })

    test('Should add HasMultipleStaticChildren child flag, when all children are static (not expression)', function () {
      expect(transform('<div><FooBar/><div>1</div></div>')).toEqual(
        '({type:"div",flag:1,children:[{type:FooBar,flag:64},{type:"div",flag:1,children:"1"}]});'
      )
    })

    test('Should not normalize Component prop children', function () {
      expect(transform('<Com>{a}</Com>')).toEqual('({type:Com,flag:64,props:{children:a}});')
    })

    test('Should not normalize component children as they are in props', function () {
      expect(transform('<Com>{a}{b}{c}</Com>')).toEqual(
        '({type:Com,flag:64,props:{children:[a,b,c]}});'
      )
    })
  })

  describe('different types', function () {
    test('Should transform img', function () {
      expect(transform('<img>foobar</img>')).toEqual('({type:"img",flag:1,children:"foobar"});')
    })

    test('Should transform br', function () {
      expect(transform('<br>foobar</br>')).toEqual('({type:"br",flag:1,children:"foobar"});')
    })

    test('Should transform media', function () {
      expect(transform('<media>foobar</media>')).toEqual(
        '({type:"media",flag:1,children:"foobar"});'
      )
    })

    test('Should transform textarea', function () {
      expect(transform('<textarea>foobar</textarea>')).toEqual(
        '({type:"textarea",flag:8,children:"foobar"});'
      )
    })
  })

  describe('spreadOperator', function () {
    test('Should add call to normalizeProps when spread operator is used', function () {
      expect(transform('<div {...props}>1</div>')).toEqual(
        'normalizeProps({type:"div",flag:1,props:{...props},children:"1"});'
      )
    })

    test('Should add call to normalizeProps when spread operator is used #2', function () {
      expect(transform('<div foo="bar" className="test" {...props}/>')).toEqual(
        'normalizeProps({type:"div",flag:1,className:"test",props:{"foo":"bar",...props}});'
      )
    })

    test('Should not add call to normalizeProps when spread operator is used inside children for Component', function () {
      expect(transform('<FooBar><BarFoo {...props}/><NoNormalize/></FooBar>')).toEqual(
        '({type:FooBar,flag:64,props:{children:[{type:BarFoo,flag:64,props:{...props}},{type:NoNormalize,flag:64}]}});'
      )
    })
  })

  describe('Basic scenarios', function () {
    test('Should transform div', function () {
      expect(transform('<div></div>')).toEqual('({type:"div",flag:1});')
    })

    test('Should transform single div', function () {
      expect(transform('<div>1</div>')).toEqual('({type:"div",flag:1,children:"1"});')
    })

    test('className should be in separate property when its element', function () {
      expect(transform('<div className="first">1</div>')).toEqual(
        '({type:"div",flag:1,className:"first",children:"1"});'
      )
    })

    test('className should be in props when its component', function () {
      expect(transform('<UnknownComponent className="first">1</UnknownComponent>')).toEqual(
        '({type:UnknownComponent,flag:64,props:{"className":"first",children:"1"}});'
      )
    })

    test('JSXMemberExpressions should work', function () {
      expect(transform('<Components.Unknown>1</Components.Unknown>')).toEqual(
        '({type:Components.Unknown,flag:64,props:{children:"1"}});'
      )
    })

    test('class should be in separate property as variable', function () {
      expect(transform('<div class={variable}>1</div>')).toEqual(
        '({type:"div",flag:1,className:variable,children:"1"});'
      )
    })

    test('Should call createRvdElement twice and text children', function () {
      expect(
        transform(`<div>
          <div>single</div>
        </div>`)
      ).toEqual('({type:"div",flag:1,children:{type:"div",flag:1,children:"single"}});')
    })

    test('Events should be in props', function () {
      expect(transform('<div id="test" onClick={func} class={variable}>1</div>')).toEqual(
        '({type:"div",flag:1,className:variable,props:{"id":"test","onClick":func},children:"1"});'
      )
    })

    test('Should transform input and htmlFor correctly', function () {
      const result = transform(
        '<label htmlFor={id}><input id={id} name={name} value={value} onChange={onChange} onInput={onInput} onKeyup={onKeyup} onFocus={onFocus} onClick={onClick} type="number" pattern="[0-9]+([,.][0-9]+)?" inputMode="numeric" min={minimum}/></label>'
      )
      const expected =
        '({type:"label",flag:1,props:{"for":id},children:{type:"input",flag:4,props:{"id":id,"name":name,"value":value,"onChange":onChange,"onInput":onInput,"onKeyup":onKeyup,"onFocus":onFocus,"onClick":onClick,"type":"number","pattern":"[0-9]+([,.][0-9]+)?","inputMode":"numeric","min":minimum}}});'
      expect(result).toEqual(expected)
    })

    test('Should transform onDoubleClick to native html event', function () {
      expect(transform('<div onDoubleClick={foobar}></div>')).toEqual(
        '({type:"div",flag:1,props:{"onDblClick":foobar}});'
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
        '({type:"svg",flag:2,children:{type:"use",flag:2,props:{"xlink:href":"#tester"}}});'
      )
    })

    test('Should transform strokeWidth to stroke-width', function () {
      expect(transform('<svg><rect strokeWidth="1px"></rect></svg>')).toEqual(
        '({type:"svg",flag:2,children:{type:"rect",flag:2,props:{"stroke-width":"1px"}}});'
      )
    })

    test('Should transform fillOpacity to fill-opacity', function () {
      expect(transform('<svg><rect fillOpacity="1"></rect></svg>')).toEqual(
        '({type:"svg",flag:2,children:{type:"rect",flag:2,props:{"fill-opacity":"1"}}});'
      )
    })
  })

  describe('Children', function () {
    test('Element Should prefer child element over children props', function () {
      expect(transform('<div children="ab">test</div>')).toEqual(
        '({type:"div",flag:1,children:"test"});'
      )
    })

    test('Element Should prefer prop over empty children', function () {
      expect(transform('<div children="ab"></div>')).toEqual('({type:"div",flag:1,children:"ab"});')
    })

    test('Element Should use prop if no children exists', function () {
      expect(transform('<div children="ab"/>')).toEqual('({type:"div",flag:1,children:"ab"});')
    })

    test('Component Should prefer child element over children props', function () {
      expect(transform('<Com children="ab">test</Com>')).toEqual(
        '({type:Com,flag:64,props:{children:"test"}});'
      )
    })

    test('Component Should prefer prop over empty children', function () {
      expect(transform('<Com children="ab"></Com>')).toEqual(
        '({type:Com,flag:64,props:{"children":"ab"}});'
      )
    })

    test('Component Should use prop if no children exists', function () {
      expect(transform('<Com children="ab"/>')).toEqual(
        '({type:Com,flag:64,props:{"children":"ab"}});'
      )
    })

    test('Component Array empty children', function () {
      expect(transform('<Com>{[]}</Com>')).toEqual('({type:Com,flag:64});')
    })

    test('Component should create RvdElement for children', function () {
      expect(transform('<Com children={<div>1</div>}/>')).toEqual(
        '({type:Com,flag:64,props:{"children":{type:"div",flag:1,children:"1"}}});'
      )
    })

    test('Should prefer xml children over props', function () {
      expect(transform('<foo children={<span>b</span>}></foo>')).toEqual(
        '({type:"foo",flag:1,children:{type:"span",flag:1,children:"b"}});'
      )
    })

    test('Should prefer xml children over props (null)', function () {
      expect(transform('<foo children={null}></foo>')).toEqual('({type:"foo",flag:1});')
    })
  })

  describe('Fragments', function () {
    describe('Short syntax', function () {
      test('Should not create empty RvdFragment', function () {
        expect(transform('<></>')).toEqual('null;')
      })

      test('Should create RvdFragment', function () {
        expect(transform('<>Test</>')).toEqual('({flag:128,children:["Test"]});')
      })

      test('Should create RvdFragment dynamic children', function () {
        expect(transform('<>{dynamic}</>')).toEqual('({flag:128,children:[dynamic]});')
      })

      test('Should createRvdFragment keyed children', function () {
        expect(transform('<><span key="ok">kk</span><div key="ok2">ok</div></>')).toEqual(
          '({flag:128,children:[{type:"span",flag:1,children:"kk",key:"ok"},{type:"div",flag:1,children:"ok",key:"ok2"}]});'
        )
      })

      test('Should createRvdFragment non keyed children', function () {
        expect(transform('<><div>1</div><span>foo</span></>')).toEqual(
          '({flag:128,children:[{type:"div",flag:1,children:"1"},{type:"span",flag:1,children:"foo"}]});'
        )
      })
    })

    describe('Long syntax', function () {
      describe('Fragment', function () {
        test('Should not create empty createRvdFragment', function () {
          expect(transform('<Fragment></Fragment>')).toEqual('null;')
          expect(transform('<Fragment/>')).toEqual('null;')
        })

        test('Should createRvdFragment', function () {
          expect(transform('<Fragment>Test</Fragment>')).toEqual('({flag:128,children:["Test"]});')
        })

        test('Should createRvdFragment dynamic children', function () {
          expect(transform('<Fragment>{dynamic}</Fragment>')).toEqual(
            '({flag:128,children:[dynamic]});'
          )
        })

        test('Should createRvdFragment children', function () {
          expect(
            transform('<Fragment><span key="ok">kk</span><div key="ok2">ok</div></Fragment>')
          ).toEqual(
            '({flag:128,children:[{type:"span",flag:1,children:"kk",key:"ok"},{type:"div",flag:1,children:"ok",key:"ok2"}]});'
          )
        })

        test('Should createRvdFragment non keyed children', function () {
          expect(transform('<Fragment><div>1</div><span>foo</span></Fragment>')).toEqual(
            '({flag:128,children:[{type:"div",flag:1,children:"1"},{type:"span",flag:1,children:"foo"}]});'
          )
        })

        // Long syntax specials
        test('Should create RvdFragment', function () {
          expect(transform('<Fragment key="foo"><div>1</div><span>foo</span></Fragment>')).toEqual(
            '({flag:128,children:[{type:"div",flag:1,children:"1"},{type:"span",flag:1,children:"foo"}],key:"foo"});'
          )
        })
      })
    })
  })
})

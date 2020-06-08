/* eslint-disable */
// @ts-nocheck
"use strict";

import {rxDom} from "rx-ui-shared";
import {switchMap} from "rxjs/operators";
import {of} from "rxjs";

const _rxjs = require("rxjs");

const _rxUiShared = require("rx-ui-shared");

const _operators = require("rxjs/operators");

// @jsx _jsx

const useState = function useState(initialState) {
  const subject = new _rxjs.BehaviorSubject(initialState);
  return [subject.asObservable(), subject.next];
};

const pipe = function pipe($, ...args) {
  return $.pipe(...args);
};

export const p = pipe;

const mapString = function mapString($, mapFn) {
  return p($, (0, _operators.map)(mapFn));
};

export const mS = mapString;

const observableIf = function<T>(
  $: rx<T>,
  ifTrue: rxDom.ObservableNode | null,
  ifFalse?: rxDom.ObservableNode
) {
  return p($, switchMap((value: T) => {
    const booleanValue = Boolean(value);
    return booleanValue ? ifTrue : ifFalse;
  }));
};

export const oIf = observableIf;

export const Header = ({ header, hElement }) => {
  return _jsx("header", {
    children: [
      hElement === 'h1' ?
        _jsx("h1", {
          className: 'Rx-dom_' + hElement,
          children: [
            mS(header, h => h + ' WOW!')
          ]
        }) :
        _jsx("h2", {
          className: 'Rx-dom_' + hElement,
          children: [
            mS(header, h => h + ' WOW!')
          ]
        })
    ]
  });
};

export const Footer = ({ setHeader }) => {
  return _jsx("footer", {
    children: [
      _jsx("button", {
        onClick: () => setHeader('Footer xD'),
        children: [
          "Footer"
        ]
      })
    ]
  });
};

export const App = () => {
  const [header, setHeader] = useState('rX UI Suite');
  const [showFooter, setShowFooter] = useState(true);

  return _jsx("main", {
    className: of("Rx-dom"),
    id: 'main',
    onClick: () => setShowFooter(false),
    children: [
      _jsx(Header, {
        header: header,
        hElement: "h1"
      }),
      _jsx("section", {
        className: "Rx-dom__section",
        children: [
          _jsx(Header, {
            header: "New Section",
            hElement: "h2"
          })
        ]
      }),
      oIf(
        showFooter,
        _jsx(Footer, {
          setHeader: setHeader
        })
      )
    ]
  });
};

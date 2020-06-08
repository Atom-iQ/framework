import createRxElement from './create-element';
import {rxDom} from 'rx-ui-shared';

const jsx: rxDom.CreateRxElementFn = createRxElement;
const jsxs = jsx;

export { jsx, jsxs, createRxElement };

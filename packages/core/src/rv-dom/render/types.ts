import {RxSub} from 'rx-ui-shared';

export interface RxConnectedDOM {
  dom: Element | Text | null;
  elementSubscription: RxSub | null;
  indexInFragment?: string;
  fragmentRenderSubscription?: RxSub;
  _fragmentKey?: string;
}

export interface CreatedChild {
  index: string;
  element: Element | Text;
}

export interface CreatedChildren {
  [key: string]: CreatedChild;
}

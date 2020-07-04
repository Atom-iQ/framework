import {Observable, OperatorFunction} from 'rxjs';
import {RxO} from 'rx-ui-shared';
import {isBoolean, isNullOrUndef, isStringOrNumber} from '../../../../rx-ui-shared/src/utils';
import {RxConnectedDOM} from '../types';
import rxDom from '../../../../rx-ui-shared/src/types/dom/rx-dom';
import {switchMap} from 'rxjs/operators';
import {RxChild} from '../../../../rx-ui-shared';
import {createTextNode} from '../../_utils/dom';

function nullObservable(): RxO<null> {
  return new Observable<null>(observer => {
    observer.next(null);
    observer.complete();
  });
}

function coldObservable<T>(from: T): RxO<T> {
  return new Observable<T>(observer => {
    observer.next(from);
    observer.complete();
  });
}

type SwitchMapChildNodeFn = (
  renderRxDom: (rxNode: rxDom.RxNode<RxProps>) => RxO<RxConnectedDOM | null>
) => OperatorFunction<RxChild, RxConnectedDOM | null>

const switchMapChildNode: SwitchMapChildNodeFn =
  (renderRxDom: (rxNode: rxDom.RxNode<RxProps>) => RxO<RxConnectedDOM | null>) =>
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    (source$: RxO<RxChild>) => source$.pipe(
      switchMap(node => {
        if (isNullOrUndef(node)) {
          return nullObservable();
        }
        return isStringOrNumber(node) || isBoolean(node) ?
          coldObservable({
            dom: createTextNode(String(node)),
            elementSubscription: null
          } as RxConnectedDOM) :
          renderRxDom(node as rxDom.RxNode<RxProps>);
      })
    );




export { nullObservable, coldObservable, switchMapChildNode };

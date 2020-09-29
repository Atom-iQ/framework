import { BehaviorSubject } from 'rxjs';
import { isFunction } from '../../shared/utils/index.js';
import { first } from 'rxjs/operators';

const createState = (initialState) => {
    const stateSubject = new BehaviorSubject(initialState);
    const state$ = stateSubject.asObservable();
    const nextState = valueOrCallback => {
        if (isFunction(valueOrCallback)) {
            first()(state$).subscribe(valueOrCallback);
        }
        else {
            stateSubject.next(valueOrCallback);
        }
    };
    return [state$, nextState];
};

export default createState;

import {Observable} from 'rxjs';

export type Rx<T, O extends Observable<T> = Observable<T>> = O;

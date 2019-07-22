import * as _ from "lodash";
import {isObservableArray} from "mobx";

export class Helper {
  static isArray<T = any>(value: T[] | any): value is T[] {
    return _.isArray(value) || isObservableArray(value);
  }
}

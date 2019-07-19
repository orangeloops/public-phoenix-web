import * as _ from "lodash";

export class BaseModel {
  static fromJSON(json: any): any {
    const object = new this();

    _.assign(object, json);
    this.fixObjectFromJSON(object, json);

    return object;
  }

  static fixObjectFromJSON(object: any, json: any): any {}
}

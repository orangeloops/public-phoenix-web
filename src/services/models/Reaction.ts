import * as _ from "lodash";
import moment from "moment";
import {User} from "./User";
import {observable} from "mobx";
import {BaseModel} from "./BaseModel";

export class Reaction extends BaseModel {
  @observable id: string;
  @observable objectId: string;
  @observable value: string;

  @observable createdDate: moment.Moment;
  @observable createdBy: User;
  @observable modifiedDate: moment.Moment;
  @observable modifiedBy: User;
  @observable deletedDate: moment.Moment;
  @observable deletedBy: User;

  static fixObjectFromJSON(object: any, json: any) {
    if (!_.isNil(json.createdDate)) object.createdDate = moment(json.createdDate);
    if (!_.isNil(json.createdBy)) object.createdBy = User.fromJSON(json.createdBy);

    if (!_.isNil(json.modifiedDate)) object.modifiedDate = moment(json.modifiedDate);
    if (!_.isNil(json.modifiedBy)) object.modifiedBy = User.fromJSON(json.modifiedBy);

    if (!_.isNil(json.deletedDate)) object.deletedDate = moment(json.deletedDate);
    if (!_.isNil(json.deletedBy)) object.deletedBy = User.fromJSON(json.deletedBy);
  }
}

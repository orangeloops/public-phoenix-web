import * as _ from "lodash";
import {Challenge} from "./Challenge";
import {Idea} from "./Idea";
import {observable} from "mobx";
import {BaseModel} from "./BaseModel";

export enum UserStatus {
  Blocked = "BLOCKED",
  Pending = "PENDING",
  Active = "ACTIVE",
}

export class User extends BaseModel {
  @observable id: string;
  @observable name: string;
  @observable imageUrl: string;
  @observable email: string;
  @observable password: string;
  @observable status: UserStatus;

  @observable createdDate: Date;
  @observable deletedDate: Date;

  @observable challenges: Challenge[];
  @observable ideas: Idea[];
  @observable reactedIdeas: Idea[];

  static fixObjectFromJSON(object: any, json: any) {
    if (!_.isNil(json.createdDate)) object.createdDate = new Date(json.createdDate);
    if (!_.isNil(json.deletedDate)) object.deletedDate = new Date(json.deletedDate);
  }
}

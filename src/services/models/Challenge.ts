import * as _ from "lodash";
import moment from "moment";
import {BaseModel} from "./BaseModel";
import {Idea} from "./Idea";
import {User} from "./User";
import {Reaction} from "./Reaction";
import {observable} from "mobx";

export enum ChallengePrivacyMode {
  PUBLIC = "PUBLIC",
  BYDOMAIN = "BYDOMAIN",
}

export class Challenge extends BaseModel {
  @observable id: string;
  @observable title: string;
  @observable description: string;
  @observable imageUrl: string;
  @observable closeDate: moment.Moment;
  @observable endDate: moment.Moment;

  @observable privacyMode: ChallengePrivacyMode;
  @observable privacyData: string;

  @observable createdDate: moment.Moment;
  @observable createdBy: User;
  @observable modifiedDate: moment.Moment;
  @observable modifiedBy: User;
  @observable deletedDate: moment.Moment;
  @observable deletedBy: User;

  @observable reactions: Reaction[];
  @observable reactionQuantity: number;

  @observable topIdea: Idea;
  @observable ideas: Idea[];

  static fixObjectFromJSON(object: Challenge, json: any) {
    if (!_.isNil(json.closeDate)) object.closeDate = moment(json.closeDate);
    if (!_.isNil(json.endDate)) object.endDate = moment(json.endDate);

    if (!_.isNil(json.createdDate)) object.createdDate = moment(json.createdDate);
    if (!_.isNil(json.createdBy)) object.createdBy = User.fromJSON(json.createdBy);

    if (!_.isNil(json.modifiedDate)) object.modifiedDate = moment(json.modifiedDate);
    if (!_.isNil(json.modifiedBy)) object.modifiedBy = User.fromJSON(json.modifiedBy);

    if (!_.isNil(json.deletedDate)) object.deletedDate = moment(json.deletedDate);
    if (!_.isNil(json.deletedBy)) object.deletedBy = User.fromJSON(json.deletedBy);

    object.reactions = !_.isNil(json.reactions) && _.isArray(json.reactions.edges) ? json.reactions.edges.map((edge: any) => Reaction.fromJSON(edge.node)) : [];

    const likesSummary = _.isArray(json.reactionsSummary) ? json.reactionsSummary.find((reaction: any) => reaction.value === "LIKE") : undefined;
    object.reactionQuantity = !_.isNil(json.reactions) && !_.isNil(json.reactions.totalCount) ? json.reactions.totalCount : !_.isNil(likesSummary) && !_.isNil(likesSummary.totalCount) ? likesSummary.totalCount : 0;

    object.topIdea = !_.isNil(json.topIdea) ? Idea.fromJSON(json.topIdea) : undefined;
    object.ideas = !_.isNil(json.ideas) && _.isArray(json.ideas.edges) ? json.ideas.edges.map((edge: any) => Idea.fromJSON(edge.node)) : [];

    object.privacyData = !_.isNil(json.privacyData) ? json.privacyData.replace(/\["(.+)"]/, "$1") : undefined;
  }
}

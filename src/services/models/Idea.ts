import * as _ from "lodash";
import moment from "moment";
import {User} from "./User";
import {Challenge} from "./Challenge";
import {Reaction} from "./Reaction";
import {BaseModel} from "./BaseModel";
import {observable} from "mobx";

export class Idea extends BaseModel {
  @observable id: string;
  @observable title: string;
  @observable description: string;
  @observable imageUrl: string;

  @observable createdDate: moment.Moment;
  @observable createdBy: User;
  @observable modifiedDate: moment.Moment;
  @observable modifiedBy: User;
  @observable deletedDate: moment.Moment;
  @observable deletedBy: User;

  @observable reactions: Reaction[];
  @observable reactionQuantity: number;
  @observable myReaction: Reaction | undefined;
  @observable challenge: Challenge;

  static deleteMyReaction(idea: Idea) {
    const {myReaction} = idea;

    if (_.isNil(myReaction)) return;

    idea.myReaction = undefined;
    if (!_.isNil(idea.reactionQuantity)) idea.reactionQuantity -= 1;
    if (!_.isNil(idea.reactions)) {
      const reactionIndex = idea.reactions.findIndex(reaction => reaction.id === myReaction.id);

      if (reactionIndex !== -1) idea.reactions.splice(reactionIndex, 1);
    }
  }

  static addReaction(idea: Idea, reaction: Reaction) {
    idea.myReaction = reaction;
    if (!_.isNil(idea.reactionQuantity)) idea.reactionQuantity += 1;
    if (!_.isNil(idea.reactions)) idea.reactions.push(reaction);
  }

  static fixObjectFromJSON(object: Idea, json: any) {
    if (!_.isNil(json.createdDate)) object.createdDate = moment(json.createdDate);
    if (!_.isNil(json.createdBy)) object.createdBy = User.fromJSON(json.createdBy);

    if (!_.isNil(json.modifiedDate)) object.modifiedDate = moment(json.modifiedDate);
    if (!_.isNil(json.modifiedBy)) object.modifiedBy = User.fromJSON(json.modifiedBy);

    if (!_.isNil(json.deletedDate)) object.deletedDate = moment(json.deletedDate);
    if (!_.isNil(json.deletedBy)) object.deletedBy = User.fromJSON(json.deletedBy);

    object.reactions = !_.isNil(json.reactions) && _.isArray(json.reactions.edges) ? json.reactions.edges.map((edge: any) => Reaction.fromJSON(edge.node)) : [];

    object.myReaction = !_.isNil(json.myReaction) ? Reaction.fromJSON(json.myReaction) : undefined;

    const likesSummary = _.isArray(json.reactionsSummary) ? json.reactionsSummary.find((reaction: any) => reaction.value === "LIKE") : undefined;
    object.reactionQuantity = !_.isNil(json.reactions) && !_.isNil(json.reactions.totalCount) ? json.reactions.totalCount : !_.isNil(likesSummary) && !_.isNil(likesSummary.totalCount) ? likesSummary.totalCount : 0;

    if (!_.isNil(json.challenge)) object.challenge = Challenge.fromJSON(json.challenge);
  }
}

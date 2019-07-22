import * as _ from "lodash";
import {action, configure} from "mobx";
import {ChallengeState} from "./ChallengeState";
import {IdeaState} from "./IdeaState";
import {ReactionState} from "./ReactionState";
import {UserState} from "./UserState";

configure({enforceActions: "observed"});

export class DataStore {
  challengeState = new ChallengeState(this);
  ideaState = new IdeaState(this);
  reactionState = new ReactionState(this);
  userState = new UserState(this);

  private static INSTANCE: DataStore;

  constructor() {
    if (_.isNil(DataStore.INSTANCE)) DataStore.INSTANCE = this;

    return DataStore.INSTANCE;
  }

  @action
  signOut() {
    this.challengeState.signOut();
    this.ideaState.signOut();
    this.reactionState.signOut();
    this.userState.signOut();
  }
}

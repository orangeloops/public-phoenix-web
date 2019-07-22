import * as _ from "lodash";
import * as Models from "../models";
import {action, observable, runInAction} from "mobx";
import * as Errors from "../Errors";
import {State} from "./State";
import {APIClient} from "../apiclient/APIClient";
import {CreateIdeaReactionResponse, DeleteIdeaReactionResponse} from "../apiclient/APIClient.types";

export interface CreateIdeaReactionRequest {
  idea: Models.Idea;
}

export interface CreateIdeaReactionStatus {
  isLoading: boolean;
  success?: boolean;
  error?: Errors.GenericError | Errors.UserNotAuthenticatedError;
  apiResponse?: CreateIdeaReactionResponse;
  reaction?: Models.Reaction;
}

export interface DeleteIdeaReactionRequest {
  idea: Models.Idea;
}

export interface DeleteIdeaReactionStatus {
  isLoading: boolean;
  success?: boolean;
  error?: Errors.GenericError | Errors.UserNotAuthenticatedError | Errors.ObjectNotFoundError;
  apiResponse?: DeleteIdeaReactionResponse;
}

export class ReactionState extends State {
  initialCreateIdeaReactionStatus: CreateIdeaReactionStatus = {
    isLoading: false,
  };

  @observable
  createIdeaReactionStatus = _.cloneDeep(this.initialCreateIdeaReactionStatus);

  initialDeleteIdeaReactionStatus: DeleteIdeaReactionStatus = {
    isLoading: false,
  };

  @observable
  deleteIdeaReactionStatus = _.cloneDeep(this.initialDeleteIdeaReactionStatus);

  @action
  createIdeaReaction(request: CreateIdeaReactionRequest): Promise<CreateIdeaReactionStatus> {
    const {authToken, currentUser} = this.rootStore.userState;
    const {idea} = request;

    let newStatus: CreateIdeaReactionStatus = {isLoading: true};
    this.createIdeaReactionStatus = newStatus;

    if (_.isNil(authToken)) {
      newStatus = {
        isLoading: false,
        error: {code: "USER_NOT_AUTHENTICATED_ERROR", message: "You are not logged in."},
      };

      this.createIdeaReactionStatus = newStatus;

      return Promise.resolve(newStatus);
    }

    return APIClient.createIdeaReaction({
      authToken,
      ideaId: idea.id,
    }).then(apiResponse => {
      const {success, reaction} = apiResponse;

      newStatus = {
        isLoading: false,
        success: success && !_.isNil(reaction),
        apiResponse,
        reaction,
      };

      if (!newStatus.success) newStatus.error = {code: "GENERIC_ERROR", message: "Could not react to idea."};

      runInAction(() => {
        const {fetchIdeasWithMyReactionStatus} = this.rootStore.ideaState;

        if (newStatus.success) {
          Models.Idea.addReaction(idea, reaction!);

          if (!_.isNil(currentUser) && !_.isNil(currentUser.reactedIdeas)) currentUser.reactedIdeas.unshift(idea);

          if (!_.isNil(fetchIdeasWithMyReactionStatus.ideas)) {
            fetchIdeasWithMyReactionStatus.ideas.unshift(idea);
            fetchIdeasWithMyReactionStatus.totalCount!++;
          }
        }

        this.createIdeaReactionStatus = newStatus;
      });

      return newStatus;
    });
  }

  @action
  deleteIdeaReaction(request: DeleteIdeaReactionRequest): Promise<DeleteIdeaReactionStatus> {
    const {authToken, currentUser} = this.rootStore.userState;
    const {idea} = request;

    let newStatus: DeleteIdeaReactionStatus = {
      isLoading: true,
    };
    this.deleteIdeaReactionStatus = newStatus;

    if (_.isNil(authToken)) {
      newStatus = {
        isLoading: false,
        error: {code: "USER_NOT_AUTHENTICATED_ERROR", message: "You are not logged in."},
      };

      this.deleteIdeaReactionStatus = newStatus;
      return Promise.resolve(newStatus);
    }

    const {myReaction} = request.idea;
    if (_.isNil(myReaction) || _.isNil(myReaction.id)) {
      newStatus = {
        isLoading: false,
        error: {code: "OBJECT_NOT_FOUND_ERROR", message: "You don't have a reaction for this idea"},
      };

      this.deleteIdeaReactionStatus = newStatus;
      return Promise.resolve(newStatus);
    }

    return APIClient.deleteIdeaReaction({
      id: myReaction.id,
      authToken,
    }).then(apiResponse => {
      const {success} = apiResponse;

      newStatus = {
        isLoading: false,
        success: success,
        apiResponse,
      };

      if (!newStatus.success) newStatus.error = {code: "GENERIC_ERROR", message: "Could not delete reaction."};

      runInAction(() => {
        const {fetchIdeasWithMyReactionStatus} = this.rootStore.ideaState;

        if (newStatus.success) {
          Models.Idea.deleteMyReaction(idea);

          const removeFromSource = (source: Models.Idea[]) => {
            const ideaIndex = source.findIndex(i => i.id === idea.id);

            runInAction(() => {
              if (ideaIndex !== -1) source.splice(ideaIndex, 1);
            });

            return ideaIndex !== -1;
          };

          if (!_.isNil(currentUser) && !_.isNil(currentUser.reactedIdeas)) removeFromSource(currentUser.reactedIdeas);

          if (!_.isNil(fetchIdeasWithMyReactionStatus.ideas) && removeFromSource(fetchIdeasWithMyReactionStatus.ideas)) fetchIdeasWithMyReactionStatus.totalCount!--;
        }
        this.deleteIdeaReactionStatus = newStatus;
      });

      return newStatus;
    });
  }

  @action
  signOut() {
    this.createIdeaReactionStatus = _.cloneDeep(this.initialCreateIdeaReactionStatus);
    this.deleteIdeaReactionStatus = _.cloneDeep(this.initialDeleteIdeaReactionStatus);
  }
}

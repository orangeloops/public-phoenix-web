import {ReactNativeFile} from "apollo-upload-client";
import * as _ from "lodash";
import {action, observable, runInAction} from "mobx";
import * as Models from "../models";
import * as Errors from "../Errors";
import {State} from "./State";
import {APIClient} from "../apiclient/APIClient";
import {CreateIdeaResponse, DeleteIdeaResponse, FetchChallengeIdeasResponse, FetchIdeaResponse, FetchIdeasWithUserReactionResponse, FetchMyIdeasResponse, FetchUserIdeasResponse, UpdateIdeaResponse} from "../apiclient/APIClient.types";

export interface FetchChallengeIdeasRequest {
  challenge?: Models.Challenge;
}

export interface FetchChallengeIdeasStatus {
  isLoading: boolean;
  success?: boolean;
  error?: Errors.GenericError;
  apiResponse?: FetchChallengeIdeasResponse;
  ideas?: Models.Idea[];
}

export interface FetchUserIdeasRequest {
  user: string | Models.User;
}

export interface FetchUserIdeasStatus {
  isLoading: boolean;
  success?: boolean;
  error?: Errors.GenericError;
  apiResponse?: FetchUserIdeasResponse;
  ideas?: Models.Idea[];
  totalCount?: number;
}

export interface FetchIdeasWithUserReactionRequest {
  user: string | Models.User;
}

export interface FetchIdeasWithUserReactionStatus {
  isLoading: boolean;
  success?: boolean;
  error?: Errors.GenericError;
  apiResponse?: FetchIdeasWithUserReactionResponse;
  ideas?: Models.Idea[];
  totalCount?: number;
}

export interface FetchIdeasWithMyReactionRequest {}

export interface FetchIdeasWithMyReactionStatus {
  isLoading: boolean;
  success?: boolean;
  error?: Errors.GenericError | Errors.UserNotAuthenticatedError;
  apiResponse?: FetchIdeasWithUserReactionResponse;
  ideas?: Models.Idea[];
  totalCount?: number;
}

export interface CreateIdeaRequest {
  challenge: Models.Challenge;
  title: string;
  description?: string;
  image?: File | ReactNativeFile;
}

export interface CreateIdeaStatus {
  isLoading: boolean;
  success?: boolean;
  error?: Errors.GenericError | Errors.UserNotAuthenticatedError;
  apiResponse?: CreateIdeaResponse;
  idea?: Models.Idea;
}

export interface UpdateIdeaRequest {
  idea: Models.Idea;
  title: string;
  description?: string;
  image?: File | ReactNativeFile;
}

export interface UpdateIdeaStatus {
  isLoading: boolean;
  success?: boolean;
  error?: Errors.GenericError | Errors.UserNotAuthenticatedError;
  apiResponse?: UpdateIdeaResponse;
  idea?: Models.Idea;
}

export interface DeleteIdeaRequest {
  id?: string;
  idea?: Models.Idea;
}

export interface DeleteIdeaStatus {
  isLoading: boolean;
  success?: boolean;
  error?: Errors.GenericError | Errors.UserNotAuthenticatedError;
  apiResponse?: DeleteIdeaResponse;
}

export interface FetchMyIdeasRequest {}

export interface FetchMyIdeasStatus {
  isLoading: boolean;
  success?: boolean;
  error?: Errors.GenericError | Errors.UserNotAuthenticatedError;
  apiResponse?: FetchMyIdeasResponse;
  ideas?: Models.Idea[];
  totalCount?: number;
}

export interface FetchIdeaRequest {
  id?: string;
  idea?: Models.Idea;
}

export interface FetchIdeaStatus {
  isLoading: boolean;
  success?: boolean;
  error?: Errors.GenericError;
  apiResponse?: FetchIdeaResponse;
  idea?: Models.Idea;
}

export class IdeaState extends State {
  initialFetchChallengeIdeasStatus: FetchChallengeIdeasStatus = {
    isLoading: false,
  };

  @observable
  fetchChallengeIdeasStatus = _.cloneDeep(this.initialFetchChallengeIdeasStatus);

  initialFetchUserIdeasStatus: FetchUserIdeasStatus = {
    isLoading: false,
  };

  @observable
  fetchUserIdeasStatus = _.cloneDeep(this.initialFetchUserIdeasStatus);

  initialFetchIdeasWithUserReactionStatus: FetchIdeasWithUserReactionStatus = {
    isLoading: false,
  };

  @observable
  fetchIdeasWithUserReactionStatus = _.cloneDeep(this.initialFetchIdeasWithUserReactionStatus);

  initialFetchIdeasWithMyReactionStatus: FetchIdeasWithMyReactionStatus = {
    isLoading: false,
  };

  @observable
  fetchIdeasWithMyReactionStatus = _.cloneDeep(this.initialFetchIdeasWithMyReactionStatus);

  initialCreateIdeaStatus: CreateIdeaStatus = {
    isLoading: false,
  };

  @observable
  createIdeaStatus = _.cloneDeep(this.initialCreateIdeaStatus);

  initialUpdateIdeaStatus: UpdateIdeaStatus = {
    isLoading: false,
  };

  @observable
  updateIdeaStatus = _.cloneDeep(this.initialUpdateIdeaStatus);

  initialDeleteIdeaStatus: DeleteIdeaStatus = {
    isLoading: false,
  };

  @observable
  deleteIdeaStatus = _.cloneDeep(this.initialDeleteIdeaStatus);

  initialFetchMyIdeasStatus: FetchMyIdeasStatus = {
    isLoading: false,
  };

  @observable
  fetchMyIdeasStatus = _.cloneDeep(this.initialFetchMyIdeasStatus);

  initialFetchIdeaStatus: FetchIdeaStatus = {
    isLoading: false,
  };

  @observable
  fetchIdeaStatus = _.cloneDeep(this.initialFetchIdeaStatus);

  @action
  fetchChallengeIdeas(request: FetchChallengeIdeasRequest = {}): Promise<FetchChallengeIdeasStatus> {
    const {challengeState, userState} = this.rootStore;
    const {currentChallenge} = challengeState;
    const {authToken} = userState;

    const challenge = !_.isNil(request.challenge) ? request.challenge : currentChallenge!;

    let newStatus: FetchChallengeIdeasStatus = {
      isLoading: true,
    };
    this.fetchChallengeIdeasStatus = newStatus;

    return APIClient.fetchChallengeIdeas({authToken: authToken!, challengeId: challenge.id}).then(apiResponse => {
      const {success, ideas} = apiResponse;

      newStatus = {
        isLoading: false,
        success,
        apiResponse,
        ideas,
      };

      if (!success) newStatus.error = {code: "GENERIC_ERROR", message: "Could not get challenge ideas."};

      runInAction(() => {
        if (success && !_.isNil(ideas)) {
          challenge.ideas = observable(ideas);

          challenge.ideas.forEach(idea => {
            runInAction(() => (idea.challenge = challenge));
          });
        }

        this.fetchChallengeIdeasStatus = newStatus;
      });

      return newStatus;
    });
  }

  @action
  fetchMyIdeas(request: FetchMyIdeasRequest = {}): Promise<FetchMyIdeasStatus> {
    this.fetchMyIdeasStatus = {
      isLoading: true,
    };

    const {authToken} = this.rootStore.userState;

    this.fetchMyIdeasStatus = {
      isLoading: true,
    };

    if (_.isNil(authToken)) {
      this.fetchMyIdeasStatus = {
        isLoading: false,
        success: false,
        error: {code: "USER_NOT_AUTHENTICATED_ERROR", message: "You are not logged in."},
      };

      return Promise.resolve(this.fetchMyIdeasStatus);
    }

    return APIClient.fetchMyIdeas({...request, authToken}).then(apiResponse => {
      const {success, ideas, totalCount} = apiResponse;

      const newStatus: FetchMyIdeasStatus = {
        isLoading: false,
        success,
        apiResponse,
        ideas,
        totalCount,
      };

      if (!success) newStatus.error = {code: "GENERIC_ERROR", message: "Could not get user's ideas."};

      runInAction(() => {
        const {currentUser} = this.rootStore.userState;

        if (success && !_.isNil(currentUser) && !_.isNil(ideas)) {
          currentUser.ideas = observable(ideas);

          ideas.forEach(idea => {
            runInAction(() => (idea.createdBy = currentUser));
          });
        }

        this.fetchMyIdeasStatus = newStatus;
      });

      return newStatus;
    });
  }

  @action
  fetchUserIdeas(request: FetchUserIdeasRequest): Promise<FetchUserIdeasStatus> {
    const {authToken} = this.rootStore.userState;
    const {user} = request;

    let newStatus: FetchUserIdeasStatus = {
      isLoading: true,
    };
    this.fetchUserIdeasStatus = newStatus;

    const userId = typeof user === "string" ? user : user.id;

    return APIClient.fetchUserIdeas({authToken, userId}).then(apiResponse => {
      const {success, ideas, totalCount} = apiResponse;

      newStatus = {
        isLoading: false,
        success,
        apiResponse,
        ideas,
        totalCount,
      };

      if (!success) newStatus.error = {code: "GENERIC_ERROR", message: "Could not get user ideas."};

      runInAction(() => {
        if (typeof user !== "string" && !_.isNil(ideas)) {
          user.ideas = observable(ideas);

          ideas.forEach(idea => {
            runInAction(() => (idea.createdBy = user));
          });
        }

        this.fetchUserIdeasStatus = newStatus;
      });

      return newStatus;
    });
  }

  @action
  fetchIdeasWithMyReaction(request: FetchIdeasWithMyReactionRequest = {}): Promise<FetchIdeasWithMyReactionStatus> {
    const {authToken} = this.rootStore.userState;
    const {currentUser} = this.rootStore.userState;

    let newStatus: FetchIdeasWithMyReactionStatus = {
      isLoading: true,
    };
    this.fetchIdeasWithMyReactionStatus = newStatus;

    if (_.isNil(authToken) || _.isNil(currentUser)) {
      newStatus = {
        isLoading: false,
        success: false,
        error: {code: "USER_NOT_AUTHENTICATED_ERROR", message: "You must be signed in."},
      };

      this.fetchIdeasWithMyReactionStatus = newStatus;
      return Promise.resolve(newStatus);
    }

    return APIClient.fetchIdeasWithUserReaction({authToken, userId: currentUser.id}).then(apiResponse => {
      const {success, ideas, totalCount} = apiResponse;

      newStatus = {
        isLoading: false,
        success,
        apiResponse,
        ideas,
        totalCount,
      };

      if (!success) newStatus.error = {code: "GENERIC_ERROR", message: "Could not get user's likes."};

      runInAction(() => {
        if (!_.isNil(ideas)) {
          currentUser.reactedIdeas = observable(ideas);

          ideas.forEach(idea => {
            runInAction(() => (idea.createdBy = currentUser));
          });
        }

        this.fetchIdeasWithMyReactionStatus = newStatus;
      });

      return newStatus;
    });
  }

  @action
  fetchIdeasWithUserReaction(request: FetchIdeasWithUserReactionRequest): Promise<FetchIdeasWithUserReactionStatus> {
    const {user} = request;
    const {authToken} = this.rootStore.userState;

    let newStatus: FetchIdeasWithUserReactionStatus = {
      isLoading: true,
    };
    this.fetchIdeasWithUserReactionStatus = newStatus;

    const userId = typeof user === "string" ? user : user.id;

    return APIClient.fetchIdeasWithUserReaction({authToken, userId}).then(apiResponse => {
      const {success, ideas, totalCount} = apiResponse;

      newStatus = {
        isLoading: false,
        success,
        apiResponse,
        ideas,
        totalCount,
      };

      if (!success) newStatus.error = {code: "GENERIC_ERROR", message: "Could not get user's likes."};

      runInAction(() => {
        if (typeof user !== "string" && !_.isNil(ideas)) {
          user.reactedIdeas = observable(ideas);

          ideas.forEach(idea => {
            runInAction(() => (idea.createdBy = user));
          });
        }

        this.fetchIdeasWithUserReactionStatus = newStatus;
      });

      return newStatus;
    });
  }

  @action
  fetchIdea(request: FetchIdeaRequest): Promise<FetchIdeaStatus> {
    const {authToken} = this.rootStore.userState;
    const {id, idea} = request;

    return APIClient.fetchIdea({id: !_.isNil(id) ? id : idea!.id, authToken}).then(apiResponse => {
      const {success} = apiResponse;

      const newStatus: FetchIdeaStatus = {
        isLoading: false,
        success,
        apiResponse,
        idea: apiResponse.idea,
      };

      if (!success) newStatus.error = {code: "GENERIC_ERROR", message: "Could not get idea."};

      runInAction(() => {
        this.fetchIdeaStatus = newStatus;

        if (success && !_.isNil(idea)) _.merge(idea, apiResponse.idea);
      });

      return newStatus;
    });
  }

  @action
  createIdea(request: CreateIdeaRequest): Promise<CreateIdeaStatus> {
    const {authToken} = this.rootStore.userState;
    const {challenge, title, description, image} = request;

    let newStatus: CreateIdeaStatus = {
      ...this.initialCreateIdeaStatus,
      isLoading: true,
    };
    this.createIdeaStatus = newStatus;

    if (_.isNil(authToken)) {
      newStatus = {
        isLoading: false,
        error: {code: "USER_NOT_AUTHENTICATED_ERROR", message: "You are not logged in."},
      };

      this.createIdeaStatus = newStatus;

      return Promise.resolve(newStatus);
    }

    return APIClient.createIdea({
      authToken,
      title,
      description,
      image,
      challengeId: challenge.id,
    }).then(apiResponse => {
      const {success} = apiResponse;

      newStatus = {
        isLoading: false,
        success,
        apiResponse,
        idea: apiResponse.idea,
      };

      if (!success) newStatus.error = {code: "GENERIC_ERROR", message: "Could not create idea."};

      runInAction(() => {
        const {fetchMyIdeasStatus} = this;

        if (apiResponse.success) {
          const {idea} = apiResponse;

          if (!_.isNil(fetchMyIdeasStatus.ideas)) {
            fetchMyIdeasStatus.ideas.unshift(idea);
            fetchMyIdeasStatus.totalCount!++;
          }

          if (!_.isNil(idea.createdBy) && !_.isNil(idea.createdBy.ideas)) idea.createdBy.ideas.unshift(idea);
          idea.challenge = challenge;

          if (!_.isNil(challenge.ideas)) challenge.ideas.unshift(idea);
        }

        this.createIdeaStatus = newStatus;
      });

      return newStatus;
    });
  }

  @action
  updateIdea(request: UpdateIdeaRequest): Promise<UpdateIdeaStatus> {
    const {userState} = this.rootStore;
    const {authToken} = userState;
    const {title, description, image} = request;

    let newStatus: UpdateIdeaStatus = {
      isLoading: true,
    };
    this.updateIdeaStatus = newStatus;

    if (_.isNil(authToken)) {
      newStatus.isLoading = false;
      newStatus.error = {code: "USER_NOT_AUTHENTICATED_ERROR", message: "You are not logged in."};

      this.updateIdeaStatus = newStatus;

      return Promise.resolve(newStatus);
    }

    return APIClient.updateIdea({
      authToken,
      id: request.idea.id,
      title,
      description,
      image,
    }).then(apiResponse => {
      const {success} = apiResponse;

      newStatus = {
        isLoading: false,
        success,
        apiResponse,
        idea: apiResponse.idea,
      };

      if (!newStatus.success) newStatus.error = {code: "GENERIC_ERROR", message: "Could not update idea."};

      runInAction(() => {
        if (apiResponse.success) {
          const updateIdea = (c: Models.Idea) => {
            runInAction(() => {
              const responseIdea = apiResponse.idea;

              c.id = responseIdea.id;
              c.title = responseIdea.title;
              c.description = responseIdea.description;
              c.imageUrl = responseIdea.imageUrl;
            });
          };

          updateIdea(request.idea);
        }

        this.updateIdeaStatus = newStatus;
      });

      return newStatus;
    });
  }

  @action
  deleteIdea(request: DeleteIdeaRequest): Promise<DeleteIdeaStatus> {
    const {authToken} = this.rootStore.userState;
    const {id, idea} = request;

    let newStatus: DeleteIdeaStatus = {
      isLoading: true,
    };
    this.deleteIdeaStatus = newStatus;

    if (_.isNil(authToken)) {
      newStatus.isLoading = false;
      newStatus.error = {code: "USER_NOT_AUTHENTICATED_ERROR", message: "You are not logged in."};

      this.deleteIdeaStatus = newStatus;

      return Promise.resolve(newStatus);
    }

    return APIClient.deleteIdea({
      authToken,
      id: !_.isNil(id) ? id : idea!.id,
    }).then(apiResponse => {
      const {success} = apiResponse;

      newStatus = {
        isLoading: false,
        success: success,
        apiResponse,
      };

      if (!newStatus.success) newStatus.error = {code: "GENERIC_ERROR", message: "Could not delete idea."};

      runInAction(() => {
        const {fetchMyIdeasStatus} = this;

        if (apiResponse.success) {
          const removeFromSource = (source: Models.Idea[]) => {
            const ideaIndex = source.findIndex(i => i.id === (!_.isNil(id) ? id : idea!.id));

            runInAction(() => {
              if (ideaIndex !== -1) source.splice(ideaIndex, 1);
            });

            return ideaIndex !== -1;
          };

          if (!_.isNil(fetchMyIdeasStatus.ideas) && removeFromSource(fetchMyIdeasStatus.ideas)) {
            fetchMyIdeasStatus.totalCount!--;
          }

          if (!_.isNil(idea) && !_.isNil(idea.createdBy) && !_.isNil(idea.createdBy.ideas)) removeFromSource(idea.createdBy.ideas);

          if (!_.isNil(idea) && !_.isNil(idea.challenge) && !_.isNil(idea.challenge.ideas)) removeFromSource(idea.challenge.ideas);
        }

        this.deleteIdeaStatus = newStatus;
      });

      return newStatus;
    });
  }

  @action
  signOut() {
    this.fetchChallengeIdeasStatus = _.cloneDeep(this.initialFetchChallengeIdeasStatus);
    this.fetchUserIdeasStatus = _.cloneDeep(this.initialFetchUserIdeasStatus);
    this.fetchIdeasWithUserReactionStatus = _.cloneDeep(this.initialFetchIdeasWithUserReactionStatus);
    this.fetchIdeasWithMyReactionStatus = _.cloneDeep(this.initialFetchIdeasWithMyReactionStatus);
    this.createIdeaStatus = _.cloneDeep(this.initialCreateIdeaStatus);
    this.updateIdeaStatus = _.cloneDeep(this.initialUpdateIdeaStatus);
    this.deleteIdeaStatus = _.cloneDeep(this.initialDeleteIdeaStatus);
    this.fetchMyIdeasStatus = _.cloneDeep(this.initialFetchMyIdeasStatus);
    this.fetchIdeaStatus = _.cloneDeep(this.initialFetchIdeaStatus);
  }
}

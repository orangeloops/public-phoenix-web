import {ReactNativeFile} from "apollo-upload-client";
import * as _ from "lodash";
import {action, observable, runInAction} from "mobx";
import moment from "moment";
import {APIClient} from "../apiclient/APIClient";
import * as Models from "../models";
import * as Errors from "../Errors";
import {State} from "./State";
import {CreateChallengeResponse, DeleteChallengeResponse, FetchChallengeListResponse, FetchChallengeResponse, FetchMyChallengesResponse, FetchUserChallengesResponse, UpdateChallengeResponse} from "../apiclient/APIClient.types";

export interface FetchChallengeListRequest {}
export interface FetchChallengeListStatus {
  isLoading: boolean;
  success?: boolean;
  error?: Errors.GenericError;
  apiResponse?: FetchChallengeListResponse;
  challenges?: Models.Challenge[];
}

export interface FetchMyChallengesRequest {}
export interface FetchMyChallengesStatus {
  isLoading: boolean;
  success?: boolean;
  error?: Errors.NetworkError | Errors.GenericError | Errors.UserNotAuthenticatedError;
  apiResponse?: FetchMyChallengesResponse;
  challenges?: Models.Challenge[];
  totalCount?: number;
}

export interface FetchUserChallengesRequest {
  user: string | Models.User;
}
export interface FetchUserChallengesStatus {
  isLoading: boolean;
  success?: boolean;
  error?: Errors.GenericError;
  apiResponse?: FetchUserChallengesResponse;
  challenges?: Models.Challenge[];
  totalCount?: number;
}

export interface FetchChallengeRequest {
  id: string;
}
export interface FetchChallengeStatus {
  isLoading: boolean;
  success?: boolean;
  error?: Errors.GenericError | Errors.ObjectNotFoundError;
  apiResponse?: FetchChallengeResponse;
  challenge?: Models.Challenge;
}

export interface UpdateChallengeRequest {
  challenge: Models.Challenge;
  title: string;
  description?: string;
  closeDate?: moment.Moment;
  endDate?: moment.Moment;
  image?: File | ReactNativeFile;
  privacyMode?: Models.ChallengePrivacyMode;
}
export interface UpdateChallengeStatus {
  isLoading: boolean;
  success?: boolean;
  error?: Errors.GenericError | Errors.UserNotAuthenticatedError;
  apiResponse?: UpdateChallengeResponse;
  challenge?: Models.Challenge;
}

export interface DeleteChallengeRequest {
  id?: string;
  challenge?: Models.Challenge;
}
export interface DeleteChallengeStatus {
  isLoading: boolean;
  success?: boolean;
  error?: Errors.GenericError | Errors.UserNotAuthenticatedError;
  apiResponse?: DeleteChallengeResponse;
}

export interface CreateChallengeRequest {
  title: string;
  description?: string;
  closeDate?: moment.Moment;
  endDate?: moment.Moment;
  image?: File | ReactNativeFile;
  privacyMode?: Models.ChallengePrivacyMode;
}
export interface CreateChallengeStatus {
  isLoading: boolean;
  success?: boolean;
  error?: Errors.GenericError | Errors.UserNotAuthenticatedError;
  apiResponse?: CreateChallengeResponse;
  challenge?: Models.Challenge;
}

export class ChallengeState extends State {
  initialFetchChallengeListStatus: FetchChallengeListStatus = {
    isLoading: false,
  };

  @observable
  fetchChallengeListStatus = _.cloneDeep(this.initialFetchChallengeListStatus);

  initialFetchMyChallengesStatus: FetchMyChallengesStatus = {
    isLoading: false,
  };

  @observable
  fetchMyChallengesStatus = _.cloneDeep(this.initialFetchMyChallengesStatus);

  initialFetchUserChallengesStatus: FetchUserChallengesStatus = {
    isLoading: false,
  };

  @observable
  fetchUserChallengesStatus = _.cloneDeep(this.initialFetchUserChallengesStatus);

  initialFetchChallengeStatus: FetchChallengeStatus = {
    isLoading: false,
  };

  @observable
  fetchChallengeStatus = _.cloneDeep(this.initialFetchChallengeStatus);

  initialUpdateChallengeStatus: UpdateChallengeStatus = {
    isLoading: false,
  };

  @observable
  updateChallengeStatus = _.cloneDeep(this.initialUpdateChallengeStatus);

  initialCreateChallengeStatus: CreateChallengeStatus = {
    isLoading: false,
  };

  @observable
  createChallengeStatus = _.cloneDeep(this.initialCreateChallengeStatus);

  initialDeleteChallengeStatus: DeleteChallengeStatus = {
    isLoading: false,
  };

  @observable
  deleteChallengeStatus = _.cloneDeep(this.initialDeleteChallengeStatus);

  @observable
  challengeList: Models.Challenge[] | undefined = undefined;

  @observable
  currentChallenge: Models.Challenge | undefined = undefined;

  @action
  fetchChallengeList(request: FetchChallengeListRequest = {}): Promise<FetchChallengeListStatus> {
    const {authToken} = this.rootStore.userState;
    this.fetchChallengeListStatus = {
      isLoading: true,
    };

    return APIClient.fetchChallengeList({authToken}).then(apiResponse => {
      const {success, challenges} = apiResponse;

      const newStatus: FetchChallengeListStatus = {
        isLoading: false,
        success,
        apiResponse,
        challenges,
      };

      if (!success) newStatus.error = {code: "GENERIC_ERROR", message: "Could not get user's ideas."};

      runInAction(() => {
        if (newStatus.success) {
          newStatus.challenges = observable(newStatus.challenges!);

          newStatus.challenges!.forEach(challenge => {
            const {ideas} = challenge;

            ideas.forEach(idea => {
              idea.challenge = challenge;
            });
          });

          this.challengeList = newStatus.challenges;
        }

        this.fetchChallengeListStatus = newStatus;
      });

      return newStatus;
    });
  }

  @action
  async fetchMyChallenges(request: FetchMyChallengesRequest = {}): Promise<FetchMyChallengesStatus> {
    const {authToken, currentUser} = this.rootStore.userState;

    let newStatus: FetchMyChallengesStatus = {
      isLoading: true,
    };
    this.fetchMyChallengesStatus = newStatus;

    if (_.isNil(authToken)) {
      newStatus = {
        isLoading: false,
        error: {code: "USER_NOT_AUTHENTICATED_ERROR", message: "You are not logged in."},
      };

      this.fetchMyChallengesStatus = newStatus;

      return newStatus;
    }

    const response = await APIClient.fetchMyChallenges({authToken});
    newStatus = {
      isLoading: false,
      success: response.success,
      apiResponse: response,
      challenges: response.challenges,
      totalCount: response.success ? response.totalCount : undefined,
      error: !response.success ? response.error : undefined,
    };

    runInAction(() => {
      if (response.success && !_.isNil(currentUser)) {
        currentUser.challenges = observable(response.challenges);

        for (let i = 0; i < response.challenges.length; i++) response.challenges[i].createdBy = currentUser;
      }

      this.fetchMyChallengesStatus = newStatus;
    });

    return newStatus;
  }

  @action
  async fetchUserChallenges(request: FetchUserChallengesRequest): Promise<FetchUserChallengesStatus> {
    const {authToken} = this.rootStore.userState;
    const {user} = request;

    let newStatus: FetchUserChallengesStatus = {
      isLoading: true,
    };
    this.fetchUserChallengesStatus = newStatus;

    const userId = typeof user === "string" ? user : user.id;

    const response = await APIClient.fetchUserChallenges({authToken, userId});
    const {success, challenges, totalCount} = response;

    newStatus = {
      isLoading: false,
      success,
      apiResponse: response,
      challenges,
      totalCount,
    };

    if (!success) newStatus.error = {code: "GENERIC_ERROR", message: "Could not get user's challenges."};

    runInAction(() => {
      if (typeof user !== "string" && !_.isNil(challenges)) {
        user.challenges = observable(challenges);

        for (let i = 0; i < challenges.length; i++) challenges[i].createdBy = user;
      }

      this.fetchUserChallengesStatus = newStatus;
    });

    return newStatus;
  }

  @action
  setChallengeList(challengeList: Models.Challenge[] | undefined) {
    this.challengeList = challengeList;
  }

  @action
  async fetchChallenge(request: FetchChallengeRequest): Promise<FetchChallengeStatus> {
    const {authToken} = this.rootStore.userState;
    this.fetchChallengeListStatus = {
      isLoading: true,
    };

    const response = await APIClient.fetchChallenge({...request, authToken, challengeId: request.id});
    const {success, challenge} = response;

    const newStatus: FetchChallengeStatus = {
      isLoading: false,
      success: success && !_.isNil(challenge),
      apiResponse: response,
      challenge,
    };

    if (!success) newStatus.error = {code: "GENERIC_ERROR", message: "Could not get challenge."};
    else if (_.isNil(challenge)) newStatus.error = {code: "OBJECT_NOT_FOUND_ERROR", message: "Challenge not found."};

    runInAction(() => {
      if (newStatus.success) {
        newStatus.challenge = observable(newStatus.challenge!);

        const {ideas} = newStatus.challenge!;

        ideas.forEach(idea => {
          idea.challenge = newStatus.challenge!;
        });

        this.setCurrentChallenge(newStatus.challenge);
        this.fetchChallengeStatus = newStatus;
      }
    });

    return newStatus;
  }

  @action
  setCurrentChallenge(challenge: Models.Challenge | undefined) {
    this.currentChallenge = challenge;
  }

  @action
  createChallenge(request: CreateChallengeRequest): Promise<CreateChallengeStatus> {
    const {authToken} = this.rootStore.userState;
    const {title, description, closeDate, endDate, image, privacyMode} = request;

    let newStatus: CreateChallengeStatus = {
      isLoading: true,
    };
    this.createChallengeStatus = newStatus;

    if (_.isNil(authToken)) {
      newStatus = {
        isLoading: false,
        error: {code: "USER_NOT_AUTHENTICATED_ERROR", message: "You are not logged in."},
      };

      this.createChallengeStatus = newStatus;

      return Promise.resolve(newStatus);
    }

    return APIClient.createChallenge({
      authToken,
      title,
      description,
      closeDate,
      endDate,
      image,
      privacyMode,
    }).then(apiResponse => {
      const {success, challenge} = apiResponse;

      newStatus = {
        isLoading: false,
        success,
        apiResponse,
        challenge,
      };

      if (!newStatus.success) newStatus.error = {code: "GENERIC_ERROR", message: "Could not create challenge."};

      runInAction(() => {
        if (newStatus.success && !_.isNil(newStatus.challenge)) {
          const {challengeList, fetchMyChallengesStatus} = this;

          if (!_.isNil(challengeList)) challengeList.unshift(newStatus.challenge);

          if (!_.isNil(fetchMyChallengesStatus.challenges)) {
            fetchMyChallengesStatus.challenges.unshift(newStatus.challenge);
            fetchMyChallengesStatus.totalCount!++;
          }
        }

        this.createChallengeStatus = newStatus;
      });

      return newStatus;
    });
  }

  @action
  updateChallenge(request: UpdateChallengeRequest): Promise<UpdateChallengeStatus> {
    const {userState} = this.rootStore;
    const {authToken} = userState;
    const {title, description, closeDate, endDate, image, privacyMode} = request;

    let newStatus: UpdateChallengeStatus = {
      isLoading: true,
    };
    this.updateChallengeStatus = newStatus;

    if (_.isNil(authToken)) {
      newStatus.isLoading = false;
      newStatus.error = {code: "USER_NOT_AUTHENTICATED_ERROR", message: "You are not logged in."};

      this.updateChallengeStatus = newStatus;

      return Promise.resolve(newStatus);
    }

    return APIClient.updateChallenge({
      authToken,
      id: request.challenge.id,
      title,
      description,
      closeDate,
      endDate,
      image,
      privacyMode,
    }).then(apiResponse => {
      const {success} = apiResponse;

      newStatus = {
        isLoading: false,
        success,
        apiResponse,
        challenge: apiResponse.challenge,
      };

      if (!newStatus.success) newStatus.error = {code: "GENERIC_ERROR", message: "Could not update challenge."};

      runInAction(() => {
        if (apiResponse.success) {
          const updateChallenge = (c: Models.Challenge) => {
            runInAction(() => {
              const responseChallenge = apiResponse.challenge;

              c.id = responseChallenge.id;
              c.title = responseChallenge.title;
              c.description = responseChallenge.description;
              c.endDate = responseChallenge.endDate;
              c.closeDate = responseChallenge.closeDate;
              c.imageUrl = responseChallenge.imageUrl;
              c.privacyMode = responseChallenge.privacyMode;
            });
          };

          updateChallenge(request.challenge);

          const {challengeList} = this;
          if (!_.isNil(challengeList)) {
            const challengeToUpdate = challengeList.find(c => c.id === apiResponse.challenge.id);

            if (!_.isNil(challengeToUpdate)) updateChallenge(challengeToUpdate);
          }
        }

        this.updateChallengeStatus = newStatus;
      });

      return newStatus;
    });
  }

  @action
  deleteChallenge(request: DeleteChallengeRequest): Promise<DeleteChallengeStatus> {
    const {authToken} = this.rootStore.userState;
    const id = !_.isNil(request.challenge) ? request.challenge.id : request.id!;

    let newStatus: DeleteChallengeStatus = {
      isLoading: true,
    };
    this.deleteChallengeStatus = newStatus;

    if (_.isNil(authToken)) {
      newStatus.isLoading = false;
      newStatus.error = {code: "USER_NOT_AUTHENTICATED_ERROR", message: "You are not logged in."};

      this.deleteChallengeStatus = newStatus;

      return Promise.resolve(newStatus);
    }

    return APIClient.deleteChallenge({
      authToken,
      id,
    }).then(apiResponse => {
      const {success} = apiResponse;

      newStatus = {
        isLoading: false,
        success: success,
        apiResponse,
      };

      if (!newStatus.success) newStatus.error = {code: "GENERIC_ERROR", message: "Could not delete challenge."};

      runInAction(() => {
        const {challengeList, fetchMyChallengesStatus} = this;

        if (success) {
          const removeFromSource = (source: Models.Challenge[]) => {
            const challengeIndex = source.findIndex(challenge => challenge.id === id);

            runInAction(() => {
              if (challengeIndex !== -1) source.splice(challengeIndex, 1);
            });

            return challengeIndex !== -1;
          };

          if (!_.isNil(fetchMyChallengesStatus.challenges)) {
            if (removeFromSource(fetchMyChallengesStatus.challenges)) fetchMyChallengesStatus.totalCount!--;
          }

          if (!_.isNil(request.challenge)) {
            const {createdBy} = request.challenge;

            if (!_.isNil(createdBy) && !_.isNil(createdBy.challenges)) removeFromSource(createdBy.challenges);
          }

          if (!_.isNil(challengeList)) removeFromSource(challengeList);
        }

        this.deleteChallengeStatus = newStatus;
      });

      return newStatus;
    });
  }

  @action
  signOut() {
    this.challengeList = undefined;
    this.currentChallenge = undefined;

    this.fetchChallengeListStatus = _.cloneDeep(this.initialFetchChallengeListStatus);
    this.fetchMyChallengesStatus = _.cloneDeep(this.initialFetchMyChallengesStatus);
    this.fetchUserChallengesStatus = _.cloneDeep(this.initialFetchUserChallengesStatus);
    this.fetchChallengeStatus = _.cloneDeep(this.initialFetchChallengeStatus);
    this.createChallengeStatus = _.cloneDeep(this.initialCreateChallengeStatus);
    this.updateChallengeStatus = _.cloneDeep(this.initialUpdateChallengeStatus);
    this.deleteChallengeStatus = _.cloneDeep(this.initialDeleteChallengeStatus);
  }
}

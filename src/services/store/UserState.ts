import * as _ from "lodash";
import {action, computed, observable, runInAction} from "mobx";
import * as Models from "../models";
import * as Errors from "../Errors";
import {State} from "./State";
import {ReactNativeFile} from "extract-files";
import {APIClient} from "../apiclient/APIClient";
import {FetchMeResponse, FetchUserResponse, SignInResponse, SignUpResponse, UpdateUserResponse} from "../apiclient/APIClient.types";

export interface RefreshTokensRequest {}

export interface RefreshTokensResponse {
  success: boolean;
  authToken?: string;
  refreshToken?: string;
  error?: Errors.NetworkError | Errors.GenericError | Errors.BadUserInputError;
}

export interface TestTokenRequest {
  token: string;
  refreshToken?: string | null;
}

export interface TestTokenStatus {
  success?: boolean;
  error?: Errors.GenericError | Errors.BadUserInputError<undefined>;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export enum SignInFields {
  Email = "email",
  Password = "password",
}

export interface SignInStatus {
  isLoading: boolean;
  success?: boolean;
  errors?: Errors.NetworkError | Errors.GenericError | Errors.ValidationError<SignInFields>[] | Errors.ObjectNotFoundError | Errors.PendingAccountError;

  apiResponse?: SignInResponse;
}

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
}

export enum SignUpErrorCodes {
  EmptyNameField = "empty_name_field",
  EmptyEmailField = "empty_email_field",
  EmptyPasswordField = "empty_password_field",
}

export interface SignUpStatus {
  isLoading: boolean;
  success?: boolean;
  errors?: Errors.NetworkError | Errors.ValidationError<SignUpErrorCodes>[] | Errors.GenericError | Errors.BadUserInputError<"EMAIL_IN_USE">;
  apiResponse?: SignUpResponse;
}

export interface ResendEmailConfirmationRequest {
  email: string;
}

export interface ResendEmailConfirmationStatus {
  isLoading: boolean;
  success?: boolean;
  error?: Errors.GenericError;
}

export interface RequestResetPasswordRequest {
  email: string;
}

export enum RequestResetPasswordFields {
  Email = "email",
}

export interface RequestResetPasswordStatus {
  isLoading: boolean;
  success?: boolean;
  errors?: Errors.NetworkError | Errors.GenericError | Errors.ValidationError<RequestResetPasswordFields>[] | Errors.BadUserInputError;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export enum ResetPasswordFields {
  Password = "password",
}

export interface ResetPasswordStatus {
  isLoading: boolean;
  success?: boolean;
  errors?: Errors.NetworkError | Errors.GenericError | Errors.ValidationError<ResetPasswordFields>[];
}

export interface FetchMeRequest {}

export interface FetchMeStatus {
  isLoading: boolean;
  success?: boolean;
  error?: Errors.GenericError | Errors.UserNotAuthenticatedError;
  apiResponse?: FetchMeResponse;
  user?: Models.User;
}

export interface FetchUserRequest {
  id: string;
}

export interface FetchUserStatus {
  isLoading: boolean;
  success?: boolean;
  error?: Errors.GenericError;
  apiResponse?: FetchUserResponse;
  user?: Models.User;
}

export interface UpdateMeRequest {
  name?: string;
  image?: File | ReactNativeFile;
}

export interface UpdateMeStatus {
  isLoading: boolean;
  success?: boolean;
  error?: Errors.GenericError;
  apiResponse?: UpdateUserResponse;
  user?: Models.User;
}

export type ConfirmEmailRequest = {
  token: string;
};

export type ConfirmEmailStatus = {
  isLoading: boolean;
  success?: boolean;
  error?: Errors.GenericError;
};

export type CheckEmailRequest = {
  email: string;
};

export type CheckEmailStatus = {
  isLoading: boolean;
  success?: boolean;
  isAvailable?: boolean;
  isBlacklisted?: boolean;
  isCorporate?: boolean;
};

export class UserState extends State {
  @observable
  currentUser: Models.User | undefined;

  @observable
  authToken: string | undefined;

  @observable
  refreshToken: string | undefined;

  @computed
  get currentDomain(): string | undefined {
    const {currentUser} = this;

    const email = !_.isNil(currentUser) ? currentUser.email : undefined;

    return !_.isNil(email) ? email.split("@")[1] : undefined;
  }

  initialSignInStatus: SignInStatus = {
    isLoading: false,
  };

  @observable
  signInStatus = _.cloneDeep(this.initialSignInStatus);

  initialSignUpStatus: SignUpStatus = {
    isLoading: false,
  };

  @observable
  signUpStatus = _.cloneDeep(this.initialSignUpStatus);

  initialResendEmailConfirmationStatus: ResendEmailConfirmationStatus = {
    isLoading: false,
  };

  @observable
  resendEmailConfirmationStatus = _.cloneDeep(this.initialResendEmailConfirmationStatus);

  initialRequestResetPasswordStatus: RequestResetPasswordStatus = {
    isLoading: false,
  };

  @observable
  requestResetPasswordStatus = _.cloneDeep(this.initialRequestResetPasswordStatus);

  initialResetPasswordStatus: ResetPasswordStatus = {
    isLoading: false,
  };

  @observable
  resetPasswordStatus = _.cloneDeep(this.initialResetPasswordStatus);

  initialFetchMeStatus: FetchMeStatus = {
    isLoading: false,
  };

  @observable
  fetchMeStatus = _.cloneDeep(this.initialFetchMeStatus);

  initialFetchUserStatus: FetchUserStatus = {
    isLoading: false,
  };

  @observable
  fetchUserStatus = _.cloneDeep(this.initialFetchUserStatus);

  initialUpdateMeStatus: UpdateMeStatus = {
    isLoading: false,
  };

  @observable
  updateMeStatus = _.cloneDeep(this.initialUpdateMeStatus);

  initialConfirmEmailStatus: ConfirmEmailStatus = {
    isLoading: false,
  };

  @observable
  confirmEmailStatus = _.cloneDeep(this.initialConfirmEmailStatus);

  initialCheckEmailStatus: CheckEmailStatus = {
    isLoading: false,
  };

  @observable
  checkEmailStatus = _.cloneDeep(this.initialCheckEmailStatus);

  protected refreshTokensInterval: any;

  @action
  setAuthToken(authToken: string | undefined) {
    this.authToken = authToken;
  }

  async refreshTokens(request: RefreshTokensRequest = {}): Promise<RefreshTokensResponse> {
    const {refreshToken, authToken} = this;

    const apiResponse = await APIClient.refreshTokens({
      refreshToken: refreshToken!,
      authToken,
    });

    runInAction(() => {
      if (apiResponse.success) {
        if (apiResponse.authToken) this.authToken = apiResponse.authToken;

        if (apiResponse.refreshToken) this.refreshToken = apiResponse.refreshToken;
      }
    });

    return apiResponse;
  }

  async startRefreshTokensInterval(fireImmediately: boolean = true) {
    clearInterval(this.refreshTokensInterval);

    if (fireImmediately && this.refreshToken) {
      const refreshTokensResponse = await this.refreshTokens();

      if (refreshTokensResponse.success && refreshTokensResponse.error && refreshTokensResponse.error.code === "BAD_USER_INPUT_ERROR") return;
    }

    this.refreshTokensInterval = setInterval(async () => {
      const {refreshToken} = this;

      if (refreshToken === undefined) return;

      const refreshTokensResponse = await this.refreshTokens();

      if (!refreshTokensResponse.success && refreshTokensResponse.error && refreshTokensResponse.error.code === "BAD_USER_INPUT_ERROR") clearInterval(this.refreshTokensInterval);
    }, 60000 * 15);
  }

  @computed
  get isAuthenticated(): boolean {
    return !_.isNil(this.authToken);
  }

  @action
  async testToken(request: TestTokenRequest): Promise<TestTokenStatus> {
    const {token} = request;
    this.setAuthToken(token);

    const fetchMeResponse = await this.fetchMe();

    let error: Errors.BadUserInputError | Errors.GenericError | undefined;
    if (!fetchMeResponse.success) {
      error = fetchMeResponse.error !== undefined && fetchMeResponse.error.code === "GENERIC_ERROR" ? fetchMeResponse.error : {code: "BAD_USER_INPUT_ERROR", message: "Invalid token", extra: undefined};
      this.setAuthToken(undefined);
    } else {
      if (request.refreshToken) {
        runInAction(() => {
          this.refreshToken = request.refreshToken!;
        });

        this.startRefreshTokensInterval();
      }
    }

    return {
      success: fetchMeResponse.success,
      error,
    };
  }

  @action
  signIn(request: SignInRequest): Promise<SignInStatus> {
    const {email, password} = request;

    this.signInStatus = {
      isLoading: true,
    };

    const errors: Errors.ValidationError<SignInFields>[] = [];

    if (email.trim().length === 0) errors.push({code: "VALIDATION_ERROR", message: "Email field is empty.", field: SignInFields.Email});
    if (password.trim().length === 0) errors.push({code: "VALIDATION_ERROR", message: "Password field is empty.", field: SignInFields.Password});

    if (errors.length > 0) {
      this.signInStatus = {
        isLoading: false,
        success: false,
        errors,
      };

      return Promise.resolve(this.signInStatus);
    }

    return APIClient.signIn({email, password}).then(apiResponse => {
      const {success, authToken, refreshToken} = apiResponse;

      const newStatus: SignInStatus = {
        isLoading: false,
        success,
        apiResponse,
      };

      if (!apiResponse.success && _.isNil(newStatus.errors)) newStatus.errors = apiResponse.error;

      runInAction(() => {
        if (apiResponse.success) {
          this.authToken = authToken;

          if (refreshToken) {
            this.refreshToken = refreshToken;
            this.startRefreshTokensInterval(false);
          }
        }

        this.signInStatus = newStatus;
      });

      return newStatus;
    });
  }

  @action
  async signUp(request: SignUpRequest): Promise<SignUpStatus> {
    const {name, email, password} = request;

    this.signUpStatus = {
      isLoading: true,
    };

    const errors: Errors.ValidationError<SignUpErrorCodes>[] = [];

    if (name.trim().length === 0) errors.push({code: "VALIDATION_ERROR", message: "Name field is empty.", field: SignUpErrorCodes.EmptyNameField});
    if (email.trim().length === 0) errors.push({code: "VALIDATION_ERROR", message: "Email field is empty.", field: SignUpErrorCodes.EmptyEmailField});
    if (password.trim().length === 0) errors.push({code: "VALIDATION_ERROR", message: "Password field is empty.", field: SignUpErrorCodes.EmptyPasswordField});

    if (errors.length > 0) {
      _.assign(this.signUpStatus, {
        isLoading: false,
        success: false,
        errors,
      });

      return this.signUpStatus;
    }

    const apiResponse = await APIClient.signUp({name, email, password});

    const {success} = apiResponse;

    const newStatus: SignUpStatus = {
      isLoading: false,
      success,
      apiResponse,
      errors: apiResponse.success ? undefined : apiResponse.error,
    };

    runInAction(() => {
      this.signUpStatus = newStatus;
    });

    return newStatus;
  }

  @action
  async resendEmailConfirmation(request: ResendEmailConfirmationRequest): Promise<ResendEmailConfirmationStatus> {
    const {email} = request;

    const setStatus = (status: ResendEmailConfirmationStatus) => runInAction(() => (this.resendEmailConfirmationStatus = status));

    let newStatus: ResendEmailConfirmationStatus = {isLoading: true};
    setStatus(newStatus);

    const {success} = await APIClient.resendEmailConfirmation({email});

    newStatus = {
      isLoading: false,
      success,
    };

    if (!success) newStatus.error = {code: "GENERIC_ERROR", message: "There was an unexpected problem. Please try again in a few minutes."};

    setStatus(newStatus);

    return newStatus;
  }

  @action
  async requestResetPassword(request: RequestResetPasswordRequest): Promise<RequestResetPasswordStatus> {
    const {email} = request;

    const setNewStatus = (status: RequestResetPasswordStatus) => {
      runInAction(() => (this.requestResetPasswordStatus = status));
    };

    let newStatus: RequestResetPasswordStatus = {
      isLoading: true,
    };
    setNewStatus(newStatus);

    const errors: Errors.ValidationError<RequestResetPasswordFields>[] = [];

    if (email.trim().length === 0) errors.push({code: "VALIDATION_ERROR", message: "Email field is empty.", field: RequestResetPasswordFields.Email});

    if (errors.length > 0) {
      newStatus = {
        isLoading: false,
        success: false,
        errors,
      };
      setNewStatus(newStatus);

      return newStatus;
    }

    const apiResponse = await APIClient.requestResetPassword({email});

    const {success} = apiResponse;

    newStatus = {
      isLoading: false,
      success,
    };

    if (!apiResponse.success) {
      const {error} = apiResponse;

      newStatus.errors = error;
    }

    runInAction(() => {
      setNewStatus(newStatus);
    });

    return newStatus;
  }

  @action
  async resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordStatus> {
    const {token, password} = request;

    const setNewStatus = (status: ResetPasswordStatus) => {
      runInAction(() => (this.resetPasswordStatus = status));
    };

    let newStatus: ResetPasswordStatus = {
      isLoading: true,
    };
    setNewStatus(newStatus);

    const errors: Errors.ValidationError<ResetPasswordFields>[] = [];

    if (password.trim().length === 0) errors.push({code: "VALIDATION_ERROR", message: "Password field is empty.", field: ResetPasswordFields.Password});

    if (errors.length > 0) {
      this.resetPasswordStatus = {
        isLoading: false,
        success: false,
        errors,
      };

      return this.resetPasswordStatus;
    }

    const apiResponse = await APIClient.resetPassword({token, password});

    const {success} = apiResponse;

    newStatus = {
      isLoading: false,
      success,
    };

    if (!apiResponse.success) newStatus.errors = apiResponse.error;

    runInAction(() => {
      this.resetPasswordStatus = newStatus;
    });

    return newStatus;
  }

  @action
  fetchMe(request: FetchMeRequest = {}): Promise<FetchMeStatus> {
    const {authToken} = this;

    this.fetchMeStatus = {
      isLoading: true,
    };

    if (_.isNil(authToken)) {
      this.fetchMeStatus = {
        isLoading: false,
        success: false,
        error: {code: "USER_NOT_AUTHENTICATED_ERROR", message: "You are not logged in."},
      };

      return Promise.resolve(this.fetchMeStatus);
    }

    return APIClient.fetchMe({authToken}).then(apiResponse => {
      const {success, user} = apiResponse;

      const newStatus: FetchMeStatus = {
        isLoading: false,
        success: success && !_.isNil(user),
        apiResponse,
        user,
      };

      if (!success || _.isNil(user)) {
        newStatus.error = {code: "GENERIC_ERROR", message: "Could not get user data."};
      }

      runInAction(() => {
        this.fetchMeStatus = newStatus;
        this.currentUser = user;
      });

      return newStatus;
    });
  }

  @action
  fetchUser(request: FetchUserRequest): Promise<FetchUserStatus> {
    const {authToken} = this;
    this.fetchUserStatus = {
      isLoading: true,
    };

    return APIClient.fetchUser({...request, authToken}).then(apiResponse => {
      const {success, user} = apiResponse;

      const newStatus: FetchUserStatus = {
        isLoading: false,
        success: success && !_.isNil(user),
        apiResponse,
        user,
      };

      if (!success || _.isNil(user)) newStatus.error = {code: "GENERIC_ERROR", message: "Could not get user data."};

      runInAction(() => (this.fetchUserStatus = newStatus));

      return newStatus;
    });
  }

  @action
  updateMe(request: UpdateMeRequest): Promise<UpdateMeStatus> {
    const {authToken, currentUser} = this;
    const {name, image} = request;

    this.updateMeStatus = {
      isLoading: true,
    };

    return APIClient.updateUser({authToken: authToken!, id: currentUser!.id, name, image}).then(apiResponse => {
      const {success, user} = apiResponse;

      const newStatus: UpdateMeStatus = {
        isLoading: false,
        success: success && !_.isNil(user),
        apiResponse,
        user,
      };

      if (!success || _.isNil(user)) newStatus.error = {code: "GENERIC_ERROR", message: "Could not update user."};

      runInAction(() => {
        this.updateMeStatus = newStatus;

        if (_.isNil(this.currentUser)) this.currentUser = user;
        else _.assign(this.currentUser, user);
      });

      return newStatus;
    });
  }

  @action
  async confirmEmail(request: ConfirmEmailRequest): Promise<ConfirmEmailStatus> {
    const {token} = request;

    const setNewStatus = (status: ConfirmEmailStatus) => {
      runInAction(() => (this.confirmEmailStatus = status));
    };

    let newStatus: ConfirmEmailStatus = {
      isLoading: true,
    };
    setNewStatus(newStatus);

    const {success} = await APIClient.confirmEmail({token});

    newStatus = {
      isLoading: false,
      success,
      error: success ? undefined : {code: "GENERIC_ERROR", message: "Could not confirm email."},
    };
    setNewStatus(newStatus);

    return newStatus;
  }

  async checkEmail(request: CheckEmailRequest): Promise<CheckEmailStatus> {
    const {email} = request;

    const setStatus = (status: CheckEmailStatus) => runInAction(() => (this.checkEmailStatus = status));

    setStatus({isLoading: true});
    const {success, isAvailable, isBlacklisted, isCorporate} = await APIClient.checkEmail({email});

    const newStatus: CheckEmailStatus = {
      isLoading: false,
      success,
      isAvailable,
      isBlacklisted,
      isCorporate,
    };

    setStatus(newStatus);

    return newStatus;
  }

  @action
  signOut() {
    this.currentUser = undefined;
    this.authToken = undefined;
    this.refreshToken = undefined;

    if (this.refreshTokensInterval) clearInterval(this.refreshTokensInterval);

    this.signInStatus = _.cloneDeep(this.initialSignInStatus);
    this.signUpStatus = _.cloneDeep(this.initialSignUpStatus);
    this.resendEmailConfirmationStatus = _.cloneDeep(this.initialResendEmailConfirmationStatus);
    this.requestResetPasswordStatus = _.cloneDeep(this.initialRequestResetPasswordStatus);
    this.resetPasswordStatus = _.cloneDeep(this.initialResetPasswordStatus);
    this.fetchMeStatus = _.cloneDeep(this.initialFetchMeStatus);
    this.fetchUserStatus = _.cloneDeep(this.initialFetchUserStatus);
    this.updateMeStatus = _.cloneDeep(this.initialUpdateMeStatus);
    this.confirmEmailStatus = _.cloneDeep(this.initialConfirmEmailStatus);
    this.checkEmailStatus = _.cloneDeep(this.initialCheckEmailStatus);
  }
}

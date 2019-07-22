import * as Models from "../models";
import * as Errors from "../Errors";
import moment from "moment";
import {ReactNativeFile} from "extract-files";

export type APIRequest = {
  authToken?: string;
};

export type RefreshTokensRequest = APIRequest & {
  refreshToken: string;
};
export type SuccessfulRefreshTokensResponse = {
  success: true;
  authToken: string;
  refreshToken: string;
};
export type FailedRefreshTokensResponse = {
  success: false;
  authToken?: undefined;
  refreshToken?: undefined;
  error: Errors.NetworkError | Errors.GenericError | Errors.BadUserInputError;
};
export type RefreshTokensResponse = SuccessfulRefreshTokensResponse | FailedRefreshTokensResponse;

export type SignInRequest = APIRequest & {
  email: string;
  password: string;
};
export type SuccessfulSignInResponse = {
  success: true;
  authToken: string;
  refreshToken: string;
};
export type FailedSignInResponse = {
  success: false;
  authToken?: undefined;
  refreshToken?: undefined;
  error: Errors.NetworkError | Errors.GenericError | Errors.ObjectNotFoundError | Errors.PendingAccountError;
};
export type SignInResponse = SuccessfulSignInResponse | FailedSignInResponse;

export type SignUpRequest = APIRequest & {
  name: string;
  email: string;
  password: string;
};
export type SuccessfulSignUpResponse = {
  success: true;
};
export type FailedSignUpResponse = {
  success: false;
  error: Errors.NetworkError | Errors.GenericError | Errors.BadUserInputError<"EMAIL_IN_USE">;
};
export type SignUpResponse = SuccessfulSignUpResponse | FailedSignUpResponse;

export type ResendEmailConfirmationRequest = APIRequest & {
  email: string;
};
export type SuccessfulResendEmailConfirmationResponse = {
  success: true;
};
export type FailedResendEmailConfirmationResponse = {
  success: false;
  error: Errors.NetworkError | Errors.GenericError;
};
export type ResendEmailConfirmationResponse = SuccessfulResendEmailConfirmationResponse | FailedResendEmailConfirmationResponse;

export type RequestResetPasswordRequest = APIRequest & {
  email: string;
};
export type SuccessfulRequestResetPasswordResponse = {
  success: true;
};
export type FailedRequestResetPasswordResponse = {
  success: false;
  error: Errors.NetworkError | Errors.GenericError | Errors.BadUserInputError<undefined>;
};
export type RequestResetPasswordResponse = SuccessfulRequestResetPasswordResponse | FailedRequestResetPasswordResponse;

export type ResetPasswordRequest = APIRequest & {
  token: string;
  password: string;
};
export type SuccessfulResetPasswordResponse = {
  success: true;
};
export type FailedResetPasswordResponse = {
  success: false;
  error: Errors.NetworkError | Errors.GenericError;
};
export type ResetPasswordResponse = SuccessfulResetPasswordResponse | FailedResetPasswordResponse;

export type ValidateEmailRequest = APIRequest & {
  authToken: string;
};
export type SuccessfulValidateEmailResponse = {
  success: true;
};
export type FailedValidateEmailResponse = {
  success: false;
  error: Errors.NetworkError | Errors.GenericError;
};
export type ValidateEmailResponse = SuccessfulValidateEmailResponse | FailedValidateEmailResponse;

export type FetchMeRequest = APIRequest & {
  authToken: string;
};
export type SuccessfulFetchMeResponse = {
  success: true;
  user: Models.User;
};
export type FailedFetchMeResponse = {
  success: false;
  user?: undefined;
  error: Errors.NetworkError | Errors.GenericError | Errors.BadUserInputError<undefined>;
};
export type FetchMeResponse = SuccessfulFetchMeResponse | FailedFetchMeResponse;

export type FetchUserRequest = APIRequest & {
  id: string;
};
export type SuccessfulFetchUserResponse = {
  success: true;
  user: Models.User;
};
export type FailedFetchUserResponse = {
  success: false;
  user?: undefined;
  error: Errors.NetworkError | Errors.GenericError;
};
export type FetchUserResponse = SuccessfulFetchUserResponse | FailedFetchUserResponse;

export type UpdateUserRequest = APIRequest & {
  authToken: string;
  id: string;
  name?: string;
  image?: File | ReactNativeFile;
};
export type SuccessfulUpdateUserResponse = {
  success: true;
  user: Models.User;
};
export type FailedUpdateUserResponse = {
  success: false;
  user?: undefined;
  error: Errors.NetworkError | Errors.GenericError;
};
export type UpdateUserResponse = SuccessfulUpdateUserResponse | FailedUpdateUserResponse;

export type ConfirmEmailRequest = APIRequest & {
  token: string;
};
export type SuccessfulConfirmEmailResponse = {
  success: true;
};
export type FailedConfirmEmailResponse = {
  success: false;
  error: Errors.NetworkError | Errors.GenericError;
};
export type ConfirmEmailResponse = SuccessfulConfirmEmailResponse | FailedConfirmEmailResponse;

export type CheckEmailRequest = APIRequest & {
  email: string;
};
export type SuccessfulCheckEmailResponse = {
  success: true;
  isAvailable: boolean;
  isBlacklisted: boolean;
  isCorporate: boolean;
};
export type FailedCheckEmailResponse = {
  success: false;
  isAvailable?: undefined;
  isBlacklisted?: undefined;
  isCorporate?: undefined;
  error: Errors.NetworkError | Errors.GenericError;
};
export type CheckEmailResponse = SuccessfulCheckEmailResponse | FailedCheckEmailResponse;

export type FetchChallengeListRequest = APIRequest;
export type SuccessfulFetchChallengeListResponse = {
  success: true;
  challenges: Models.Challenge[];
};
export type FailedFetchChallengeListResponse = {
  success: false;
  challenges?: undefined;
  error: Errors.NetworkError | Errors.GenericError;
};
export type FetchChallengeListResponse = SuccessfulFetchChallengeListResponse | FailedFetchChallengeListResponse;

export type FetchMyChallengesRequest = APIRequest & {
  authToken: string;
};
export type SuccessfulFetchMyChallengesResponse = {
  success: true;
  challenges: Models.Challenge[];
  totalCount: number;
};
export type FailedFetchMyChallengesResponse = {
  success: false;
  challenges?: undefined;
  totalCount?: undefined;
  error: Errors.NetworkError | Errors.GenericError;
};
export type FetchMyChallengesResponse = SuccessfulFetchMyChallengesResponse | FailedFetchMyChallengesResponse;

export type FetchUserChallengesRequest = APIRequest & {
  userId: string;
};
export type SuccessfulFetchUserChallengesResponse = {
  success: true;
  challenges: Models.Challenge[];
  totalCount: number;
};
export type FailedFetchUserChallengesResponse = {
  success: false;
  challenges?: undefined;
  totalCount?: undefined;
  error: Errors.NetworkError | Errors.GenericError;
};
export type FetchUserChallengesResponse = SuccessfulFetchUserChallengesResponse | FailedFetchUserChallengesResponse;

export type FetchChallengeRequest = APIRequest & {
  challengeId: string;
};
export type SuccessfulFetchChallengeResponse = {
  success: true;
  challenge: Models.Challenge;
};
export type FailedFetchChallengeResponse = {
  success: false;
  challenge?: undefined;
  error: Errors.NetworkError | Errors.GenericError;
};
export type FetchChallengeResponse = SuccessfulFetchChallengeResponse | FailedFetchChallengeResponse;

export type CreateChallengeRequest = APIRequest & {
  authToken: string;
  title: string;
  description?: string;
  closeDate?: moment.Moment;
  endDate?: moment.Moment;
  image?: File | ReactNativeFile;
  privacyMode?: Models.ChallengePrivacyMode;
};
export type SuccessfulCreateChallengeResponse = {
  success: true;
  challenge: Models.Challenge;
};
export type FailedCreateChallengeResponse = {
  success: false;
  challenge?: undefined;
  error: Errors.NetworkError | Errors.GenericError;
};
export type CreateChallengeResponse = SuccessfulCreateChallengeResponse | FailedCreateChallengeResponse;

export type UpdateChallengeRequest = APIRequest & {
  id: string;
  authToken: string;
  title: string;
  description?: string;
  closeDate?: moment.Moment;
  endDate?: moment.Moment;
  image?: File | ReactNativeFile;
  privacyMode?: Models.ChallengePrivacyMode;
};
export type SuccessfulUpdateChallengeResponse = {
  success: true;
  challenge: Models.Challenge;
};
export type FailedUpdateChallengeResponse = {
  success: false;
  challenge?: undefined;
  error: Errors.NetworkError | Errors.GenericError;
};
export type UpdateChallengeResponse = SuccessfulUpdateChallengeResponse | FailedUpdateChallengeResponse;

export type DeleteChallengeRequest = APIRequest & {
  id: string;
  authToken: string;
};
export type SuccessfulDeleteChallengeResponse = {
  success: true;
};
export type FailedDeleteChallengeResponse = {
  success: false;
  error: Errors.NetworkError | Errors.GenericError;
};
export type DeleteChallengeResponse = SuccessfulDeleteChallengeResponse | FailedDeleteChallengeResponse;

export type FetchChallengeIdeasRequest = APIRequest & {
  authToken: string;
  challengeId: string;
};
export type SuccessfulFetchChallengeIdeasResponse = {
  success: true;
  ideas: Models.Idea[];
  totalCount: number;
};
export type FailedFetchChallengeIdeasResponse = {
  success: false;
  ideas?: undefined;
  error: Errors.NetworkError | Errors.GenericError;
};
export type FetchChallengeIdeasResponse = SuccessfulFetchChallengeIdeasResponse | FailedFetchChallengeIdeasResponse;

export type FetchUserIdeasRequest = APIRequest & {
  userId: string;
};
export type SuccessfulFetchUserIdeasResponse = {
  success: true;
  ideas: Models.Idea[];
  totalCount: number;
};
export type FailedFetchUserIdeasResponse = {
  success: false;
  ideas?: undefined;
  totalCount?: undefined;
  error: Errors.NetworkError | Errors.GenericError;
};
export type FetchUserIdeasResponse = SuccessfulFetchUserIdeasResponse | FailedFetchUserIdeasResponse;

export type FetchIdeasWithUserReactionRequest = APIRequest & {
  userId: string;
};
export type SuccessfulFetchIdeasWithUserReactionResponse = {
  success: true;
  ideas: Models.Idea[];
  totalCount: number;
};
export type FailedFetchIdeasWithUserReactionResponse = {
  success: false;
  ideas?: undefined;
  totalCount?: undefined;
  error: Errors.NetworkError | Errors.GenericError;
};
export type FetchIdeasWithUserReactionResponse = SuccessfulFetchIdeasWithUserReactionResponse | FailedFetchIdeasWithUserReactionResponse;

export type FetchMyIdeasRequest = APIRequest & {
  authToken: string;
};
export type SuccessfulFetchMyIdeasResponse = {
  success: true;
  ideas: Models.Idea[];
  totalCount: number;
};
export type FailedFetchMyIdeasResponse = {
  success: false;
  ideas?: undefined;
  totalCount?: undefined;
  error: Errors.NetworkError | Errors.GenericError;
};
export type FetchMyIdeasResponse = SuccessfulFetchMyIdeasResponse | FailedFetchMyIdeasResponse;

export type FetchIdeaRequest = APIRequest & {
  authToken: string | undefined;
  id: string;
};
export type SuccessfulFetchIdeaResponse = {
  success: true;
  idea: Models.Idea;
};
export type FailedFetchIdeaResponse = {
  success: false;
  idea?: undefined;
  error: Errors.NetworkError | Errors.GenericError;
};
export type FetchIdeaResponse = SuccessfulFetchIdeaResponse | FailedFetchIdeaResponse;

export type CreateIdeaRequest = APIRequest & {
  authToken: string;
  challengeId: string;
  title: string;
  description?: string;
  image?: File | ReactNativeFile;
};
export type SuccessfulCreateIdeaResponse = {
  success: true;
  idea: Models.Idea;
};
export type FailedCreateIdeaResponse = {
  success: false;
  idea?: undefined;
  error: Errors.NetworkError | Errors.GenericError;
};
export type CreateIdeaResponse = SuccessfulCreateIdeaResponse | FailedCreateIdeaResponse;

export type UpdateIdeaRequest = APIRequest & {
  authToken: string;
  id: string;
  title: string;
  description?: string;
  image?: File | ReactNativeFile;
};
export type SuccessfulUpdateIdeaResponse = {
  success: true;
  idea: Models.Idea;
};
export type FailedUpdateIdeaResponse = {
  success: false;
  idea?: undefined;
  error: Errors.NetworkError | Errors.GenericError;
};
export type UpdateIdeaResponse = SuccessfulUpdateIdeaResponse | FailedUpdateIdeaResponse;

export type DeleteIdeaRequest = APIRequest & {
  authToken: string;
  id: string;
};
export type SuccessfulDeleteIdeaResponse = {
  success: true;
};
export type FailedDeleteIdeaResponse = {
  success: false;
  error: Errors.NetworkError | Errors.GenericError;
};
export type DeleteIdeaResponse = SuccessfulDeleteIdeaResponse | FailedDeleteIdeaResponse;

export type CreateIdeaReactionRequest = APIRequest & {
  authToken: string;
  ideaId: string;
};
export type SuccessfulCreateIdeaReactionResponse = {
  success: true;
  reaction: Models.Reaction;
};
export type FailedCreateIdeaReactionResponse = {
  success: false;
  reaction?: undefined;
  error: Errors.NetworkError | Errors.GenericError;
};
export type CreateIdeaReactionResponse = SuccessfulCreateIdeaReactionResponse | FailedCreateIdeaReactionResponse;

export type DeleteIdeaReactionRequest = APIRequest & {
  authToken: string;
  id: string;
};
export type SuccessfulDeleteIdeaReactionResponse = {
  success: true;
};
export type FailedDeleteIdeaReactionResponse = {
  success: false;
  error: Errors.NetworkError | Errors.GenericError;
};
export type DeleteIdeaReactionResponse = SuccessfulDeleteIdeaReactionResponse | FailedDeleteIdeaReactionResponse;

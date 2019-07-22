import ApolloClient from "apollo-client";
import {BaseAPIClient, Context, RequestOptions} from "./BaseAPIClient";
import {AppConfig} from "../AppConfig";
import {ApolloLink, execute} from "apollo-link";
import {createUploadLink} from "apollo-upload-client";
import {InMemoryCache} from "apollo-cache-inmemory";
import {onError} from "apollo-link-error";
import {
  CheckEmailRequest,
  CheckEmailResponse,
  ConfirmEmailRequest,
  ConfirmEmailResponse,
  CreateChallengeRequest,
  CreateChallengeResponse,
  CreateIdeaReactionRequest,
  CreateIdeaReactionResponse,
  CreateIdeaRequest,
  CreateIdeaResponse,
  DeleteChallengeRequest,
  DeleteChallengeResponse,
  DeleteIdeaReactionRequest,
  DeleteIdeaReactionResponse,
  DeleteIdeaRequest,
  DeleteIdeaResponse,
  FetchChallengeIdeasRequest,
  FetchChallengeIdeasResponse,
  FetchChallengeListRequest,
  FetchChallengeListResponse,
  FetchChallengeRequest,
  FetchChallengeResponse,
  FetchIdeaRequest,
  FetchIdeaResponse,
  FetchIdeasWithUserReactionRequest,
  FetchIdeasWithUserReactionResponse,
  FetchMeRequest,
  FetchMeResponse,
  FetchMyChallengesRequest,
  FetchMyChallengesResponse,
  FetchMyIdeasRequest,
  FetchMyIdeasResponse,
  FetchUserChallengesRequest,
  FetchUserChallengesResponse,
  FetchUserIdeasRequest,
  FetchUserIdeasResponse,
  FetchUserRequest,
  FetchUserResponse,
  RefreshTokensRequest,
  RefreshTokensResponse,
  RequestResetPasswordRequest,
  RequestResetPasswordResponse,
  ResendEmailConfirmationRequest,
  ResendEmailConfirmationResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  SignUpResponse,
  UpdateChallengeRequest,
  UpdateChallengeResponse,
  UpdateIdeaRequest,
  UpdateIdeaResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  ValidateEmailRequest,
  ValidateEmailResponse,
} from "./APIClient.types";
import gql from "graphql-tag";
import * as Models from "../models";
import * as _ from "lodash";

export type ConfigureClientOptions = {};

export type GetHeadersOptions = {
  authToken?: string;
};

export class APIClient extends BaseAPIClient {
  static client: ApolloClient<unknown>;

  static configureClient(options: ConfigureClientOptions) {
    const defaultConfig = {
      headers: {
        Accept: "application/json",
      },
      timeout: AppConfig.Settings.Server.apiClient.timeout,
    };

    this.client = new ApolloClient({
      link: ApolloLink.from([
        onError(({graphQLErrors, networkError}) => {
          if (graphQLErrors) graphQLErrors.map(({message, locations, path}) => console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`));
          if (networkError) console.log(`[Network error]: ${networkError}`);
        }),
        new ApolloLink(operation => {
          const context = operation.getContext() as Context;

          const requestConfig = {
            ...context.requestConfig,
            timeout: context.requestConfig.timeout || defaultConfig.timeout,
            headers: context.requestConfig.headers,
          };

          return execute(
            createUploadLink({
              uri: process.env.REACT_APP_SERVER_BASE_URI || "/graphql",
              credentials: "same-origin",
              fetch: this.getCustomFetch(requestConfig, context.requestOptions),
            }),
            operation
          );
        }),
      ]),
      cache: new InMemoryCache(),
      defaultOptions: {
        query: {
          fetchPolicy: "no-cache",
        },
      },
    });
  }

  static getHeaders(options: GetHeadersOptions): Record<string, string> {
    const headers: Record<string, string> = {};

    if (options.authToken) headers["x-token"] = options.authToken;

    return headers;
  }

  static async refreshTokens(request: RefreshTokensRequest, options: RequestOptions = {}): Promise<RefreshTokensResponse> {
    const {client} = this;

    const response = await this.request<RefreshTokensRequest>(
      client,
      {
        request,
        requestMethod: "mutation",
        gql: gql`
          mutation refreshTokens($token: String!) {
            refreshTokens(token: $token) {
              token
              refreshToken
            }
          }
        `,
        variables: {
          token: request.refreshToken,
        },
        headers: this.getHeaders({
          authToken: request.authToken,
        }),
        context: {},
      },
      options
    );

    if (response.success) {
      const {data} = response.rawResponse;

      if (data && data.refreshTokens && typeof data.refreshTokens.token === "string" && typeof data.refreshTokens.refreshToken === "string")
        return {
          success: true,
          authToken: data.refreshTokens.token,
          refreshToken: data.refreshTokens.refreshToken,
        };
    } else {
      const {graphQLErrors} = response.rawResponse;
      const badUserInputError = graphQLErrors.find(e => !_.isNil(e.extensions) && e.extensions.code === "BAD_USER_INPUT");

      if (badUserInputError)
        return {
          success: false,
          error: {
            code: "BAD_USER_INPUT_ERROR",
            message: badUserInputError.message,
            extra: undefined,
          },
        };
    }

    return {
      success: false,
      error: !response.success && this.isNetworkError(response.rawResponse) ? this.networkError() : this.genericError(),
    };
  }

  static async signIn(request: SignInRequest, options: RequestOptions = {}): Promise<SignInResponse> {
    const {client} = this;

    const response = await this.request<SignInRequest>(
      client,
      {
        request,
        requestMethod: "mutation",
        gql: gql`
          mutation signIn($email: String!, $password: String!) {
            signIn(email: $email, password: $password, generateRefreshToken: true) {
              token
              refreshToken
            }
          }
        `,
        variables: {
          email: request.email.toLowerCase(),
          password: request.password,
        },
        headers: this.getHeaders({}),
        context: {},
      },
      options
    );

    if (response.success) {
      const {data} = response.rawResponse;

      if (data && data.signIn && typeof data.signIn.token === "string" && typeof data.signIn.refreshToken === "string")
        return {
          success: true,
          authToken: data.signIn.token,
          refreshToken: data.signIn.refreshToken,
        };
    } else {
      const {graphQLErrors} = response.rawResponse;

      const unauthenticatedError = graphQLErrors.find(error => !_.isNil(error.extensions) && error.extensions.code === "UNAUTHENTICATED"); // TODO: NotFound -> Unauthenticated?
      const pendingError = graphQLErrors.find(error => !_.isNil(error.extensions) && error.extensions.code === "BAD_USER_INPUT" && !_.isNil(error.extensions.exception) && error.extensions.exception.statusCode === 409);

      if (unauthenticatedError)
        return {
          success: false,
          error: {
            code: "OBJECT_NOT_FOUND_ERROR",
            message: unauthenticatedError.message,
          },
        };
      else if (pendingError)
        return {
          success: false,
          error: {
            code: "PENDING_ACCOUNT_ERROR",
            message: pendingError.message,
          },
        };
    }

    return {
      success: false,
      error: !response.success && this.isNetworkError(response.rawResponse) ? this.networkError() : this.genericError(),
    };
  }

  static async signUp(request: SignUpRequest, options: RequestOptions = {}): Promise<SignUpResponse> {
    const {client} = this;

    const response = await this.request<SignUpRequest>(
      client,
      {
        request,
        requestMethod: "mutation",
        gql: gql`
          mutation signUp($name: String!, $email: String!, $password: String!) {
            signUp(name: $name, email: $email, password: $password) {
              _
            }
          }
        `,
        variables: {
          name: request.name,
          email: request.email.toLowerCase(),
          password: request.password,
        },
        headers: this.getHeaders({}),
        context: {},
      },
      options
    );

    if (!response.success) {
      const {graphQLErrors} = response.rawResponse;

      const badUserInputError = graphQLErrors.find(error => !_.isNil(error.extensions) && error.extensions.code === "BAD_USER_INPUT" && !_.isNil(error.extensions.exception) && error.extensions.exception.statusCode === 409);

      return badUserInputError
        ? {
            success: false,
            error: {
              code: "BAD_USER_INPUT_ERROR",
              message: badUserInputError.message,
              extra: "EMAIL_IN_USE",
            },
          }
        : {
            success: false,
            error: !response.success && this.isNetworkError(response.rawResponse) ? this.networkError() : this.genericError(),
          };
    }

    return {
      success: true,
    };
  }

  static async resendEmailConfirmation(request: ResendEmailConfirmationRequest, options: RequestOptions = {}): Promise<ResendEmailConfirmationResponse> {
    const {client} = this;

    const response = await this.request<ResendEmailConfirmationRequest>(
      client,
      {
        request,
        requestMethod: "mutation",
        gql: gql`
          mutation resendEmailConfirmation($email: String!) {
            resendEmailConfirmation(email: $email) {
              _
            }
          }
        `,
        variables: {
          email: request.email.toLowerCase(),
        },
        headers: this.getHeaders({authToken: request.authToken}),
        context: {},
      },
      options
    );

    if (response.success) return {success: true};

    return {
      success: false,
      error: !response.success && this.isNetworkError(response.rawResponse) ? this.networkError() : this.genericError(),
    };
  }

  static async requestResetPassword(request: RequestResetPasswordRequest, options: RequestOptions = {}): Promise<RequestResetPasswordResponse> {
    const {client} = this;

    const response = await this.request<RequestResetPasswordRequest>(
      client,
      {
        request,
        requestMethod: "mutation",
        gql: gql`
          mutation requestResetPassword($email: String!) {
            requestResetPassword(email: $email) {
              _
            }
          }
        `,
        variables: {
          email: request.email.toLowerCase(),
        },
        headers: this.getHeaders({authToken: request.authToken}),
        context: {},
      },
      options
    );

    if (response.success) return {success: true};

    const badUserInputError = response.rawResponse.graphQLErrors.find(e => !_.isNil(e.extensions) && e.extensions.code === "BAD_USER_INPUT");

    if (badUserInputError)
      return {
        success: false,
        error: {
          code: "BAD_USER_INPUT_ERROR",
          extra: undefined,
          message: badUserInputError.message,
        },
      };

    return {
      success: false,
      error: !response.success && this.isNetworkError(response.rawResponse) ? this.networkError() : this.genericError(),
    };
  }

  static async resetPassword(request: ResetPasswordRequest, options: RequestOptions = {}): Promise<ResetPasswordResponse> {
    const {client} = this;

    const response = await this.request<ResetPasswordRequest>(
      client,
      {
        request,
        requestMethod: "mutation",
        gql: gql`
          mutation resetPassword($token: String!, $password: String!) {
            resetPassword(token: $token, password: $password) {
              _
            }
          }
        `,
        variables: {
          token: request.token,
          password: request.password,
        },
        headers: this.getHeaders({authToken: request.authToken}),
        context: {},
      },
      options
    );

    if (response.success) return {success: true};

    return {
      success: false,
      error: !response.success && this.isNetworkError(response.rawResponse) ? this.networkError() : this.genericError(),
    };
  }

  static async validateEmail(request: ValidateEmailRequest, options: RequestOptions = {}): Promise<ValidateEmailResponse> {
    const {client} = this;

    const response = await this.request<ValidateEmailRequest>(
      client,
      {
        request,
        requestMethod: "mutation",
        gql: gql`
          mutation validateEmail {
            checkEmail
          }
        `,
        variables: {},
        headers: this.getHeaders({authToken: request.authToken}),
        context: {},
      },
      options
    );

    if (response.success) {
      const {data} = response.rawResponse;

      if (data && typeof data.validateEmail === "boolean" && data.validateEmail) return {success: true};
    }

    return {
      success: false,
      error: !response.success && this.isNetworkError(response.rawResponse) ? this.networkError() : this.genericError(),
    };
  }

  static async fetchMe(request: FetchMeRequest, options: RequestOptions = {}): Promise<FetchMeResponse> {
    const {client} = this;

    const response = await this.request<FetchMeRequest>(
      client,
      {
        request,
        requestMethod: "query",
        gql: gql`
          query me {
            me {
              id
              name
              imageUrl
              email

              createdDate
              modifiedDate
            }
          }
        `,
        variables: {},
        headers: this.getHeaders({authToken: request.authToken}),
        context: {},
      },
      options
    );

    if (response.success) {
      const {data} = response.rawResponse;

      if (data && data.me) return {success: true, user: Models.User.fromJSON(data.me)};
    } else {
      const {graphQLErrors} = response.rawResponse;

      const forbiddenError = graphQLErrors.find(error => error.extensions && error.extensions!.code === "FORBIDDEN");

      if (forbiddenError)
        return {
          success: false,
          error: {
            code: "BAD_USER_INPUT_ERROR",
            message: "Invalid token",
            extra: undefined,
          },
        };
    }

    return {
      success: false,
      error: !response.success && this.isNetworkError(response.rawResponse) ? this.networkError() : this.genericError(),
    };
  }

  static async fetchUser(request: FetchUserRequest, options: RequestOptions = {}): Promise<FetchUserResponse> {
    const {client} = this;

    const response = await this.request<FetchUserRequest>(
      client,
      {
        request,
        requestMethod: "query",
        gql: gql`
          query fetchUser($id: ID!) {
            user(id: $id) {
              id
              name
              imageUrl

              createdDate
              modifiedDate
            }
          }
        `,
        variables: {
          id: request.id,
        },
        headers: this.getHeaders({authToken: request.authToken}),
        context: {},
      },
      options
    );

    if (response.success) {
      const {data} = response.rawResponse;

      if (data && data.user) return {success: true, user: Models.User.fromJSON(data.user)};
    }

    return {
      success: false,
      error: !response.success && this.isNetworkError(response.rawResponse) ? this.networkError() : this.genericError(),
    };
  }

  static async updateUser(request: UpdateUserRequest, options: RequestOptions = {}): Promise<UpdateUserResponse> {
    const {client} = this;

    const response = await this.request<UpdateUserRequest>(
      client,
      {
        request,
        requestMethod: "mutation",
        gql: gql`
          mutation updateUser($id: ID!, $name: String, $image: Upload) {
            updateUser(id: $id, name: $name, upload: $image) {
              id
              name
              imageUrl
              email

              createdDate
              modifiedDate
            }
          }
        `,
        variables: {
          id: request.id,
          name: request.name,
          image: request.image,
        },
        headers: this.getHeaders({authToken: request.authToken}),
        context: {},
      },
      options
    );

    if (response.success) {
      const {data} = response.rawResponse;

      if (data && data.updateUser) return {success: true, user: Models.User.fromJSON(data.updateUser)};
    }

    return {
      success: false,
      error: !response.success && this.isNetworkError(response.rawResponse) ? this.networkError() : this.genericError(),
    };
  }

  static async confirmEmail(request: ConfirmEmailRequest, options: RequestOptions = {}): Promise<ConfirmEmailResponse> {
    const {client} = this;

    const response = await this.request<ConfirmEmailRequest>(
      client,
      {
        request,
        requestMethod: "mutation",
        gql: gql`
          mutation confirmEmail($token: String!) {
            confirmEmail(token: $token) {
              _
            }
          }
        `,
        variables: {
          token: request.token,
        },
        headers: this.getHeaders({authToken: request.authToken}),
        context: {},
      },
      options
    );

    return response.success
      ? {success: true}
      : {
          success: false,
          error: !response.success && this.isNetworkError(response.rawResponse) ? this.networkError() : this.genericError(),
        };
  }

  static async checkEmail(request: CheckEmailRequest, options: RequestOptions = {}): Promise<CheckEmailResponse> {
    const {client} = this;

    const response = await this.request<CheckEmailRequest>(
      client,
      {
        request,
        requestMethod: "mutation",
        gql: gql`
          mutation checkEmail($email: String!) {
            checkEmail(email: $email) {
              isAvailable
              isBlacklisted
              isCorporate
            }
          }
        `,
        variables: {
          email: request.email,
        },
        headers: this.getHeaders({authToken: request.authToken}),
        context: {},
      },
      options
    );

    if (response.success) {
      const {data} = response.rawResponse;

      if (data && data.checkEmail) {
        return {
          success: true,
          ...data.checkEmail,
        };
      }
    }

    return {
      success: false,
      error: !response.success && this.isNetworkError(response.rawResponse) ? this.networkError() : this.genericError(),
    };
  }

  static async fetchChallengeList(request: FetchChallengeListRequest, options: RequestOptions = {}): Promise<FetchChallengeListResponse> {
    const {client} = this;

    const response = await this.request<FetchChallengeListRequest>(
      client,
      {
        request,
        requestMethod: "query",
        gql: gql`
          {
            challenges {
              edges {
                node {
                  id
                  title
                  description
                  imageUrl
                  closeDate
                  endDate
                  privacyMode
                  privacyData

                  createdDate
                  createdBy {
                    id
                    name
                    imageUrl
                  }
                  modifiedDate
                  modifiedBy {
                    id
                    name
                    imageUrl
                  }

                  ideas {
                    totalCount
                    edges {
                      node {
                        id
                        title
                        description
                        imageUrl

                        reactions {
                          totalCount
                        }

                        reactionsSummary {
                          value
                          totalCount
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {},
        headers: this.getHeaders({
          authToken: request.authToken,
        }),
        context: {},
      },
      options
    );

    if (response.success) {
      const {data} = response.rawResponse;

      if (data && data.challenges && Array.isArray(data.challenges.edges))
        return {
          success: true,
          challenges: data.challenges.edges.map((edge: any) => Models.Challenge.fromJSON(edge.node)),
        };
    }

    return {
      success: false,
      error: !response.success && this.isNetworkError(response.rawResponse) ? this.networkError() : this.genericError(),
    };
  }

  static async fetchMyChallenges(request: FetchMyChallengesRequest, options: RequestOptions = {}): Promise<FetchMyChallengesResponse> {
    const {client} = this;

    const response = await this.request<FetchMyChallengesRequest>(
      client,
      {
        request,
        requestMethod: "query",
        gql: gql`
          {
            challenges(createdByMe: true, excludeClosed: false, excludeEnded: false) {
              totalCount
              edges {
                node {
                  id
                  title
                  description
                  imageUrl
                  closeDate
                  endDate
                  privacyMode
                  privacyData

                  createdDate
                  modifiedDate

                  topIdea {
                    id
                    title
                    description
                    imageUrl

                    reactionsSummary {
                      value
                      totalCount
                    }
                  }

                  ideas {
                    totalCount
                    edges {
                      node {
                        id
                        title
                        description
                        imageUrl
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {},
        headers: this.getHeaders({
          authToken: request.authToken,
        }),
        context: {},
      },
      options
    );

    if (response.success) {
      const {data} = response.rawResponse;

      if (data && data.challenges && Array.isArray(data.challenges.edges))
        return {
          success: true,
          challenges: data.challenges.edges.map((edge: any) => Models.Challenge.fromJSON(edge.node)),
          totalCount: data.challenges.totalCount,
        };
    }

    return {
      success: false,
      error: !response.success && this.isNetworkError(response.rawResponse) ? this.networkError() : this.genericError(),
    };
  }

  static async fetchUserChallenges(request: FetchUserChallengesRequest, options: RequestOptions = {}): Promise<FetchUserChallengesResponse> {
    const {client} = this;

    const response = await this.request<FetchUserChallengesRequest>(
      client,
      {
        request,
        requestMethod: "query",
        gql: gql`
          query fetchUserChallenges($userId: String!) {
            challenges(createdById: $userId, excludeClosed: false, excludeEnded: false) {
              totalCount
              edges {
                node {
                  id
                  title
                  description
                  imageUrl
                  closeDate
                  endDate
                  privacyMode
                  privacyData

                  createdDate
                  modifiedDate

                  topIdea {
                    id
                    title
                    description
                    imageUrl

                    reactionsSummary {
                      value
                      totalCount
                    }
                  }

                  ideas {
                    totalCount
                    edges {
                      node {
                        id
                        title
                        description
                        imageUrl
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          userId: request.userId,
        },
        headers: this.getHeaders({
          authToken: request.authToken,
        }),
        context: {},
      },
      options
    );

    if (response.success) {
      const {data} = response.rawResponse;

      if (data && data.challenges && Array.isArray(data.challenges.edges))
        return {
          success: true,
          challenges: data.challenges.edges.map((edge: any) => Models.Challenge.fromJSON(edge.node)),
          totalCount: data.challenges.totalCount,
        };
    }

    return {
      success: false,
      error: !response.success && this.isNetworkError(response.rawResponse) ? this.networkError() : this.genericError(),
    };
  }

  static async fetchChallenge(request: FetchChallengeRequest, options: RequestOptions = {}): Promise<FetchChallengeResponse> {
    const {client} = this;

    const response = await this.request<FetchChallengeRequest>(
      client,
      {
        request,
        requestMethod: "query",
        gql: gql`
          query challenge($id: ID!) {
            challenge(id: $id) {
              id
              title
              description
              imageUrl
              closeDate
              endDate
              privacyMode
              privacyData

              createdDate
              createdBy {
                id
                name
                imageUrl
              }
              modifiedDate
              modifiedBy {
                id
                name
                imageUrl
              }

              reactions {
                totalCount
                edges {
                  node {
                    id
                    objectId
                    value

                    createdDate
                    createdBy {
                      id
                      name
                    }
                  }
                }
              }
              reactionsSummary {
                value
                totalCount
              }

              topIdea {
                id
                title
                description
                imageUrl

                reactionsSummary {
                  value
                  totalCount
                }
              }

              ideas {
                totalCount
                edges {
                  node {
                    id
                    title
                    description
                    imageUrl
                    createdDate
                    createdBy {
                      id
                      name
                      imageUrl
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          id: request.challengeId,
        },
        headers: this.getHeaders({
          authToken: request.authToken,
        }),
        context: {},
      },
      options
    );

    if (response.success) {
      const {data} = response.rawResponse;

      if (data && data.challenge)
        return {
          success: true,
          challenge: Models.Challenge.fromJSON(data.challenge),
        };
    }

    return {
      success: false,
      error: !response.success && this.isNetworkError(response.rawResponse) ? this.networkError() : this.genericError(),
    };
  }

  static async createChallenge(request: CreateChallengeRequest, options: RequestOptions = {}): Promise<CreateChallengeResponse> {
    const {client} = this;
    const {authToken, title, description, closeDate, endDate, image: upload, privacyMode} = request;

    if (closeDate) closeDate.endOf("day");
    if (!_.isNil(endDate)) endDate.endOf("day");

    const response = await this.request<CreateChallengeRequest>(
      client,
      {
        request,
        requestMethod: "mutation",
        gql: gql`
          mutation createChallenge($title: String!, $description: String, $closeDate: DateTime, $endDate: DateTime, $upload: Upload, $privacyMode: ChallengePrivacyMode) {
            createChallenge(title: $title, description: $description, closeDate: $closeDate, endDate: $endDate, upload: $upload, privacyMode: $privacyMode) {
              id
              title
              description
              imageUrl
              closeDate
              endDate
              privacyData
              privacyMode

              createdDate
              createdBy {
                id
                name
                imageUrl
              }
              modifiedDate
              modifiedBy {
                id
                name
                imageUrl
              }

              ideas {
                totalCount
                edges {
                  node {
                    id
                    title
                    description
                    imageUrl

                    reactionsSummary {
                      value
                      totalCount
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          title,
          description,
          closeDate: _.isNil(closeDate) ? undefined : closeDate.toISOString(),
          endDate: _.isNil(endDate) ? undefined : endDate.toISOString(),
          upload,
          privacyMode,
        },
        headers: this.getHeaders({
          authToken,
        }),
        context: {},
      },
      options
    );

    if (response.success) {
      const {data} = response.rawResponse;

      if (data && data.createChallenge)
        return {
          success: true,
          challenge: Models.Challenge.fromJSON(data.createChallenge),
        };
    }

    return {
      success: false,
      error: !response.success && this.isNetworkError(response.rawResponse) ? this.networkError() : this.genericError(),
    };
  }

  static async updateChallenge(request: UpdateChallengeRequest, options: RequestOptions = {}): Promise<UpdateChallengeResponse> {
    const {client} = this;
    const {authToken, id, title, description, closeDate, endDate, image: upload, privacyMode} = request;

    if (closeDate) closeDate.endOf("day");
    if (!_.isNil(endDate)) endDate.endOf("day");

    const response = await this.request<UpdateChallengeRequest>(
      client,
      {
        request,
        requestMethod: "mutation",
        gql: gql`
          mutation updateChallenge($id: ID!, $title: String!, $description: String, $closeDate: DateTime, $endDate: DateTime, $upload: Upload, $privacyMode: ChallengePrivacyMode) {
            updateChallenge(id: $id, title: $title, description: $description, closeDate: $closeDate, endDate: $endDate, upload: $upload, privacyMode: $privacyMode) {
              id
              title
              description
              imageUrl
              closeDate
              endDate
              privacyMode
              privacyData
            }
          }
        `,
        variables: {
          id,
          title,
          description,
          closeDate: _.isNil(closeDate) ? undefined : closeDate.toISOString(),
          endDate: _.isNil(endDate) ? undefined : endDate.toISOString(),
          upload,
          privacyMode,
        },
        headers: this.getHeaders({
          authToken,
        }),
        context: {},
      },
      options
    );

    if (response.success) {
      const {data} = response.rawResponse;

      if (data && data.updateChallenge)
        return {
          success: true,
          challenge: Models.Challenge.fromJSON(data.updateChallenge),
        };
    }

    return {
      success: false,
      error: !response.success && this.isNetworkError(response.rawResponse) ? this.networkError() : this.genericError(),
    };
  }

  static async deleteChallenge(request: DeleteChallengeRequest, options: RequestOptions = {}): Promise<DeleteChallengeResponse> {
    const {client} = this;

    const response = await this.request<DeleteChallengeRequest>(
      client,
      {
        request,
        requestMethod: "mutation",
        gql: gql`
          mutation deleteChallenge($id: ID!) {
            deleteChallenge(id: $id)
          }
        `,
        variables: {
          id: request.id,
        },
        headers: this.getHeaders({
          authToken: request.authToken,
        }),
        context: {},
      },
      options
    );

    if (response.success) {
      const {data} = response.rawResponse;

      if (data && typeof data.deleteChallenge === "boolean" && data.deleteChallenge)
        return {
          success: true,
        };
    }

    return {
      success: false,
      error: !response.success && this.isNetworkError(response.rawResponse) ? this.networkError() : this.genericError(),
    };
  }

  static async fetchChallengeIdeas(request: FetchChallengeIdeasRequest, options: RequestOptions = {}): Promise<FetchChallengeIdeasResponse> {
    const {client} = this;

    const response = await this.request<FetchChallengeIdeasRequest>(
      client,
      {
        request,
        requestMethod: "query",
        gql: gql`
          query fetcChallengeIdeas($challengeId: String!) {
            ideas(challengeId: $challengeId) {
              totalCount
              edges {
                node {
                  id
                  title
                  description
                  imageUrl
                  challenge {
                    id
                    title
                  }

                  reactions {
                    totalCount
                  }

                  reactionsSummary {
                    value
                    totalCount
                  }

                  myReaction {
                    id
                    value
                  }

                  createdDate
                  createdBy {
                    id
                    name
                    imageUrl
                  }
                  modifiedDate
                  modifiedBy {
                    id
                    name
                    imageUrl
                  }
                }
              }
            }
          }
        `,
        variables: {
          challengeId: request.challengeId,
        },
        headers: this.getHeaders({
          authToken: request.authToken,
        }),
        context: {},
      },
      options
    );

    if (response.success) {
      const {data} = response.rawResponse;

      if (data && data.ideas && Array.isArray(data.ideas.edges) && typeof data.ideas.totalCount === "number")
        return {
          success: true,
          ideas: data.ideas.edges.map((e: any) => Models.Idea.fromJSON(e.node)),
          totalCount: data.ideas.totalCount,
        };
    }

    return {
      success: false,
      error: !response.success && this.isNetworkError(response.rawResponse) ? this.networkError() : this.genericError(),
    };
  }

  static async fetchUserIdeas(request: FetchUserIdeasRequest, options: RequestOptions = {}): Promise<FetchUserIdeasResponse> {
    const {client} = this;

    const response = await this.request<FetchUserIdeasRequest>(
      client,
      {
        request,
        requestMethod: "query",
        gql: gql`
          query fetchUserIdeas($userId: String!) {
            ideas(createdById: $userId) {
              totalCount
              edges {
                node {
                  id
                  title
                  description
                  imageUrl

                  challenge {
                    id
                    title
                    closeDate
                  }

                  createdDate
                  modifiedDate

                  reactionsSummary {
                    value
                    totalCount
                  }
                }
              }
            }
          }
        `,
        variables: {
          userId: request.userId,
        },
        headers: this.getHeaders({
          authToken: request.authToken,
        }),
        context: {},
      },
      options
    );

    if (response.success) {
      const {data} = response.rawResponse;

      if (data && data.ideas && Array.isArray(data.ideas.edges) && typeof data.ideas.totalCount === "number")
        return {
          success: true,
          ideas: data.ideas.edges.map((e: any) => Models.Idea.fromJSON(e.node)),
          totalCount: data.ideas.totalCount,
        };
    }

    return {
      success: false,
      error: !response.success && this.isNetworkError(response.rawResponse) ? this.networkError() : this.genericError(),
    };
  }

  static async fetchIdeasWithUserReaction(request: FetchIdeasWithUserReactionRequest, options: RequestOptions = {}): Promise<FetchIdeasWithUserReactionResponse> {
    const {client} = this;

    const response = await this.request<FetchIdeasWithUserReactionRequest>(
      client,
      {
        request,
        requestMethod: "query",
        gql: gql`
          query fetchIdeasWithUserReaction($userId: String!) {
            ideas(withReactionByUserId: $userId) {
              totalCount
              edges {
                node {
                  id
                  title
                  description
                  imageUrl
                  challenge {
                    id
                    title
                    closeDate
                  }

                  reactionsSummary {
                    value
                    totalCount
                  }

                  myReaction {
                    id
                    value
                  }

                  createdDate
                  modifiedDate
                  modifiedBy {
                    id
                    name
                    imageUrl
                  }
                }
              }
            }
          }
        `,
        variables: {
          userId: request.userId,
        },
        headers: this.getHeaders({
          authToken: request.authToken,
        }),
        context: {},
      },
      options
    );

    if (response.success) {
      const {data} = response.rawResponse;

      if (data && data.ideas && Array.isArray(data.ideas.edges) && typeof data.ideas.totalCount === "number")
        return {
          success: true,
          ideas: data.ideas.edges.map((e: any) => Models.Idea.fromJSON(e.node)),
          totalCount: data.ideas.totalCount,
        };
    }

    return {
      success: false,
      error: !response.success && this.isNetworkError(response.rawResponse) ? this.networkError() : this.genericError(),
    };
  }

  static async fetchMyIdeas(request: FetchMyIdeasRequest, options: RequestOptions = {}): Promise<FetchMyIdeasResponse> {
    const {client} = this;

    const response = await this.request<FetchMyIdeasRequest>(
      client,
      {
        request,
        requestMethod: "query",
        gql: gql`
          {
            ideas(createdByMe: true) {
              totalCount
              edges {
                node {
                  id
                  title
                  description
                  imageUrl

                  challenge {
                    id
                    title
                    closeDate
                  }

                  reactionsSummary {
                    value
                    totalCount
                  }

                  createdDate
                  modifiedDate
                  modifiedBy {
                    id
                    name
                    imageUrl
                  }
                }
              }
            }
          }
        `,
        variables: {},
        headers: this.getHeaders({
          authToken: request.authToken,
        }),
        context: {},
      },
      options
    );

    if (response.success) {
      const {data} = response.rawResponse;

      if (data && data.ideas && Array.isArray(data.ideas.edges) && typeof data.ideas.totalCount === "number")
        return {
          success: true,
          ideas: data.ideas.edges.map((e: any) => Models.Idea.fromJSON(e.node)),
          totalCount: data.ideas.totalCount,
        };
    }

    return {
      success: false,
      error: !response.success && this.isNetworkError(response.rawResponse) ? this.networkError() : this.genericError(),
    };
  }

  static async fetchIdea(request: FetchIdeaRequest, options: RequestOptions = {}): Promise<FetchIdeaResponse> {
    const {client} = this;

    const response = await this.request<FetchIdeaRequest>(
      client,
      {
        request,
        requestMethod: "query",
        gql: gql`
          query idea($id: ID!) {
            idea(id: $id) {
              id
              title
              description
              imageUrl

              myReaction {
                id
                value
              }

              reactions {
                totalCount
                edges {
                  node {
                    id
                    value

                    createdDate
                    createdBy {
                      id
                      name
                    }
                  }
                }
              }
              reactionsSummary {
                value
                totalCount
              }

              challenge {
                id
                title
                closeDate
              }

              createdBy {
                id
                name
                imageUrl
              }
              createdDate
            }
          }
        `,
        variables: {
          id: request.id,
        },
        headers: this.getHeaders({
          authToken: request.authToken,
        }),
        context: {},
      },
      options
    );

    if (response.success) {
      const {data} = response.rawResponse;

      if (data && data.idea)
        return {
          success: true,
          idea: Models.Idea.fromJSON(data.idea),
        };
    }

    return {
      success: false,
      error: !response.success && this.isNetworkError(response.rawResponse) ? this.networkError() : this.genericError(),
    };
  }

  static async createIdea(request: CreateIdeaRequest, options: RequestOptions = {}): Promise<CreateIdeaResponse> {
    const {client} = this;

    const response = await this.request<CreateIdeaRequest>(
      client,
      {
        request,
        requestMethod: "mutation",
        gql: gql`
          mutation createIdea($challengeId: String!, $title: String!, $description: String, $upload: Upload) {
            createIdea(challengeId: $challengeId, title: $title, description: $description, upload: $upload) {
              id
              title
              description
              imageUrl

              challenge {
                id
                closeDate
              }

              createdBy {
                id
                name
                imageUrl
              }
            }
          }
        `,
        variables: {
          challengeId: request.challengeId,
          title: request.title,
          description: request.description,
          upload: request.image,
        },
        headers: this.getHeaders({
          authToken: request.authToken,
        }),
        context: {},
      },
      options
    );

    if (response.success) {
      const {data} = response.rawResponse;

      if (data && data.createIdea)
        return {
          success: true,
          idea: Models.Idea.fromJSON(data.createIdea),
        };
    }

    return {
      success: false,
      error: !response.success && this.isNetworkError(response.rawResponse) ? this.networkError() : this.genericError(),
    };
  }

  static async updateIdea(request: UpdateIdeaRequest, options: RequestOptions = {}): Promise<UpdateIdeaResponse> {
    const {client} = this;

    const response = await this.request<UpdateIdeaRequest>(
      client,
      {
        request,
        requestMethod: "mutation",
        gql: gql`
          mutation updateIdea($id: ID!, $title: String!, $description: String, $upload: Upload) {
            updateIdea(id: $id, title: $title, description: $description, upload: $upload) {
              id
              title
              description
              imageUrl
            }
          }
        `,
        variables: {
          id: request.id,
          title: request.title,
          description: request.description,
          upload: request.image,
        },
        headers: this.getHeaders({
          authToken: request.authToken,
        }),
        context: {},
      },
      options
    );

    if (response.success) {
      const {data} = response.rawResponse;

      if (data && data.updateIdea)
        return {
          success: true,
          idea: Models.Idea.fromJSON(data.updateIdea),
        };
    }

    return {
      success: false,
      error: !response.success && this.isNetworkError(response.rawResponse) ? this.networkError() : this.genericError(),
    };
  }

  static async deleteIdea(request: DeleteIdeaRequest, options: RequestOptions = {}): Promise<DeleteIdeaResponse> {
    const {client} = this;

    const response = await this.request<DeleteIdeaRequest>(
      client,
      {
        request,
        requestMethod: "mutation",
        gql: gql`
          mutation deleteIdea($id: ID!) {
            deleteIdea(id: $id)
          }
        `,
        variables: {
          id: request.id,
        },
        headers: this.getHeaders({
          authToken: request.authToken,
        }),
        context: {},
      },
      options
    );

    if (response.success) {
      const {data} = response.rawResponse;

      if (data && data.deleteIdea)
        return {
          success: true,
        };
    }

    return {
      success: false,
      error: !response.success && this.isNetworkError(response.rawResponse) ? this.networkError() : this.genericError(),
    };
  }

  static async createIdeaReaction(request: CreateIdeaReactionRequest, options: RequestOptions = {}): Promise<CreateIdeaReactionResponse> {
    const {client} = this;

    const response = await this.request<CreateIdeaReactionRequest>(
      client,
      {
        request,
        requestMethod: "mutation",
        gql: gql`
          mutation createReaction($ideaId: ID!) {
            createReaction(objectType: IDEA, objectId: $ideaId, value: "LIKE") {
              id
              value
            }
          }
        `,
        variables: {
          ideaId: request.ideaId,
        },
        headers: this.getHeaders({
          authToken: request.authToken,
        }),
        context: {},
      },
      options
    );

    if (response.success) {
      const {data} = response.rawResponse;

      if (data && data.createReaction)
        return {
          success: true,
          reaction: Models.Reaction.fromJSON(data.createReaction),
        };
    }

    return {
      success: false,
      error: !response.success && this.isNetworkError(response.rawResponse) ? this.networkError() : this.genericError(),
    };
  }

  static async deleteIdeaReaction(request: DeleteIdeaReactionRequest, options: RequestOptions = {}): Promise<DeleteIdeaReactionResponse> {
    const {client} = this;

    const response = await this.request<DeleteIdeaReactionRequest>(
      client,
      {
        request,
        requestMethod: "mutation",
        gql: gql`
          mutation deleteReaction($id: ID!) {
            deleteReaction(objectType: IDEA, id: $id)
          }
        `,
        variables: {
          id: request.id,
        },
        headers: this.getHeaders({
          authToken: request.authToken,
        }),
        context: {},
      },
      options
    );

    if (response.success) {
      const {data} = response.rawResponse;

      if (data && data.deleteReaction)
        return {
          success: true,
        };
    }

    return {
      success: false,
      error: !response.success && this.isNetworkError(response.rawResponse) ? this.networkError() : this.genericError(),
    };
  }
}

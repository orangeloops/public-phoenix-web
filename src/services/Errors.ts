// TODO interface => types

export type GenericError = {
  code: "GENERIC_ERROR";
  message: string;
};

export type NetworkError = {
  code: "NETWORK_ERROR";
  message: string;
};

export interface BadUserInputError<T = undefined> {
  code: "BAD_USER_INPUT_ERROR";
  message: string;
  extra: T;
}

export interface ObjectNotFoundError {
  code: "OBJECT_NOT_FOUND_ERROR";
  message?: string;
}

export type PendingAccountError = {
  code: "PENDING_ACCOUNT_ERROR";
  message: string;
};

export interface UserNotAuthenticatedError {
  code: "USER_NOT_AUTHENTICATED_ERROR";
  message: string;
}

export interface ValidationError<T = string> {
  code: "VALIDATION_ERROR";
  field: T;
  message: string;
}

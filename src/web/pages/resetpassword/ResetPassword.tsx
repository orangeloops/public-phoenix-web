import {observer} from "mobx-react";
import * as queryString from "query-string";
import * as React from "react";
import {RouteComponentProps} from "react-router";
import {Helper} from "../../../services";
import {BaseComponent} from "../../BaseComponent";
import {boundMethod} from "autobind-decorator";

export interface ResetPasswordProps extends RouteComponentProps {}

export interface ResetPasswordState {
  password: string;
  confirmPassword: string;
}

@observer
export class ResetPassword extends BaseComponent<ResetPasswordProps, ResetPasswordState> {
  private token: string;

  state: ResetPasswordState = {
    password: "",
    confirmPassword: "",
  };

  componentDidMount() {
    const {history, location} = this.props;
    const {userState} = this.store;

    const queryParams = queryString.parse(location.search);
    const {token} = queryParams;

    if (userState.isAuthenticated || token === undefined) {
      history.push("/home");
      return;
    }

    this.token = Helper.isArray(token) ? token.join("") : (token! as string);
  }

  @boundMethod
  private handlePasswordChange({target}: React.ChangeEvent<HTMLInputElement>) {
    this.setState({password: target.value});
  }

  @boundMethod
  private handleConfirmPasswordChange({target}: React.ChangeEvent<HTMLInputElement>) {
    this.setState({confirmPassword: target.value});
  }

  @boundMethod
  private async handleSubmit() {
    let {password, confirmPassword} = this.state;
    const {token} = this;
    const {userState} = this.store;
    const {resetPasswordStatus} = userState;

    password = password.trim();
    confirmPassword = confirmPassword.trim();

    if (resetPasswordStatus.isLoading) return;

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    } else if (password.length === 0) {
      alert("Password field cannot be empty.");
      return;
    }

    const response = await userState.resetPassword({token, password});

    if (!response.success) alert("There was a problem trying to reset your password. Please try again.");
  }

  @boundMethod
  private handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    this.handleSubmit();
  }

  render() {
    const {success, isLoading} = this.store.userState.resetPasswordStatus;

    return (
      <div className="ph-reset-password">
        <div className="ph-reset-password-content">
          <div className="ph-reset-password-image-wrapper">
            <div className="ph-reset-password-image" />
          </div>

          <div className="ph-reset-password-data">
            <div className="ph-reset-password-data-content">
              {success ? (
                <div>The password has been reset correctly</div>
              ) : (
                <>
                  <div className="ph-reset-password-title">Reset password</div>
                  <div className="ph-reset-password-subtitle">Enter your new password.</div>

                  <form className="ph-login-form" onSubmit={this.handleFormSubmit}>
                    <input className="ph-login-input" type="password" placeholder="Password" onChange={this.handlePasswordChange} />
                    <input className="ph-login-input" type="password" placeholder="Confirm password" onChange={this.handleConfirmPasswordChange} />

                    <button disabled={isLoading} className="ph-reset-password-button" type="submit">
                      RESET
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

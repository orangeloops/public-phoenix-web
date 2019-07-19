import {observer} from "mobx-react";
import * as React from "react";
import {RouteComponentProps} from "react-router";
import {BaseComponent} from "../../BaseComponent";
import * as _ from "lodash";
import {boundMethod} from "autobind-decorator";

export interface ForgotPasswordProps extends RouteComponentProps {}

export interface ForgotPasswordState {
  email: string;
}

@observer
export class ForgotPassword extends BaseComponent<ForgotPasswordProps, ForgotPasswordState> {
  @boundMethod
  private handleEmailChange({target}: React.ChangeEvent<HTMLInputElement>) {
    this.setState({email: target.value});
  }

  @boundMethod
  private async handleSubmit() {
    const {email} = this.state;
    const {userState} = this.store;
    const {requestResetPasswordStatus} = userState;

    if (requestResetPasswordStatus.isLoading) return;
    if (_.isNil(email)) {
      alert("Email field is empty");
    } else {
      const response = await userState.requestResetPassword({email});

      if (!response.success) alert("There was a problem trying to reset your password. Please try again.");
    }
  }

  @boundMethod
  private handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    this.handleSubmit();
  }

  render() {
    const {success, isLoading} = this.store.userState.requestResetPasswordStatus;

    return (
      <div className="ph-reset-password">
        <div className="ph-reset-password-content">
          <div className="ph-reset-password-image-wrapper">
            <div className="ph-reset-password-image" />
          </div>

          <div className="ph-reset-password-data">
            <div className="ph-reset-password-data-content">
              {success ? (
                <div>Please check your email. If the address you sent is correct you'll be receiving an email with instructions to follow.</div>
              ) : (
                <>
                  <div className="ph-reset-password-title">Reset Password</div>
                  <div className="ph-reset-password-subtitle">Write your email and we'll send the instruction to reset your password.</div>

                  <form className="ph-login-form" onSubmit={this.handleFormSubmit}>
                    <input className="ph-login-input" type="text" placeholder="Email" onChange={this.handleEmailChange} />

                    <button disabled={isLoading} className="ph-reset-password-button" type="submit">
                      RESET PASSWORD
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

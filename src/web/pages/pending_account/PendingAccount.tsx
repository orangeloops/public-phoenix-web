import * as React from "react";
import {Header} from "../../components/header/Header";
import {RouteComponentProps} from "react-router";
import {BaseComponent} from "../../BaseComponent";
import * as _ from "lodash";
import * as queryString from "query-string";
import {boundMethod} from "autobind-decorator";

export interface PendingAccountProps extends RouteComponentProps<{}> {}

export interface PendingAccountState {
  sendingEmail?: boolean;
}

export class PendingAccount extends BaseComponent<PendingAccountProps, PendingAccountState> {
  componentDidMount() {
    const {location, history} = this.props;

    if (_.isNil(location.state)) history.replace("/home");
  }

  @boundMethod
  private handleHomeRequired() {
    this.props.history.push("home");
  }

  @boundMethod
  private resendConfirmationEmail() {
    const {userState} = this.store;
    const {history, location} = this.props;

    const queryParams = queryString.parse(location.search);
    const {email} = queryParams;

    if (_.isNil(email)) history.push("home");

    this.setState({sendingEmail: true});

    userState.resendEmailConfirmation({email: email!.toString()}).then(response => {
      this.setState({sendingEmail: false});

      if (!response.success) {
        alert("There was a problem trying to resend the email");
      }
    });
  }

  render() {
    const {history, location, match} = this.props;
    const {sendingEmail} = this.state;
    const {userState} = this.store;

    return (
      <div className="ph-validate">
        <Header history={history} location={location} match={match} />
        <div className="ph-validate-content">
          <div className="ph-validate-image-wrapper">
            <div className="ph-validate-image" />
          </div>
          <div className="ph-validate-data">
            <div className="ph-validate-data-content">
              <div className="ph-validate-title">Activate your account</div>
              <div className="ph-validate-message">You have not activated your account yet. To do so, please find the email we sent to your email account and follow the steps.</div>
              <div className="ph-validate-button" onClick={() => this.handleHomeRequired()}>
                GO TO HOME
              </div>
              <div className="ph-validate-resend-email" onClick={this.resendConfirmationEmail}>
                <button className="ph-link" disabled={userState.resendEmailConfirmationStatus.isLoading} onClick={this.resendConfirmationEmail}>
                  {sendingEmail ? "RESENDING EMAIL..." : "RESEND EMAIL"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

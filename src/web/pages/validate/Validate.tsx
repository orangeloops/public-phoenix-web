import * as React from "react";
import {observer} from "mobx-react";
import {RouteComponentProps} from "react-router";
import {BaseComponent} from "../../BaseComponent";
import * as _ from "lodash";
import {boundMethod} from "autobind-decorator";

export interface ValidateProps extends RouteComponentProps<{}> {}

export interface ValidateState {
  email: string;
  password: string;
  sendingEmail?: boolean;
}

@observer
export class Validate extends BaseComponent<ValidateProps, ValidateState> {
  constructor(props: ValidateProps) {
    super(props);

    this.state = {
      email: "",
      password: "",
    };
  }

  componentDidMount() {
    const {location, history} = this.props;

    if (_.isNil(location.state) || _.isNil(location.state.email)) {
      history.push("/login");
    } else {
      this.setState({
        email: location.state.email,
        password: location.state.password,
      });
    }
  }

  @boundMethod
  private handleHomeRequired() {
    this.props.history.push("home");
  }

  @boundMethod
  private resendConfirmationEmail() {
    const {userState} = this.store;
    const {email} = this.state;

    this.setState({sendingEmail: true});

    userState.resendEmailConfirmation({email}).then(response => {
      this.setState({sendingEmail: false});

      if (!response.success) {
        alert("There was a problem trying to resend the email");
      }
    });
  }

  render() {
    const {email, sendingEmail} = this.state;
    const {userState} = this.store;

    return (
      <div className="ph-validate">
        <div className="ph-validate-content">
          <div className="ph-validate-image-wrapper">
            <div className="ph-validate-image" />
          </div>
          <div className="ph-validate-data">
            <div className="ph-validate-data-content">
              <div className="ph-validate-title">Confirm your email address</div>
              <div className="ph-validate-message">
                We sent a confirmation email to:
                <span className="ph-validate-email">{email}</span>
                Check your email and click on the confirmation link to continue.
              </div>
              <div className="ph-validate-button" onClick={this.handleHomeRequired}>
                GO TO HOME
              </div>
              <div className="ph-validate-resend-email">
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

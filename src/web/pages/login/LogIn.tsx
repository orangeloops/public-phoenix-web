import * as _ from "lodash";
import * as React from "react";
import {observer} from "mobx-react";
import {NavLink, RouteComponentProps} from "react-router-dom";
import {BaseComponent} from "../../BaseComponent";
import {Helper} from "../../../services";
import {boundMethod} from "autobind-decorator";

interface InputData {
  email: string;
  password: string;
}

export interface LogInProps extends RouteComponentProps<{}> {}

export interface LogInState {
  email: string;
  password: string;
}

@observer
export class LogIn extends BaseComponent<LogInProps, LogInState> {
  state = {
    email: "",
    password: "",
  };

  componentDidMount() {
    const {history} = this.props;
    const {isAuthenticated} = this.store.userState;

    if (isAuthenticated) history.push("/home");
  }

  @boundMethod
  private enterPressed(event: any) {
    const code = event.keyCode || event.which;

    if (code === 13) {
      this.handleLogIn();
    }
  }

  @boundMethod
  private handleEmailChange(value: string) {
    this.setState({email: value.trim()});
  }

  @boundMethod
  private handlePasswordChange(value: string) {
    this.setState({password: value});
  }

  @boundMethod
  private handleLogIn() {
    const {userState} = this.store;
    const {email, password} = this.state;

    const userInput: InputData = {
      email,
      password,
    };

    switch (this.validateData(userInput)) {
      case 0:
        userState.signIn({email, password}).then(response => {
          if (response.success && !_.isNil(response.apiResponse)) {
            localStorage.setItem("token", response.apiResponse.authToken!);
            if (response.apiResponse.refreshToken) this.appStore.setRefreshToken(response.apiResponse.refreshToken);
            userState.fetchMe().then(() => this.props.history.push("home"));
          } else if (!_.isNil(response.errors)) {
            if (!Helper.isArray(response.errors) && response.errors.code === "PENDING_ACCOUNT_ERROR") {
              this.props.history.push(`pending?email=${email}`, {});
            } else {
              const errorMessage = !_.isNil((response.errors as any).message) ? (response.errors as any).message : "An error has occurred";
              alert(errorMessage);
            }
          } else {
            alert("An error has occurred");
          }
        });
        break;
      case 1:
        alert("All fields are required");
        break;
      case 2:
        alert("You have entered an invalid email address");
        break;
      default:
        break;
    }
  }

  @boundMethod
  private validateEmail(inputText: string): number {
    const mailFormat = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

    if (inputText.match(mailFormat)) {
      return 0;
    } else {
      return 2;
    }
  }

  @boundMethod
  private validateData(userInput: InputData): number {
    if (userInput.email === "" || userInput.password === "") {
      return 1;
    }

    return this.validateEmail(userInput.email);
  }

  render() {
    const {signInStatus} = this.store.userState;

    return (
      <div className="ph-login">
        <div className="ph-login-content">
          <div className="ph-login-image-wrapper">
            <div className="ph-login-image" />
          </div>
          <div className="ph-login-data">
            <div className="ph-login-data-content">
              <div className="ph-login-divider">
                <div className="ph-login-divider-line" />
                <span>or</span>
                <div className="ph-login-divider-line" />
              </div>
              <div className="ph-login-form">
                <input className="ph-login-input" type="text" placeholder="Email" onChange={event => this.handleEmailChange(event.target.value)} onKeyPress={this.enterPressed} />
                <input className="ph-login-input" type="password" placeholder="Password" onChange={event => this.handlePasswordChange(event.target.value)} onKeyPress={this.enterPressed} />
                <button className="ph-login-button" disabled={!_.isNil(signInStatus) && signInStatus.isLoading} onClick={this.handleLogIn}>
                  LOG IN
                </button>
              </div>
              <div className="ph-login-forgot-password">
                <NavLink className="ph-link" to="/forgotPassword">
                  FORGOT PASSWORD?
                </NavLink>
              </div>

              <div className="ph-login-no-account">
                <span>DON'T HAVE AN ACCOUNT?</span>{" "}
                <NavLink className="ph-link" to="/signup">
                  SIGN UP!
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

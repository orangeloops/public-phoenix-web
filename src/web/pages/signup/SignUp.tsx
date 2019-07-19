import * as _ from "lodash";
import * as React from "react";
import {FormEvent} from "react";
import {NavLink, RouteComponentProps} from "react-router-dom";
import {observer} from "mobx-react";
import classNames from "classnames";
import {BaseComponent} from "../../BaseComponent";
import {Helper} from "../../../services";
import {boundMethod} from "autobind-decorator";

interface InputData {
  userName: string;
  email: string;
  password: string;
  confirmedPassword: string;
}

export interface SignUpProps extends RouteComponentProps<{}> {}

export interface SignUpState {
  userName: string;
  email: string;
  password: string;
  confirmedPassword: string;
  isEmailAvailable: boolean;
}

@observer
export class SignUp extends BaseComponent<SignUpProps, SignUpState> {
  state = {
    userName: "",
    email: "",
    password: "",
    confirmedPassword: "",
    isEmailAvailable: true,
  };

  componentDidMount() {
    const {history} = this.props;
    const {isAuthenticated} = this.store.userState;

    if (isAuthenticated) history.push("/home");
  }

  @boundMethod
  private handleUserNameChange(value: string) {
    this.setState({userName: value.trim()});
  }

  @boundMethod
  private handleEmailChange(value: string) {
    this.setState({isEmailAvailable: true, email: value.trim()});
  }

  @boundMethod
  private handlePasswordChange(value: string) {
    this.setState({password: value});
  }

  @boundMethod
  private handleConfirmedPasswordChange(value: string) {
    this.setState({confirmedPassword: value});
  }

  @boundMethod
  private checkEmail() {
    const {userState} = this.store;
    const {email} = this.state;

    userState.checkEmail({email}).then(response => this.setState({isEmailAvailable: response.isAvailable === true}));
  }

  @boundMethod
  private handleSignUp(event: FormEvent) {
    event.preventDefault();

    const {userState} = this.store;
    const {userName, email, password, confirmedPassword} = this.state;

    const userInput: InputData = {
      userName,
      email,
      password,
      confirmedPassword,
    };

    switch (this.validateData(userInput)) {
      case 0:
        userState.signUp({name: userName, email, password}).then(response => {
          if (response.success) {
            this.props.history.push({pathname: "/validate", state: {email, password}});
          } else if (Helper.isArray(response.errors)) alert(response.errors[0].message);
          else alert(response.errors!.message);
        });
        break;
      case 1:
        alert("All fields are required");
        break;
      case 2:
        alert("You have entered an invalid email address!");
        break;
      case 3:
        alert("Passwords fields does not match");
        break;
      default:
        break;
    }
  }

  @boundMethod
  private validateEmail(inputText: string): number {
    const mailFormat = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

    if (inputText.trim().match(mailFormat)) {
      return 0;
    } else {
      return 2;
    }
  }

  @boundMethod
  private validateData(userInput: InputData): number {
    if (userInput.userName === "" || userInput.email === "" || userInput.password === "" || userInput.confirmedPassword === "") {
      return 1;
    }

    if (userInput.password !== userInput.confirmedPassword) {
      return 3;
    }

    return this.validateEmail(userInput.email);
  }

  render() {
    const {signUpStatus} = this.store.userState;
    const {isEmailAvailable} = this.state;

    return (
      <div className="ph-signup">
        <div className="ph-signup-content">
          <div className="ph-signup-image-wrapper">
            <div className="ph-signup-image" />
          </div>
          <div className="ph-signup-data">
            <form className="ph-signup-form" onSubmit={this.handleSignUp}>
              <input required className="ph-signup-input" type="text" placeholder="Name" maxLength={30} onChange={event => this.handleUserNameChange(event.target.value)} />
              <input required className={classNames("ph-signup-input", isEmailAvailable ? "" : "without-margin")} type="email" placeholder="Email" onBlur={this.checkEmail} onChange={event => this.handleEmailChange(event.target.value)} />
              <div style={isEmailAvailable ? {display: "none"} : {color: "red", marginBottom: "0"}}>This email is already registered</div>
              <input required className="ph-signup-input password" type="password" placeholder="Password" onChange={event => this.handlePasswordChange(event.target.value)} />
              <input required className="ph-signup-input" type="password" placeholder="Confirm Password" onChange={event => this.handleConfirmedPasswordChange(event.target.value)} />
              <button className="ph-signup-button" disabled={!_.isNil(signUpStatus) && signUpStatus.isLoading} type="submit">
                SIGN UP
              </button>
              <div className="ph-signup-no-account">
                <span>DO YOU HAVE AN ACCOUNT?</span>
                <NavLink className="ph-link" to="/login">
                  LOG IN!
                </NavLink>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

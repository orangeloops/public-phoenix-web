import * as React from "react";
import * as _ from "lodash";
import {Redirect, Route, Switch} from "react-router-dom";
import "../assets/stylesheets/main.scss";

import {BaseComponent} from "./BaseComponent";
import {Challenge} from "./pages/challenge/Challenge";
import {ConfirmEmail} from "./pages/confirmemail/ConfirmEmail";
import {Home} from "./pages/home/Home";
import {LogIn} from "./pages/login/LogIn";
import {Profile} from "./pages/profile/Profile";
import {ResetPassword} from "./pages/resetpassword/ResetPassword";
import {SignUp} from "./pages/signup/SignUp";
import {Validate} from "./pages/validate/Validate";
import {PendingAccount} from "./pages/pending_account/PendingAccount";
import {Header} from "./components/header/Header";
import {ForgotPassword} from "./pages/forgotpassword/ForgotPassword";
import {autorun} from "mobx";

class App extends BaseComponent {
  state = {
    isLoading: true,
  };

  async componentDidMount() {
    const {userState} = this.store;
    const token = this.appStore.getToken();
    const refreshToken = this.appStore.getRefreshToken();

    if (!_.isNil(token)) await userState.testToken({token, refreshToken});

    this.setState({
      isLoading: false,
    });

    autorun(() => this.handleTokensChange());
  }

  private handleTokensChange() {
    const {store, appStore} = this;
    const {authToken, refreshToken} = store.userState;

    if (authToken) appStore.setToken(authToken);
    else appStore.deleteToken();

    if (refreshToken) appStore.setRefreshToken(refreshToken);
    else appStore.deleteRefreshToken();
  }

  render() {
    const {isLoading} = this.state;

    return (
      <div className="app-container">
        <Route component={Header} />
        {!isLoading && (
          <Switch>
            <Route path="/login" component={LogIn} />
            <Route path="/signup" component={SignUp} />
            <Route path="/validate" component={Validate} />
            <Route path="/pending" component={PendingAccount} />
            <Route path="/home" component={Home} />
            <Route path="/profile" component={Profile} />
            <Route path="/challenge" component={Challenge} />
            <Route path="/confirmEmail" component={ConfirmEmail} />
            <Route path="/resetPassword" component={ResetPassword} />
            <Route path="/forgotPassword" component={ForgotPassword} />
            <Redirect path="/" to={"/home"} />
          </Switch>
        )}
      </div>
    );
  }
}

export default App;

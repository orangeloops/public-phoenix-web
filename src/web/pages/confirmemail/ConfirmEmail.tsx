import {Icon} from "antd";
import {observer} from "mobx-react";
import * as React from "react";
import {RouteComponentProps} from "react-router";
import {Helper} from "../../../services";
import {BaseComponent} from "../../BaseComponent";
import {Header} from "../../components/header/Header";
import * as queryString from "query-string";

export interface ConfirmEmailProps extends RouteComponentProps {}

@observer
export class ConfirmEmail extends BaseComponent<ConfirmEmailProps> {
  componentDidMount() {
    const {history, location} = this.props;
    const {userState} = this.store;

    const queryParams = queryString.parse(location.search);
    const {token} = queryParams;

    if (userState.isAuthenticated || token === undefined) {
      history.push("/home");
      return;
    }

    userState.confirmEmail({token: Helper.isArray(token) ? token.join("") : (token! as string)});
  }

  render() {
    const {history, location, match} = this.props;
    const {confirmEmailStatus} = this.store.userState;

    confirmEmailStatus.success = true;

    if (!confirmEmailStatus.isLoading && confirmEmailStatus.success === undefined) return null;

    const title = confirmEmailStatus.isLoading ? "Activating" : confirmEmailStatus.success ? "Account successfully activated" : "Error activating account";
    const content = confirmEmailStatus.isLoading ? (
      <Icon className="ph-confirm-email-load-icon" type="loading" />
    ) : confirmEmailStatus.success ? (
      "Congratulations! You've successfully activated your account. Now you can log in by using our Log In button in the upper right corner."
    ) : (
      "We could not activate your account. Please try again."
    );

    return (
      <div className="ph-confirm-email">
        <Header history={history} location={location} match={match} />

        <div className="ph-confirm-email-content">
          <div className="ph-confirm-email-image-wrapper">
            <div className="ph-confirm-email-image" />
          </div>

          <div className="ph-confirm-email-data">
            <div className="ph-confirm-email-data-container">
              <div className="ph-confirm-email-data-title">{title}</div>
              <div className="ph-confirm-email-data-content">{content}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

import * as React from "react";
import {Dropdown, Icon, Menu} from "antd";
import {observer} from "mobx-react";
import * as _ from "lodash";
import classNames from "classnames";
import {AboutModal} from "../about_modal/AboutModal";
import {NavLink, RouteComponentProps} from "react-router-dom";
import {BaseComponent} from "../../BaseComponent";
import {boundMethod} from "autobind-decorator";

export interface HeaderProps extends RouteComponentProps<{}> {}

export interface HeaderState {
  account: string;
  showAbout: boolean;
}

@observer
export class Header extends BaseComponent<HeaderProps, HeaderState> {
  state = {
    account: "",
    showAbout: false,
  };

  @boundMethod
  private handleRouteProfile() {
    this.props.history.push("/profile", undefined);
  }

  @boundMethod
  private handleRouteHome() {
    this.props.history.push("/home");
  }

  @boundMethod
  private handleLogout() {
    this.appStore.logOut();
    this.props.history.push("/login");
  }

  @boundMethod
  private handleCloseAbout() {
    this.setState({showAbout: false});
  }

  @boundMethod
  private handleOpenAbout() {
    this.setState({showAbout: true});
  }

  render() {
    const {currentUser} = this.store.userState;
    const {showAbout} = this.state;

    const menu = (
      <Menu>
        {!currentUser && (
          <Menu.Item key="SignIn">
            <NavLink to="/login">Sign in</NavLink>
          </Menu.Item>
        )}
        {!currentUser && <Menu.Divider />}

        {!currentUser && (
          <Menu.Item key="SignUp">
            <NavLink to="/signup">Sign up</NavLink>
          </Menu.Item>
        )}
        {!currentUser && <Menu.Divider />}

        {currentUser && (
          <Menu.Item key="Profile">
            <a onClick={this.handleRouteProfile}>Profile</a>
          </Menu.Item>
        )}
        {currentUser && <Menu.Divider />}

        <Menu.Item key="About" onClick={this.handleOpenAbout}>
          About
        </Menu.Item>

        {currentUser && <Menu.Divider />}

        {currentUser && (
          <Menu.Item key="SignOut" onClick={this.handleLogout}>
            Log out
          </Menu.Item>
        )}
      </Menu>
    );

    return (
      <div className="ph-header">
        <div className="ph-header-logo" onClick={this.handleRouteHome} />

        <div className="ph-header-content-wrapper">
          <div className="ph-header-divider" />
          <Dropdown overlay={menu} trigger={["click"]}>
            <div className="ph-header-content">
              <div className={classNames("ph-header-login", {authenticated: currentUser})}>{!_.isNil(currentUser) ? currentUser.name : <Icon className="ph-header-more-icon" type="more" />}</div>
              <div className="ph-header-avatar" style={_.isNil(currentUser) ? {display: "none"} : {}}>
                <img src={!_.isNil(currentUser) ? currentUser.imageUrl : ""} />
              </div>
            </div>
          </Dropdown>
        </div>

        {showAbout && <AboutModal onClose={this.handleCloseAbout} />}
      </div>
    );
  }
}

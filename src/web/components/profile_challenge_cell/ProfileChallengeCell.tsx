import * as React from "react";
import * as _ from "lodash";
import {Dropdown, Menu, Modal} from "antd";
import {CreateChallenge} from "../create_challenge/CreateChallenge";
import {observer} from "mobx-react";
import {RouteComponentProps} from "react-router";
import {Models} from "../../../services";
import {BaseComponent} from "../../BaseComponent";
import {boundMethod} from "autobind-decorator";

export interface ChallengeProfilePreviewProps extends RouteComponentProps<{}> {
  challenge: Models.Challenge;
  myProfile: boolean;
}

export interface ChallengeProfilePreviewState {
  modalVisibility: boolean;
  isUserLoggedIn: boolean;
  challenge?: Models.Challenge;
  isLoading: boolean;
}

@observer
export class ProfileChallengeCell extends BaseComponent<ChallengeProfilePreviewProps, ChallengeProfilePreviewState> {
  state = {
    modalVisibility: false,
    isUserLoggedIn: false,
    challenge: undefined,
    isLoading: false,
  };

  componentDidMount() {
    const {userState} = this.store;
    const {challenge} = this.props;

    this.setState({
      isUserLoggedIn: !_.isNil(userState.currentUser),
      challenge: challenge,
    });
  }

  @boundMethod
  private handleCancel() {
    this.setState({
      modalVisibility: false,
    });
  }

  @boundMethod
  private handleSuccess() {
    this.setState({
      modalVisibility: false,
    });
  }

  @boundMethod
  private onChallengeClick() {
    const {challenge} = this.props;

    if (challenge) {
      this.props.history.push({pathname: "/challenge", state: {challengeId: challenge.id}});
    }
  }

  @boundMethod
  private onEditChallenge() {
    if (this.state.isUserLoggedIn) {
      this.setState({
        modalVisibility: true,
      });
    } else {
      this.props.history.push("login");
    }
  }

  @boundMethod
  private onDeleteChallenge() {
    const {challengeState, userState} = this.store;
    const {challenge} = this.props;

    if (userState.isAuthenticated && this.userConfirmedDeletion()) {
      challengeState.deleteChallenge({challenge}).then(response => {
        if (!response.success) alert(!_.isNil(response.error) ? response.error.message : "A problem has occurred trying to delete the Challenge");
      });
    }
  }

  @boundMethod
  private userConfirmedDeletion(): Boolean {
    const message = "Are you sure you want to delete this Challenge?";
    return confirm(message);
  }

  render() {
    const {modalVisibility, challenge} = this.state;
    const {imageUrl, title, topIdea} = this.props.challenge;
    const {myProfile} = this.props;

    const totalReactions = !_.isNil(topIdea) ? topIdea.reactionQuantity : 0;

    const deleteImage = require("../../../assets/images/delete.png");
    const editImage = require("../../../assets/images/edit.png");
    const menuImage = require("../../../assets/images/cell_menu.png");

    const menu = (
      <Menu>
        <Menu.Item>
          <div onClick={this.onEditChallenge}>
            <img src={editImage} alt="menu" />
            <span className="ph-profile-challenge-cell-dropdown-text">Edit</span>
          </div>
        </Menu.Item>
        <Menu.Item>
          <div onClick={this.onDeleteChallenge}>
            <img src={deleteImage} alt="menu" />
            <span className="ph-profile-challenge-cell-dropdown-text">Delete</span>
          </div>
        </Menu.Item>
      </Menu>
    );

    return (
      <div className="ph-profile-challenge-cell-wrapper">
        <div className="ph-profile-challenge-cell-image-wrapper" onClick={this.onChallengeClick}>
          <img className="ph-profile-challenge-cell-image-content" src={imageUrl} />
        </div>
        <div className="ph-profile-challenge-cell-data-wrapper">
          <span className="ph-profile-challenge-cell-data-title" onClick={this.onChallengeClick}>
            {title}
          </span>
          {myProfile ? (
            <Dropdown overlay={menu} placement="topRight" trigger={["click"]}>
              <div className="ph-profile-challenge-cell-data-icon">
                <img src={menuImage} alt="menu" />
              </div>
            </Dropdown>
          ) : (
            <div />
          )}
          <div className="ph-profile-challenge-cell-data-idea-wrapper" style={_.isNil(topIdea) ? {display: "none"} : {}} onClick={this.onChallengeClick}>
            <span className="ph-profile-challenge-cell-data-idea-title">Winning idea so far:</span>
            <span className="ph-profile-challenge-cell-data-idea-description">{!_.isNil(topIdea) ? topIdea.title : ""}</span>
            <div className="ph-profile-challenge-cell-data-idea-votes">
              <span className="ph-profile-challenge-cell-data-idea-votes-counter">{totalReactions}</span>
              <span>{totalReactions === 1 ? "Like" : "Likes"}</span>
            </div>
          </div>
        </div>
        {modalVisibility && (
          <Modal visible={true} footer={null} className="ph-modal" width="" onCancel={this.handleCancel}>
            <CreateChallenge challenge={challenge} onClose={this.handleSuccess} />
          </Modal>
        )}
      </div>
    );
  }
}

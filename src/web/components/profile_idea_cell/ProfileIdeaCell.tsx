import * as React from "react";
import * as _ from "lodash";
import {Dropdown, Menu, Modal} from "antd";
import {observer} from "mobx-react";
import {CreateIdea} from "../create_idea/CreateIdea";
import {RouteComponentProps} from "react-router";
import {BaseComponent} from "../../BaseComponent";
import {Models} from "../../../services";
import {boundMethod} from "autobind-decorator";

export interface IdeaProfilePreviewProps extends RouteComponentProps<{}> {
  idea: Models.Idea;
  isIdea: boolean;
  myProfile: boolean;
}

export interface IdeaProfilePreviewState {
  ideaId: string;
  modalVisibility: boolean;
  isUserLoggedIn: boolean;
  idea: Models.Idea;
}

@observer
export class ProfileIdeaCell extends BaseComponent<IdeaProfilePreviewProps, IdeaProfilePreviewState> {
  state = {
    ideaId: this.props.idea.id,
    modalVisibility: false,
    isUserLoggedIn: false,
    idea: new Models.Idea(),
  };

  componentDidMount() {
    const {userState} = this.store;
    const {idea} = this.props;

    this.setState({
      isUserLoggedIn: !_.isNil(userState.currentUser),
      idea: idea,
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
  private editItem() {
    if (this.state.isUserLoggedIn) {
      this.setState({modalVisibility: true});
    } else {
      this.props.history.push("login");
    }
  }

  @boundMethod
  private deleteItem() {
    const {ideaId} = this.state;
    const {userState, ideaState, reactionState} = this.store;
    const {isIdea, idea} = this.props;

    if (userState.isAuthenticated && this.userConfirmedDeletion()) {
      if (isIdea) {
        ideaState.deleteIdea({id: ideaId}).then(response => {
          if (!response.success) alert(!_.isNil(response.error) ? response.error.message : "A problem has occurred trying to delete this Idea");
        });
      } else {
        reactionState.deleteIdeaReaction({idea}).then(response => {
          if (!response.success) alert(!_.isNil(response.error) ? response.error.message : "A problem has occurred trying to delete this reaction");
        });
      }
    }
  }

  @boundMethod
  private handleClick() {
    const {idea, history} = this.props;

    history.push("/challenge", {challengeId: idea.challenge.id});
  }

  @boundMethod
  private userConfirmedDeletion(): Boolean {
    const modifier = this.props.isIdea ? "Idea" : "reaction";
    const message = "Are you sure you want to delete this " + modifier + "?";
    return confirm(message);
  }

  render() {
    const deleteImage = require("../../../assets/images/delete.png");
    const editImage = require("../../../assets/images/edit.png");
    const menuImage = require("../../../assets/images/cell_menu.png");

    const {modalVisibility, idea} = this.state;
    const {isIdea, myProfile} = this.props;

    const totalReactions = !_.isNil(idea) ? idea.reactionQuantity : 0;

    const menu = (
      <Menu>
        {isIdea ? (
          <Menu.Item>
            <div onClick={this.editItem}>
              <img src={editImage} alt="menu" />
              <span className="ph-profile-idea-cell-dropdown-text">Edit</span>
            </div>
          </Menu.Item>
        ) : null}
        <Menu.Item>
          <div onClick={this.deleteItem}>
            <img src={deleteImage} alt="menu" />
            <span className="ph-profile-idea-cell-dropdown-text">Delete</span>
          </div>
        </Menu.Item>
      </Menu>
    );

    return (
      <div className="ph-profile-idea-cell-wrapper">
        <div className="ph-profile-idea-cell-image-wrapper" onClick={this.handleClick}>
          <img className="ph-profile-idea-cell-image-content" src={!_.isNil(idea) ? idea.imageUrl : ""} />
        </div>
        <div className="ph-profile-idea-cell-data-wrapper">
          <span className="ph-profile-idea-cell-data-title" onClick={this.handleClick}>
            {!_.isNil(idea) ? idea.title : ""}
          </span>
          {myProfile ? (
            <Dropdown overlay={menu} placement="topRight" trigger={["click"]}>
              <div className="ph-profile-idea-cell-data-icon">
                <img src={menuImage} alt="menu" />
              </div>
            </Dropdown>
          ) : null}
          <span className="ph-profile-idea-cell-data-idea-description" onClick={this.handleClick}>
            {!_.isNil(idea) ? idea.description : ""}
          </span>
          <div className="ph-profile-idea-cell-data-idea-votes">
            <span className="ph-profile-idea-cell-data-idea-votes-counter">{totalReactions}</span>
            <span>{totalReactions === 1 ? "Like" : "Likes"}</span>
          </div>
        </div>
        {modalVisibility && (
          <Modal visible={true} footer={null} className="ph-modal" width="" onCancel={this.handleCancel}>
            <CreateIdea idea={idea} onClose={this.handleSuccess} />
          </Modal>
        )}
      </div>
    );
  }
}

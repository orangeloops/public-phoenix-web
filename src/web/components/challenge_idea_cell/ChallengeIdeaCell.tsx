import * as React from "react";
import {RouteComponentProps} from "react-router";
import * as _ from "lodash";
import classNames from "classnames";
import {observer} from "mobx-react";
import {Dropdown, Icon, Menu} from "antd";
import {Models} from "../../../services";
import {BaseComponent} from "../../BaseComponent";
import {boundMethod} from "autobind-decorator";

export interface ChallengeIdeaCellProps extends RouteComponentProps<{}> {
  idea: Models.Idea;
  refreshChallenge?: () => void;
}

export interface ChallengeIdeaCellState {
  isChangingValue: boolean;
}

@observer
export class ChallengeIdeaCell extends BaseComponent<ChallengeIdeaCellProps, ChallengeIdeaCellState> {
  state = {
    idea: new Models.Idea(),
    isChangingValue: false,
  };

  componentDidMount() {
    const {idea} = this.props;
    const {ideaState} = this.store;

    ideaState.fetchIdea({idea}).then(response => {
      if (!response.success) {
        alert(!_.isNil(response.error) ? response.error.message : "A problem has occurred.");
      }
    });
  }

  @boundMethod
  private onDeleteIdea() {
    const {idea} = this.props;
    const {userState, ideaState} = this.store;

    if (userState.isAuthenticated && this.userConfirmedDeletion()) {
      ideaState.deleteIdea({idea}).then(response => {
        if (!response.success) {
          alert(!_.isNil(response.error) ? response.error.message : "A problem has occurred trying to delete this Idea.");
        } else this.props.refreshChallenge!();
      });
    }
  }

  private userConfirmedDeletion(): Boolean {
    const message = "Are you sure you want to delete this Idea?";
    return confirm(message);
  }

  @boundMethod
  private handleGoToProfile(userId: string) {
    this.props.history.push({pathname: "/profile", state: {userId}});
  }

  @boundMethod
  private async handleReactionPress() {
    const {idea} = this.props;
    const {isChangingValue} = this.state;
    const {userState, reactionState} = this.store;
    const {isAuthenticated} = userState;

    if (!isAuthenticated) {
      this.props.history.push("/login");
      return;
    }

    if (isChangingValue) return;

    this.setState({isChangingValue: true});

    if (_.isNil(idea!.myReaction)) await reactionState.createIdeaReaction({idea: idea});
    else await reactionState.deleteIdeaReaction({idea: idea});

    this.setState({isChangingValue: false});
  }

  render() {
    const {idea} = this.props;
    const {isChangingValue} = this.state;
    const menuImage = require("../../../assets/images/cell_menu.png");
    const deleteImage = require("../../../assets/images/delete.png");
    const likedByMe = _.isNil(idea.myReaction) === isChangingValue;
    const totalReactions = !isChangingValue ? idea.reactionQuantity : likedByMe ? idea.reactionQuantity + 1 : idea.reactionQuantity - 1;
    const render = !_.isNil(idea.createdBy);

    const challenge = this.store.challengeState.currentChallenge;
    const showDropdown: boolean = !_.isNil(challenge) && !_.isNil(this.store.userState.currentUser) && challenge.createdBy.id === this.store.userState.currentUser.id;
    const menu = showDropdown ? (
      <Menu>
        <Menu.Item onClick={this.onDeleteIdea}>
          <img src={deleteImage} alt="menu" />
          <span className="ph-challenge-idea-cell-dropdown-text">Delete</span>
        </Menu.Item>
      </Menu>
    ) : (
      <div />
    );
    return render ? (
      <div className="ph-challenge-idea-cell-wrapper">
        {showDropdown && (
          <div className="ph-challenge-idea-cell-delete-button">
            <Dropdown overlay={menu} placement="topRight" trigger={["click"]}>
              <div className="ph-profile-idea-cell-data-icon">
                <img src={menuImage} alt="menu" />
              </div>
            </Dropdown>
          </div>
        )}
        <div className="ph-challenge-idea-cell-image-wrapper">
          <a href={idea!.imageUrl} target="_blank">
            <img className="ph-challenge-idea-cell-image-content" src={idea!.imageUrl} />
          </a>
          <div className="ph-challenge-idea-cell-creation-wrapper">
            <div className="ph-challenge-idea-cell-creation-user">
              <img className="ph-challenge-idea-createdby-avatar" src={idea!.createdBy.imageUrl} alt="User avatar" onClick={() => this.handleGoToProfile(idea.createdBy.id)} />
              <div className="ph-challenge-idea-createdby-name">{idea!.createdBy.name}</div>
            </div>
            <div className="ph-challenge-idea-createdby-date">{!_.isNil(idea!.createdDate) ? idea!.createdDate.format("DD/MM/YYYY") : ""}</div>
          </div>
        </div>
        <div className="ph-challenge-idea-cell-data-wrapper">
          <div className="ph-challenge-idea-cell-data-title">
            <span className="ph-challenge-idea-cell-data-title-content">{idea!.title}</span>
          </div>
          <span className="ph-challenge-idea-cell-data-idea-description">{idea!.description}</span>
          <div className="ph-challenge-idea-cell-data-reactions-wrapper">
            <Icon
              className={classNames("ph-challenge-idea-cell-data-reactions-icon", isChangingValue ? " disabled" : "")}
              type="heart"
              theme={likedByMe ? "filled" : undefined}
              onClick={isChangingValue ? undefined : () => this.handleReactionPress()}
            />
            <span className="ph-challenge-idea-cell-data-reactions-message">{totalReactions + (totalReactions === 1 ? " Like" : " Likes")}</span>
          </div>
        </div>
      </div>
    ) : (
      <div />
    );
  }
}

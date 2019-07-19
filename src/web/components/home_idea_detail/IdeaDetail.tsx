import * as _ from "lodash";
import classNames from "classnames";
import moment from "moment";
import * as React from "react";
import {observer} from "mobx-react";
import {Icon} from "antd";
import * as H from "history";
import {BaseComponent} from "../../BaseComponent";
import {Models} from "../../../services";
import {boundMethod} from "autobind-decorator";

export interface IdeaDetailProps {
  idea: Models.Idea;
  history: H.History;
}

export interface IdeaDetailState {
  isChangingValue: boolean;
}

@observer
export class IdeaDetail extends BaseComponent<IdeaDetailProps, IdeaDetailState> {
  state = {
    isChangingValue: false,
  };

  @boundMethod
  private async handleReactionPress() {
    const {idea} = this.props;
    const {isChangingValue} = this.state;
    const {userState, reactionState} = this.store;
    const {isAuthenticated} = userState;

    if (!isAuthenticated) {
      this.props.history.push("/login");
    }

    if (isChangingValue) return;

    this.setState({isChangingValue: true});

    if (_.isNil(idea!.myReaction)) await reactionState.createIdeaReaction({idea: idea});
    else await reactionState.deleteIdeaReaction({idea: idea});

    this.setState({isChangingValue: false});
  }

  private getUserInformation(): {avatarUrl: string; userName: string; userId: string} {
    const {idea} = this.props;
    const user = idea.createdBy;

    if (!_.isNil(user)) {
      return {avatarUrl: user.imageUrl, userName: user.name, userId: user.id};
    }

    return {avatarUrl: "", userName: "", userId: ""};
  }

  render() {
    const {idea} = this.props;
    const {isChangingValue} = this.state;
    const {avatarUrl, userName, userId} = this.getUserInformation();
    const {createdDate, imageUrl, title, description, reactionQuantity, myReaction, challenge} = idea;

    const likedByMe = _.isNil(myReaction) === isChangingValue;
    const totalReactions = !isChangingValue ? reactionQuantity : likedByMe ? reactionQuantity + 1 : reactionQuantity - 1;

    return (
      <div className="ph-idea-detail">
        <div className="ph-idea-detail-top">
          <div className="ph-idea-detail-image-box">
            <div className="ph-idea-detail-image-background">
              <img className="ph-idea-detail-image" src={imageUrl} alt="Idea image" />
            </div>
            <div className="ph-idea-detail-user">
              <div className="ph-idea-detail-user-box">
                <div className="ph-idea-detail-user-avatar-box">
                  <img className="ph-idea-detail-user-avatar" src={avatarUrl} alt="User avatar" onClick={() => this.props.history.push({pathname: "/profile", state: {userId}})} />
                </div>
                <div className="ph-idea-detail-user-name">{userName}</div>
              </div>
              <div className="ph-idea-detail-user-date">{createdDate.format("DD/MM/YYYY")}</div>
            </div>
          </div>
          <div className="ph-idea-detail-info">
            <div className="ph-idea-detail-info-reactions">
              <Icon
                className={classNames("ph-challenge-idea-cell-data-reactions-icon", isChangingValue ? " disabled" : "")}
                type="heart"
                theme={likedByMe ? "filled" : undefined}
                onClick={isChangingValue ? undefined : this.handleReactionPress}
              />
              <div className="ph-idea-detail-info-reactions-quantity">{totalReactions + (totalReactions === 1 ? " Like" : " Likes")}</div>
            </div>
            {moment.isMoment(challenge.endDate) && (
              <div className="ph-idea-detail-info-votes-deadline">
                <div className="ph-idea-detail-info-votes-deadline-label">Likes deadline:</div>
                <div className="ph-idea-detail-info-votes-deadline-date">{challenge.endDate.format("DD/MM/YYYY")}</div>
              </div>
            )}
          </div>
        </div>
        <div className="ph-idea-detail-content">
          <div className="ph-idea-detail-content-title">{title}</div>
          <div className="ph-idea-detail-info-description">{description}</div>
        </div>
      </div>
    );
  }
}

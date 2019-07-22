import * as React from "react";
import {observer} from "mobx-react";
import * as _ from "lodash";
import {RouteComponentProps} from "react-router";
import {Idea} from "../../../services/models";
import {BaseComponent} from "../../BaseComponent";

export interface HomeChallengeIdeaProps extends RouteComponentProps<{}> {
  idea: Idea;
  showIdeaDetail: (idea: Idea) => void;
}

interface HomeChallengeIdeaStates {}

@observer
export class HomeChallengeIdea extends BaseComponent<HomeChallengeIdeaProps, HomeChallengeIdeaStates> {
  componentDidMount() {
    const {idea} = this.props;
    const {ideaState} = this.store;

    ideaState.fetchIdea({idea}).then(response => {});
  }

  private handleProfile(userId: any) {
    this.props.history.push({pathname: "/profile", state: {userId}});
  }

  render() {
    const {idea} = this.props;

    const render = !_.isNil(idea.createdBy);

    return render ? (
      <div className="ph-home-challenge-ideas-single-idea">
        <div className="ph-home-challenge-ideas-idea" onClick={() => this.props.showIdeaDetail(idea)}>
          <div className="ph-home-challenge-ideas-idea-image-box">
            <img className="ph-home-challenge-ideas-idea-image" src={idea.imageUrl} />
          </div>
          <div className="ph-home-challenge-ideas-idea-box">
            <div className="ph-home-challenge-ideas-idea-content">
              <div className="ph-home-challenge-ideas-idea-content-title">{idea.title}</div>
              <div className="ph-home-challenge-ideas-idea-content-likes">
                <div className="ph-home-challenge-ideas-idea-content-likes-number">
                  {idea.reactionQuantity > 99 ? 99 : idea.reactionQuantity}
                  <sup className="ph-home-challenge-ideas-idea-content-likes-number-plus">{idea.reactionQuantity > 99 ? "+" : ""}</sup>
                </div>
                <div className="ph-home-challenge-ideas-idea-content-likes-text">{idea.reactionQuantity === 1 ? "Like" : "Likes"}</div>
              </div>
            </div>
            <div className="ph-home-challenge-ideas-idea-content-description">{idea.description}</div>
            <div className="ph-home-challenge-ideas-idea-footer">
              <div className="ph-home-challenge-ideas-idea-footer-info">
                <div className="ph-home-challenge-ideas-idea-footer-info-avatar" onClick={() => this.handleProfile(idea.createdBy.id)}>
                  {<img src={idea.createdBy.imageUrl} alt="" />}
                </div>
                <div className="ph-home-challenge-ideas-idea-footer-info-date">{!_.isNil(idea.createdDate) ? idea.createdDate.format("DD/MM/YY") : ""}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="ph-home-challenge-ideas-separator" />
      </div>
    ) : (
      <div />
    );
  }
}

import {observer} from "mobx-react";
import * as React from "react";
import {HomeChallengeIdea} from "../homechallengeidea/HomeChallengeIdea";
import * as _ from "lodash";
import {Challenge, Idea} from "../../../services/models";
import moment from "moment";
import {Breakpoint} from "../../store/AppStore";
import {RouteComponentProps} from "react-router";
import {BaseComponent} from "../../BaseComponent";
import {boundMethod} from "autobind-decorator";

export interface HomeChallengeProps extends RouteComponentProps<{}> {
  challenge: Challenge;

  showModal: () => void;
  showIdeaDetail: (idea: Idea) => void;
  onClose: () => void;
}

interface HomeChallengeStates {
  visible: boolean;
}

@observer
export class HomeChallenge extends BaseComponent<HomeChallengeProps, HomeChallengeStates> {
  state = {
    visible: false,
  };

  @boundMethod
  private showModal() {
    this.store.challengeState.setCurrentChallenge(this.props.challenge);
    this.props.showModal();
  }

  @boundMethod
  private handleProfile(userId: any) {
    this.props.history.push({pathname: "/profile", state: {userId}});
  }

  @boundMethod
  private handleViewFullChallenge(challengeId: string) {
    this.props.history.push({pathname: "/challenge", state: {challengeId}});
  }

  render() {
    const {history, location, match, challenge} = this.props;
    const {currentUser} = this.store.userState;
    const {breakpoint} = this.appStore;

    let ideasLength = 0;
    if (challenge.ideas.length > 2) {
      ideasLength = breakpoint === Breakpoint.XS ? 2 : 3;
    } else {
      ideasLength = challenge.ideas.length;
    }

    const dateToCompare = _.isNil(challenge.closeDate) ? challenge.endDate : challenge.closeDate;
    const showAddIdea =
      !_.isNil(currentUser) &&
      (_.isNil(dateToCompare) ||
        dateToCompare
          .clone()
          .endOf("day")
          .isSameOrAfter(moment()));

    return (
      <div className="ph-home-challenge">
        <div className="ph-home-challenge-container">
          <div className="ph-home-challenge-box" onClick={() => this.handleViewFullChallenge(challenge.id)}>
            <div className="ph-home-challenge-image-box">
              <img src={challenge.imageUrl} alt="Challenge Photo" />
            </div>
            <div className="ph-home-challenge-box-content">
              <div className="ph-home-challenge-box-content-title">{challenge.title}</div>
              <div className="ph-home-challenge-box-content-description">
                <p className="ph-home-challenge-box-content-description-paragraph">{challenge.description}</p>
              </div>
            </div>
          </div>
          <div className="ph-home-challenge-box-footer">
            <div className="ph-home-challenge-box-footer-info">
              <div className="ph-home-challenge-box-footer-avatar" onClick={() => this.handleProfile(challenge.createdBy.id)}>
                <img src={challenge.createdBy.imageUrl} alt="User Photo" />
              </div>
              <div className="ph-home-challenge-box-footer-date">{challenge.createdDate.format("DD/MM/YY")}</div>
            </div>
          </div>
        </div>
        <div className="ph-home-challenge-ideas">
          <div className="ph-home-challenge-ideas-container">
            {!_.isNil(challenge.ideas) &&
              challenge.ideas.slice(0, ideasLength).map((idea: Idea) => {
                return <HomeChallengeIdea history={history} location={location} match={match} key={idea.id} idea={idea} showIdeaDetail={this.props.showIdeaDetail} />;
              })}
          </div>
          <div className="ph-home-challenge-ideas-footer">
            <div className="ph-home-challenge-ideas-footer-add-idea" onClick={this.showModal} style={showAddIdea ? {} : {display: "none"}}>
              Add Idea
            </div>
          </div>
        </div>
      </div>
    );
  }
}

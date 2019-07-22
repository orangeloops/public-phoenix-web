import * as React from "react";
import {observer} from "mobx-react";
import {ChallengeIdeaCell} from "../../components/challenge_idea_cell/ChallengeIdeaCell";
import * as _ from "lodash";
import {ChallengePrivacyMode, Idea} from "../../../services/models";
import {Icon, Modal} from "antd";
import {CreateIdea} from "../../components/create_idea/CreateIdea";
import {RouteComponentProps} from "react-router";
import {BaseComponent} from "../../BaseComponent";
import {boundMethod} from "autobind-decorator";

export interface ChallengeProps extends RouteComponentProps<{}> {}

export interface ChallengeState {
  isUserLoggedIn: boolean;
  isLoading: boolean;
  modalVisibility: boolean;
}

@observer
export class Challenge extends BaseComponent<ChallengeProps, ChallengeState> {
  state = {
    isUserLoggedIn: false,
    isLoading: true,
    modalVisibility: false,
  };

  componentDidMount() {
    const {userState} = this.store;

    this.setState({isUserLoggedIn: !_.isNil(userState.currentUser)});
    this.refreshChallenge();
  }

  @boundMethod
  private showModal() {
    if (this.state.isUserLoggedIn) {
      this.setState({
        modalVisibility: true,
      });
    } else {
      this.props.history.push("/login");
    }
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
  private handleGoToProfile(userId: string) {
    this.props.history.push({pathname: "/profile", state: {userId}});
  }

  @boundMethod
  private refreshChallenge() {
    const {challengeState} = this.store;
    const {location, history} = this.props;

    if (!_.isNil(location.state) && !_.isNil(location.state.challengeId)) {
      const {challengeId} = location.state;

      challengeState.fetchChallenge({id: challengeId}).then(response => {
        if (!response.success) {
          alert(!_.isNil(response.error) ? response.error.message : "error");
          history.goBack();
        } else {
          this.setState({isLoading: false});
        }
      });
    } else {
      history.push("/home");
    }
  }

  render() {
    const {history, location, match} = this.props;
    const {isLoading, modalVisibility} = this.state;
    const challenge = this.store.challengeState.currentChallenge;

    const lockImage = require("../../../assets/images/lock.png");

    const showCloseDate = challenge && challenge.closeDate;
    const showEndDate = challenge && challenge.endDate;

    return isLoading ? (
      <div className="ph-challenge-load-icon-container">
        <Icon className="ph-challenge-load-icon" type="loading" />
      </div>
    ) : (
      <div className="ph-challenge">
        <div className="ph-challenge-image-box">
          <a href={challenge!.imageUrl} target="_blank">
            <img className="ph-challenge-image" src={challenge!.imageUrl} alt="Challenge image" />
          </a>
        </div>

        <div className="ph-challenge-wrapper">
          <div className="ph-challenge-summary">
            <div className="ph-challenge-summary-creation">
              <img className="ph-challenge-summary-creation-avatar" src={challenge!.createdBy.imageUrl} alt="User avatar" onClick={() => this.handleGoToProfile(challenge!.createdBy.id)} />
              <div className="ph-challenge-summary-creation-data">
                <div className="ph-challenge-summary-creation-data-name">{challenge!.createdBy.name}</div>
                <div className="ph-challenge-summary-creation-data-date">{challenge!.createdDate.format("DD/MM/YYYY")}</div>
              </div>
            </div>

            <div className="ph-challenge-summary-deadlines">
              {showCloseDate && (
                <div className="ph-challenge-summary-deadlines-content ideas">
                  <div className="ph-challenge-summary-deadlines-date">{challenge!.closeDate.format("DD/MM/YYYY")}</div>
                  <div className="ph-challenge-summary-deadlines-label">Ideas deadline</div>
                </div>
              )}

              {showCloseDate && showEndDate && <div className="ph-challenge-summary-deadlines-separator" />}

              {showEndDate && (
                <div className="ph-challenge-summary-deadlines-content challenge">
                  <div className="ph-challenge-summary-deadlines-date">{challenge!.endDate.format("DD/MM/YYYY")}</div>
                  <div className="ph-challenge-summary-deadlines-label">Challenge deadline</div>
                </div>
              )}
            </div>
          </div>
          {challenge!.privacyMode !== ChallengePrivacyMode.PUBLIC && (
            <div className="ph-challenge-private-label">
              {challenge!.privacyData}
              <img src={lockImage} className="ph-challenge-private-image" />
            </div>
          )}

          <div className="ph-challenge-info-box">
            <div className="ph-challenge-title">{challenge!.title}</div>
            <div className="ph-challenge-description-box">
              <div className="ph-challenge-description">{challenge!.description}</div>
              <div className="ph-challenge-add-idea-button" onClick={this.showModal}>
                Add Idea
              </div>
            </div>
          </div>

          <div className="ph-challenge-ideas-wrapper">
            {!_.isNil(challenge) &&
              !_.isNil(challenge.ideas) &&
              challenge.ideas.slice().map((idea: Idea) => {
                return <ChallengeIdeaCell key={idea.id} history={history} location={location} match={match} idea={idea} refreshChallenge={this.refreshChallenge} />;
              })}
          </div>

          {modalVisibility && (
            <Modal visible={true} footer={null} className="ph-modal" width="" onCancel={this.handleCancel}>
              <CreateIdea onClose={this.handleSuccess} />
            </Modal>
          )}
        </div>
      </div>
    );
  }
}

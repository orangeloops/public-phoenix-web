import {observer} from "mobx-react";
import * as React from "react";
import * as _ from "lodash";
import {Icon, Modal} from "antd";
import {HomeChallenge} from "../../components/homechallenge/HomeChallenge";
import {CreateChallenge} from "../../components/create_challenge/CreateChallenge";
import {CreateIdea} from "../../components/create_idea/CreateIdea";
import {IdeaDetail} from "../../components/home_idea_detail/IdeaDetail";
import {RouteComponentProps} from "react-router";
import {BaseComponent} from "../../BaseComponent";
import {action, observable} from "mobx";
import {Models} from "../../../services";
import {boundMethod} from "autobind-decorator";

export enum ModalState {
  CreateChallenge,
  CreateIdea,
  IdeaDetail,
  Nothing,
}

export interface HomeProps extends RouteComponentProps<{}> {}

export interface HomeState {
  modalVisibility: boolean;
  isUserLoggedIn: boolean;
  modalState: ModalState;
  isLoading: boolean;
}

@observer
export class Home extends BaseComponent<HomeProps, HomeState> {
  state: HomeState = {
    modalVisibility: false,
    isUserLoggedIn: false,
    modalState: ModalState.CreateChallenge,
    isLoading: true,
  };

  @observable
  ideaToShow: Models.Idea | undefined;

  componentDidMount() {
    const {userState} = this.store;
    this.setState({isUserLoggedIn: !_.isNil(userState.currentUser)});
    this.reloadChallenges(3);
  }

  @boundMethod
  private showCreateChallengeModal() {
    if (this.state.isUserLoggedIn) {
      this.setState({modalState: ModalState.CreateChallenge});
      this.showModal();
    } else {
      this.props.history.push("login");
    }
  }

  @boundMethod
  private showCreateIdeaModal() {
    this.setState({modalState: ModalState.CreateIdea});
    this.showModal();
  }

  @boundMethod
  @action
  private showIdeaDetailModal(idea: Models.Idea) {
    this.ideaToShow = idea;

    this.setState({modalState: ModalState.IdeaDetail});
    this.showModal();
  }

  @boundMethod
  private showModal() {
    this.setState({
      modalVisibility: true,
    });
  }

  @boundMethod
  private handleCancel() {
    this.setState({
      modalVisibility: false,
      modalState: ModalState.Nothing,
    });
  }

  @boundMethod
  private handleSuccess() {
    this.setState({
      modalVisibility: false,
    });
  }

  @boundMethod
  private reloadChallenges(attempt: number) {
    const {challengeState} = this.store;
    this.setState({isLoading: true});
    challengeState.fetchChallengeList().then(response => {
      if (response.success) {
        this.setState({isLoading: false});
      } else {
        if (attempt > 0) {
          this.reloadChallenges(attempt - 1);
        } else {
          alert("Error getting challenges");
        }
      }
    });
  }

  render() {
    const {ideaToShow} = this;
    const {challengeList} = this.store.challengeState;
    const {modalVisibility, isUserLoggedIn, modalState, isLoading} = this.state;
    const {history, location, match} = this.props;

    return (
      <div className="ph-home">
        <div className="ph-home-new-challenge">
          <div className="ph-home-new-challenge-title">Need ideas?</div>
          <div className="ph-home-new-challenge-button" onClick={this.showCreateChallengeModal}>
            {isUserLoggedIn ? "Share your challenge!" : "Sign In / Sign Up"}
          </div>
        </div>
        {modalVisibility && (
          <Modal visible={true} footer={null} className="ph-modal" width="" onCancel={this.handleCancel}>
            {modalState === ModalState.CreateChallenge ? (
              <CreateChallenge challenge={undefined} onClose={this.handleSuccess} />
            ) : modalState === ModalState.CreateIdea ? (
              <CreateIdea onClose={this.handleSuccess} />
            ) : modalState === ModalState.IdeaDetail ? (
              <IdeaDetail idea={ideaToShow!} history={this.props.history} />
            ) : (
              ""
            )}
          </Modal>
        )}
        {isLoading ? (
          <div className="ph-challenge-load-icon-container">
            <Icon className="ph-challenge-load-icon" type="loading" />
          </div>
        ) : (
          !_.isNil(challengeList) &&
          challengeList.map((challenge: Models.Challenge) => {
            return <HomeChallenge history={history} location={location} match={match} key={challenge.id} challenge={challenge} showModal={this.showCreateIdeaModal} showIdeaDetail={this.showIdeaDetailModal} onClose={this.handleCancel} />;
          })
        )}
      </div>
    );
  }
}

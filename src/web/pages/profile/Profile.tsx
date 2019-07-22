import * as _ from "lodash";
import * as React from "react";
import {ChangeEvent} from "react";
import classNames from "classnames";
import {ProfileSummaryLists} from "../../components/profile_summary_lists/ProfileSummaryLists";
import {observer} from "mobx-react";
import {Icon} from "antd";
import {RouteComponentProps} from "react-router";
import {BaseComponent} from "../../BaseComponent";
import {FetchUserRequest, FetchUserStatus, UpdateMeRequest, UserState} from "../../../services/store/UserState";
import {ChallengeState, FetchUserChallengesRequest} from "../../../services/store/ChallengeState";
import {FetchIdeasWithUserReactionRequest, FetchUserIdeasRequest, IdeaState} from "../../../services/store/IdeaState";
import {boundMethod} from "autobind-decorator";

const camera = require("../../../assets/images/camera.svg");

export interface ProfileProps extends RouteComponentProps<{}> {}

export interface ProfileState {
  clicked: number;
  name: string;
  image: string;
  email: string;
  userId: string;
  itsMe: boolean;
  edit: boolean;
  loading: boolean;
  file?: File;
  isLoading: boolean;
  isLoadingReactions: boolean;
  isLoadingIdeas: boolean;
  isLoadingChallenges: boolean;
}

function getBase64(img: File, callback: any) {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
}

@observer
export class Profile extends BaseComponent<ProfileProps, ProfileState> {
  state = {
    clicked: 1,
    name: "",
    image: "",
    email: "",
    userId: "",
    itsMe: false,
    edit: false,
    loading: false,
    isLoading: true,
    isLoadingChallenges: true,
    isLoadingIdeas: true,
    isLoadingReactions: true,
  };

  componentDidMount() {
    this.getComponentsDataToRender(this.props);
  }

  componentWillReceiveProps(props: ProfileProps) {
    this.getComponentsDataToRender(props);
  }

  @boundMethod
  private handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;

    if (files != null && files.length === 1) {
      const file = files[0];

      this.setState({file: file});

      getBase64(file, (image: string) =>
        this.setState({
          image,
          loading: false,
        })
      );
      const {userState} = this.store;

      const requestUpdateMe: UpdateMeRequest = {
        name: this.state.name,
        image: file,
      };

      userState.updateMe(requestUpdateMe).then(response => {
        if (!response.success) {
          alert(!_.isNil(response.error) ? response.error.message : "A problem has occurred trying to load the profile information");
        } else {
          this.setState({edit: false});
        }
      });
    }
  }

  @boundMethod
  private handleSummaryChange(selected: number) {
    this.setState({clicked: selected});
  }

  @boundMethod
  private handleUserNameChange(value: string) {
    this.setState({name: value});
  }

  @boundMethod
  private handleEditMode() {
    this.setState({edit: true});
  }

  @boundMethod
  private handleSave() {
    const {userState} = this.store;

    const requestUpdateMe: UpdateMeRequest = {
      name: this.state.name,
    };

    userState.updateMe(requestUpdateMe).then(response => {
      if (!response.success) {
        alert(!_.isNil(response.error) ? response.error.message : "A problem has occurred trying to load the profile information");
      } else {
        this.setState({edit: false});
      }
    });
  }

  private getComponentsDataToRender(props: ProfileProps) {
    const {challengeState, ideaState, userState} = this.store;
    const {location} = props;

    if ((!_.isNil(location.state) && !_.isNil(location.state.userId) && (userState.currentUser && userState.currentUser.id !== location.state.userId)) || _.isNil(userState.currentUser)) {
      let userRequest: FetchUserRequest = {
        id: location.state.userId,
      };

      userState.fetchUser(userRequest).then(response => {
        if (!response.success) {
          alert(!_.isNil(response.error) ? response.error.message : "A problem has occurred trying" + " to load the profile information");
          this.setState({isLoading: false});
        } else {
          this.loadNonLoggedInUsersData(response, challengeState, ideaState);
        }
      });
    } else {
      this.loadLoggedInUsersData(userState, challengeState, ideaState);
    }

    const itsMe = (!_.isNil(location.state) && !_.isNil(userState.currentUser) && userState.currentUser.id === location.state.userId) || ((_.isNil(location.state) || _.isNil(location.state.userId)) && !_.isNil(userState.currentUser));
    this.setState({itsMe: itsMe});
  }

  private loadNonLoggedInUsersData(response: FetchUserStatus, challengeState: ChallengeState, ideaState: IdeaState) {
    if (response.user) {
      this.setState({
        isLoading: false,
        name: response.user.name,
        image: response.user.imageUrl,
        email: response.user.email,
      });

      const requestChallenges: FetchUserChallengesRequest = {
        user: response.user,
      };
      challengeState.fetchUserChallenges(requestChallenges).then(r => {
        this.setState({
          isLoadingChallenges: false,
        });
        if (!r.success) alert(!_.isNil(r.error) ? r.error.message : "A problem has occurred trying to load the challenges of this user");
      });

      const requestIdeas: FetchUserIdeasRequest = {
        user: response.user,
      };
      ideaState.fetchUserIdeas(requestIdeas).then(r => {
        this.setState({
          isLoadingIdeas: false,
        });
        if (!r.success) alert(!_.isNil(r.error) ? r.error.message : "A problem has occurred trying to load the ideas of this user");
      });

      const request: FetchIdeasWithUserReactionRequest = {
        user: response.user,
      };
      ideaState.fetchIdeasWithUserReaction(request).then(r => {
        this.setState({
          isLoadingReactions: false,
        });
        if (!r.success) alert(!_.isNil(r.error) ? r.error.message : "A problem has occurred trying to load the reactions of this user");
      });
    }
  }

  private loadLoggedInUsersData(userState: UserState, challengeState: ChallengeState, ideaState: IdeaState) {
    if (!userState.currentUser) {
      this.props.history.push("/login");
    } else {
      this.setState({
        isLoading: false,
        name: userState.currentUser.name,
        image: userState.currentUser.imageUrl,
        email: userState.currentUser.email,
      });

      if (userState.authToken) {
        challengeState.fetchMyChallenges().then(response => {
          this.setState({
            isLoadingChallenges: false,
          });
          if (!response.success) alert(!_.isNil(response.error) ? response.error.message : "A problem has occurred trying to load the challenges");
        });

        ideaState.fetchMyIdeas().then(response => {
          this.setState({
            isLoadingIdeas: false,
          });
          if (!response.success) alert(!_.isNil(response.error) ? response.error.message : "A problem has occurred trying to load the Ideas");
        });

        ideaState.fetchIdeasWithMyReaction().then(response => {
          this.setState({
            isLoadingReactions: false,
          });
          if (!response.success) alert(!_.isNil(response.error) ? response.error.message : "A problem has occurred trying to load reactions");
        });
      }
    }
  }

  render() {
    const {clicked, name, image, email, edit, loading, itsMe, isLoading, isLoadingChallenges, isLoadingIdeas, isLoadingReactions} = this.state;
    const {fetchUserChallengesStatus, fetchMyChallengesStatus} = this.store.challengeState;
    const {fetchIdeasWithUserReactionStatus, fetchUserIdeasStatus, fetchMyIdeasStatus, fetchIdeasWithMyReactionStatus} = this.store.ideaState;
    const {history, location, match} = this.props;

    const ideasInfo = itsMe ? fetchMyIdeasStatus : fetchUserIdeasStatus;
    const challengesInfo = itsMe ? fetchMyChallengesStatus : fetchUserChallengesStatus;
    const reactionsInfo = itsMe ? fetchIdeasWithMyReactionStatus : fetchIdeasWithUserReactionStatus;

    return (
      <div className="ph-profile">
        <div className="ph-profile-header-space" />
        {isLoading ? (
          <div className="ph-challenge-load-icon-container">
            <Icon className="ph-challenge-load-icon" type="loading" />
          </div>
        ) : (
          <div>
            <div className="ph-profile-title">PROFILE</div>
            <div className="ph-profile-user-info">
              {itsMe ? (
                <div className="ph-profile-user-info-picture">
                  <label htmlFor="imageSelector">
                    <img className="ph-profile-user-image" style={!image || loading ? {display: "none"} : {}} src={image} />
                    <div className="ph-profile-image-camera-box">
                      <img className="ph-profile-image-camera" src={camera} />
                    </div>
                    <Icon className="ph-load-icon" style={loading ? {} : {display: "none"}} type="loading" />
                  </label>
                  <input type="file" accept="image/*" style={{display: "none", visibility: "hidden"}} id="imageSelector" onChange={this.handleImageChange} />
                </div>
              ) : (
                <div className="ph-profile-user-info-picture">
                  <img className="ph-profile-user-image" style={!image || loading ? {display: "none"} : {}} src={image} />
                </div>
              )}
              <div className="ph-profile-user-info-box">
                <div className="ph-profile-user-info-data">
                  <div className="ph-profile-name-editable" style={edit ? {display: "none"} : {}}>
                    <span className="ph-profile-user-info-data-name">{name}</span>
                    <div className="ph-profile-edit-icon" style={!itsMe ? {display: "none"} : {}} onClick={this.handleEditMode} />
                  </div>
                  <input className="ph-profile-input" style={!edit ? {display: "none"} : {}} type="text" name="name" maxLength={30} value={name} onChange={event => this.handleUserNameChange(event.target.value)} />
                  {!_.isNil(email) && <span className="ph-profile-user-info-data-text mail">{email}</span>}
                </div>
                <div className="ph-profile-user-info-button">
                  <div className="ph-profile-button" style={!edit ? {display: "none"} : {}} onClick={this.handleSave}>
                    SAVE
                  </div>
                </div>
              </div>
            </div>
            <div className="ph-profile-user-summary-wrapper">
              <div className="ph-profile-user-summary">
                <div className={classNames("ph-profile-user-summary-content", {clicked: clicked === 1})} onClick={() => this.handleSummaryChange(1)}>
                  <div className="ph-profile-user-summary-counter">{challengesInfo.isLoading ? "..." : challengesInfo.totalCount || 0}</div>
                  <div className="ph-profile-user-summary-label">Challenges</div>
                </div>
                <div className={classNames("ph-profile-user-summary-content", {clicked: clicked === 2})} onClick={() => this.handleSummaryChange(2)}>
                  <div className="ph-profile-user-summary-counter">{ideasInfo.isLoading ? "..." : ideasInfo.totalCount || 0}</div>
                  <div className="ph-profile-user-summary-label">Ideas</div>
                </div>
                <div className={classNames("ph-profile-user-summary-content", {clicked: clicked === 3})} onClick={() => this.handleSummaryChange(3)}>
                  <div className="ph-profile-user-summary-counter">{reactionsInfo.isLoading ? "..." : reactionsInfo.totalCount || 0}</div>
                  <div className="ph-profile-user-summary-label">Likes</div>
                </div>
              </div>
            </div>
            <div className="ph-profile-user-summary-list-wrapper">
              <div className="ph-profile-user-summary-list-content">
                {clicked === 1 ? (
                  isLoadingChallenges ? (
                    <div className="ph-challenge-load-icon-container">
                      <Icon className="ph-challenge-load-icon" type="loading" />
                    </div>
                  ) : (
                    <ProfileSummaryLists challengeList={challengesInfo.challenges || []} ideaList={[]} votesList={[]} history={history} location={location} match={match} myProfile={itsMe} />
                  )
                ) : clicked === 2 ? (
                  isLoadingIdeas ? (
                    <div className="ph-challenge-load-icon-container">
                      <Icon className="ph-challenge-load-icon" type="loading" />
                    </div>
                  ) : (
                    <ProfileSummaryLists challengeList={[]} ideaList={ideasInfo.ideas || []} votesList={[]} history={history} location={location} match={match} myProfile={itsMe} />
                  )
                ) : isLoadingReactions ? (
                  <div className="ph-challenge-load-icon-container">
                    <Icon className="ph-challenge-load-icon" type="loading" />
                  </div>
                ) : (
                  <ProfileSummaryLists challengeList={[]} ideaList={[]} votesList={reactionsInfo.ideas || []} history={history} location={location} match={match} myProfile={itsMe} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

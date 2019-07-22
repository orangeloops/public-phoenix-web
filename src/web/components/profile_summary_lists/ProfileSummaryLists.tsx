import * as React from "react";
import * as _ from "lodash";
import {ProfileChallengeCell} from "../profile_challenge_cell/ProfileChallengeCell";
import {ProfileIdeaCell} from "../profile_idea_cell/ProfileIdeaCell";
import {Challenge, Idea} from "../../../services/models";
import {observer} from "mobx-react";
import {RouteComponentProps} from "react-router";
import {BaseComponent} from "../../BaseComponent";

export interface ProfileSummaryListsProps extends RouteComponentProps<{}> {
  challengeList: Challenge[];
  ideaList: Idea[];
  votesList: Idea[];
  myProfile: boolean;
}

export interface ProfileSummaryListsState {}

@observer
export class ProfileSummaryLists extends BaseComponent<ProfileSummaryListsProps, ProfileSummaryListsState> {
  render() {
    const {challengeList, ideaList, votesList, history, location, match, myProfile} = this.props;

    return (
      <div className="ph-summary-list">
        {!_.isNil(challengeList) &&
          challengeList.map((challenge: Challenge) => {
            return <ProfileChallengeCell key={challenge.id} challenge={challenge} history={history} location={location} match={match} myProfile={myProfile} />;
          })}
        {!_.isNil(ideaList) &&
          ideaList.map((idea: Idea) => {
            return <ProfileIdeaCell key={idea.id} idea={idea} isIdea={true} history={history} location={location} match={match} myProfile={myProfile} />;
          })}
        {!_.isNil(votesList) &&
          votesList.map((idea: Idea) => {
            return <ProfileIdeaCell key={idea.id} idea={idea} isIdea={false} history={history} location={location} match={match} myProfile={myProfile} />;
          })}
      </div>
    );
  }
}

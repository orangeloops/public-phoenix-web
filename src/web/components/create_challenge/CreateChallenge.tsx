import moment from "moment";
import * as React from "react";
import {ChangeEvent} from "react";
import {Checkbox, DatePicker} from "antd";
import {BaseComponent} from "../../BaseComponent";
import * as _ from "lodash";
import {CreateChallengeRequest, UpdateChallengeRequest} from "../../../services/store/ChallengeState";
import {Models} from "../../../services";
import {boundMethod} from "autobind-decorator";

const camera = require("../../../assets/images/camera.svg");

export interface CreateChallengeProps {
  challenge?: Models.Challenge;

  onClose: () => void;
}

export interface CreateChallengeState {
  title: string;
  description: string;
  deadLine?: moment.Moment;
  ideasDeadLine?: moment.Moment;
  editImage?: File;
  titlePlaceholder: string;
  challenge?: Models.Challenge;
  editImageUrl: string;
  isLoading: boolean;
  privacy: Models.ChallengePrivacyMode;
  checkValue: boolean;
  domain: string;
}

export class CreateChallenge extends BaseComponent<CreateChallengeProps, CreateChallengeState> {
  constructor(props: CreateChallengeProps) {
    super(props);

    this.state = {
      title: "",
      description: "",
      deadLine: moment().add(1, "M"),
      ideasDeadLine: undefined,
      editImage: undefined,
      titlePlaceholder: "",
      challenge: undefined,
      editImageUrl: "",
      isLoading: false,
      privacy: Models.ChallengePrivacyMode.PUBLIC,
      checkValue: false,
      domain: "",
    };
  }

  componentDidMount() {
    const {userState} = this.store;
    const {challenge} = this.props;

    this.setState({
      challenge: challenge,
      editImageUrl: "",
    });

    if (challenge) {
      this.setState({
        title: challenge.title,
        description: challenge.description,
        ideasDeadLine: challenge.closeDate,
        deadLine: challenge.endDate,
        editImageUrl: challenge.imageUrl,
        privacy: challenge.privacyMode,
        domain: challenge.privacyData,
      });

      if (challenge.privacyMode === Models.ChallengePrivacyMode.BYDOMAIN) {
        this.setState({
          checkValue: true,
        });
      }
    }

    if (userState.currentUser) {
      this.setState({
        domain: userState.currentUser.email.split("@")[1],
        titlePlaceholder: "What is the title of the new challenge, " + userState.currentUser.name + "?",
      });
    }
  }

  @boundMethod
  private handleImageChallengeChange(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (files !== null && files.length === 1) {
      const file = files[0];

      this.setState({
        editImage: file,
        editImageUrl: "",
      });
    }
  }

  @boundMethod
  private handleTitleChange(val: string) {
    this.setState({title: val});
  }

  @boundMethod
  private handleDescriptionChange(val: string) {
    this.setState({description: val});
  }

  @boundMethod
  private handleDeadline(val: moment.Moment) {
    this.setState({deadLine: val});
  }

  @boundMethod
  private handleIdeasDeadline(val: moment.Moment) {
    this.setState({ideasDeadLine: val});
  }

  @boundMethod
  private canCreate(): boolean {
    const {isLoading, description, title, editImage, challenge} = this.state;

    return !isLoading && description !== "" && title !== "" && (editImage !== undefined || !_.isNil(challenge));
  }

  @boundMethod
  private checkChange(event: any) {
    if (event.target.checked) {
      this.setState({
        privacy: Models.ChallengePrivacyMode.BYDOMAIN,
        checkValue: true,
      });
    } else {
      this.setState({
        privacy: Models.ChallengePrivacyMode.PUBLIC,
        checkValue: false,
      });
    }
  }

  @boundMethod
  private handleCreate() {
    const {challengeState} = this.store;
    const {challenge} = this.state;

    this.setState({isLoading: true});

    if (challenge) {
      const request: UpdateChallengeRequest = {
        challenge: challenge,
        title: this.state.title,
        description: this.state.description,
        closeDate: this.state.ideasDeadLine,
        endDate: this.state.deadLine,
        image: this.state.editImage,
        privacyMode: this.state.privacy,
      };

      challengeState.updateChallenge(request).then(response => {
        if (response.success) {
          this.setState({
            challenge: undefined,
            title: "",
            description: "",
            editImage: undefined,
            ideasDeadLine: moment(),
            deadLine: moment(),
            isLoading: false,
          });

          this.props.onClose();
        } else {
          alert("A problem has occurred trying to edit the Challenge");
        }
      });
    } else {
      const request: CreateChallengeRequest = {
        title: this.state.title,
        description: this.state.description,
        closeDate: this.state.ideasDeadLine,
        endDate: this.state.deadLine,
        image: this.state.editImage,
        privacyMode: this.state.privacy,
      };

      challengeState.createChallenge(request).then(response => {
        if (response.success) {
          this.setState({
            title: "",
            description: "",
            editImage: undefined,
            ideasDeadLine: moment(),
            deadLine: moment(),
            isLoading: false,
          });

          this.props.onClose();
        } else {
          alert("A problem has occurred trying to create the Challenge");
        }
      });
    }
  }

  @boundMethod
  private disableDateChallenge(m: moment.Moment | undefined): boolean {
    const {ideasDeadLine} = this.state;

    return (m &&
      m
        .clone()
        .endOf("day")
        .isBefore(ideasDeadLine ? ideasDeadLine : moment()))!;
  }

  @boundMethod
  private disableDateIdeas(m: moment.Moment | undefined): boolean {
    const {deadLine} = this.state;

    return (m &&
      (m
        .clone()
        .endOf("day")
        .isBefore(moment()) ||
        (!_.isNil(deadLine) &&
          m
            .clone()
            .startOf("day")
            .isAfter(deadLine))))!;
  }

  render() {
    const {deadLine, ideasDeadLine, titlePlaceholder, editImage, editImageUrl, challenge, checkValue, domain} = this.state;

    const displayCameraIcon = (
      <div className="ph-load-image-camera-content">
        <img className="ph-load-image-camera" src={camera} />
      </div>
    );
    const uploadButton = (
      <div className="ph-load-image-content">
        {editImageUrl !== "" ? <img className="ph-load-image-wrapper" src={editImageUrl} alt="avatar" /> : editImage ? <img className="ph-load-image-wrapper" src={URL.createObjectURL(editImage)} alt="avatar" /> : displayCameraIcon}
      </div>
    );
    return (
      <div className="ph-create-challenge-container">
        <div className="ph-create-challenge-header">{challenge ? "Edit Challenge" : "New Challenge"}</div>
        <div className="ph-create-challenge-box">
          <input className="ph-create-challenge-input title" value={this.state.title} onChange={event => this.handleTitleChange(event.target.value)} type="text" placeholder={titlePlaceholder} maxLength={200} />
          <div className="ph-create-challenge-image">
            <label htmlFor="imageChallengeSelector">{uploadButton}</label>
            <input type="file" accept="image/*" style={{display: "none", visibility: "hidden"}} id="imageChallengeSelector" onChange={this.handleImageChallengeChange} />
          </div>
          <textarea className="ph-create-challenge-input description" value={this.state.description} placeholder="What is the description?" onChange={event => this.handleDescriptionChange(event.target.value)} />
        </div>
        <div className="ph-create-challenge-deadline-box">
          <div className="ph-create-challenge-deadline-title">Ideas deadline:</div>
          <div className="ph-create-challenge-deadline-title">Challenge deadline:</div>
        </div>

        <div className="ph-create-challenge-deadline-box">
          <DatePicker
            className="ph-create-challenge-date-picker receipt-deadline"
            placeholder="Ideas deadline"
            size="large"
            value={ideasDeadLine}
            format="DD/MM/YYYY"
            onChange={event => this.handleIdeasDeadline(event)}
            disabledDate={this.disableDateIdeas}
          />
          <DatePicker
            className="ph-create-challenge-date-picker deadline"
            placeholder="Challenge deadline"
            size="large"
            value={deadLine}
            format="DD/MM/YYYY"
            onChange={event => this.handleDeadline(event)}
            disabledDate={this.disableDateChallenge}
          />
        </div>

        <div className="ph-create-challenge-checkbox-container">
          <Checkbox checked={checkValue} onChange={event => this.checkChange(event)}>
            Private for my domain ({domain})
          </Checkbox>
        </div>

        <button className="ph-create-challenge-button" disabled={!this.canCreate()} onClick={() => this.handleCreate()}>
          {challenge ? "SAVE" : "CREATE"}
        </button>
      </div>
    );
  }
}

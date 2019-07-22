import * as React from "react";
import {ChangeEvent} from "react";
import {BaseComponent} from "../../BaseComponent";
import * as _ from "lodash";
import {CreateIdeaRequest, UpdateIdeaRequest} from "../../../services/store/IdeaState";
import {Models} from "../../../services";
import {boundMethod} from "autobind-decorator";

export interface CreateIdeaProps {
  idea?: Models.Idea;

  onClose: () => void;
}

export interface CreateIdeaState {
  title: string;
  description: string;
  image?: File;
  titlePlaceholder: string;
  isLoading: boolean;
  editImageUrl: string;
}

export class CreateIdea extends BaseComponent<CreateIdeaProps, CreateIdeaState> {
  constructor(props: CreateIdeaProps) {
    super(props);

    this.state = {
      title: "",
      description: "",
      image: undefined,
      titlePlaceholder: "",
      isLoading: false,
      editImageUrl: "",
    };
  }

  componentDidMount() {
    const {userState} = this.store;
    const {idea} = this.props;

    if (userState.currentUser) {
      this.setState({titlePlaceholder: "What is the title of the new Idea, " + userState.currentUser.name + "?"});
    }
    if (idea) {
      this.setState({
        title: idea.title,
        description: idea.description,
        editImageUrl: idea.imageUrl,
      });
    }
  }

  @boundMethod
  private handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;

    if (files !== null && files.length === 1) {
      const file = files[0];

      this.setState({
        image: file,
        editImageUrl: "",
      });
    }
  }

  @boundMethod
  private handleTitleChange(value: string) {
    this.setState({title: value});
  }

  @boundMethod
  private handleDescriptionChange(value: string) {
    this.setState({description: value});
  }

  @boundMethod
  private canCreate(): boolean {
    const {idea} = this.props;

    return !this.state.isLoading && this.state.description !== "" && this.state.title !== "" && ((_.isNil(idea) && !_.isNil(this.state.image)) || !_.isNil(idea));
  }

  @boundMethod
  private handleCreate() {
    const {ideaState, challengeState} = this.store;
    const {idea} = this.props;

    this.setState({isLoading: true});

    if (idea) {
      const request: UpdateIdeaRequest = {
        idea: idea,
        title: this.state.title,
        description: this.state.description,
        image: this.state.image,
      };

      ideaState.updateIdea(request).then(response => {
        if (response.success) {
          this.setState({
            title: "",
            description: "",
            image: undefined,
            isLoading: false,
          });

          this.props.onClose();
        } else {
          alert("A problem has occurred trying to update this Idea");
          this.setState({isLoading: false});
        }
      });
    } else {
      const currentChallenge = challengeState.currentChallenge;

      if (currentChallenge !== undefined) {
        const request: CreateIdeaRequest = {
          challenge: currentChallenge,
          title: this.state.title,
          description: this.state.description,
          image: this.state.image,
        };
        ideaState.createIdea(request).then(response => {
          if (response.success) {
            this.setState({
              title: "",
              description: "",
              image: undefined,
              isLoading: false,
            });

            this.props.onClose();
          } else {
            alert("A problem has occurred trying to create an Idea");
            this.setState({isLoading: false});
          }
        });
      } else {
        alert("A problem has occurred trying to create the Challenge");
      }
    }
  }

  render() {
    const {idea} = this.props;
    const {image, editImageUrl} = this.state;

    const camera = require("../../../assets/images/camera.svg");

    const displayCameraIcon = (
      <div className="ph-load-image-camera-content">
        <img className="ph-load-image-camera" src={camera} />
      </div>
    );

    const uploadButton = (
      <div className="ph-load-image-content">
        {editImageUrl !== "" ? <img className="ph-load-image-wrapper" src={editImageUrl} alt="avatar" /> : image ? <img className="ph-load-image-wrapper" src={URL.createObjectURL(image)} alt="avatar" /> : displayCameraIcon}
      </div>
    );

    return (
      <div className="ph-create-idea-content-wrapper">
        <div className="ph-create-idea-header">{idea ? "Edit Idea" : "New Idea"}</div>
        <div className="ph-create-idea-box">
          <input className="ph-create-idea-input title" value={this.state.title} onChange={event => this.handleTitleChange(event.target.value)} type="text" placeholder={this.state.titlePlaceholder} maxLength={50} />
          <div className="ph-create-idea-image">
            <label htmlFor="ideaImageSelector">{uploadButton}</label>
            <input type="file" accept="image/*" style={{display: "none", visibility: "hidden"}} id="ideaImageSelector" onChange={this.handleImageChange} />
          </div>
          <textarea className="ph-create-idea-input description" placeholder="What is the description?" value={this.state.description} onChange={event => this.handleDescriptionChange(event.target.value)} />
        </div>
        <button className="ph-create-idea-button" disabled={!this.canCreate()} onClick={() => this.handleCreate()}>
          {idea ? "SAVE" : "CREATE"}
        </button>
      </div>
    );
  }
}

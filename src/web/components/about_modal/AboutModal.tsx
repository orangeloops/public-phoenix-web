import {BaseComponent} from "../../BaseComponent";
import * as React from "react";
import {Icon, Modal} from "antd";
import {boundMethod} from "autobind-decorator";

export interface AboutModalProps {
  onClose: () => void;
}

export interface AboutModalState {
  showAbout: boolean;
}

export class AboutModal extends BaseComponent<AboutModalProps, AboutModalState> {
  state = {
    showAbout: false,
  };

  @boundMethod
  private handleClose() {
    const {props} = this;

    props.onClose();
  }

  render() {
    return (
      <Modal visible={true} footer={null} className="ph-modal ph-about-modal" width="" onCancel={this.handleClose}>
        <div className="ph-about-modal-content-container">
          <a className="ph-about-modal-what-is" target="_blank" href="https://ideasource.io/">
            What is IdeaSource?
          </a>

          <div className="ph-about-modal-separator" />

          <div className="ph-about-modal-built-by">IdeaSource is built by</div>
          <a className="ph-about-modal-orangeloops-logo-wrapper" target="_blank" href="http://orangeloops.com">
            <div className="ph-about-modal-orangeloops-logo" />
          </a>
          <div className="ph-about-modal-follow-us">Follow us</div>
          <div className="ph-about-modal-social-media-container">
            <a target="_blank" href="https://twitter.com/orangeloopsinc">
              <Icon type="twitter" className="ph-about-modal-twitter-icon" />
            </a>
            <a target="_blank" href="https://www.facebook.com/orangeloops">
              <Icon type="facebook" className="ph-about-modal-facebook-icon" theme="filled" />
            </a>
          </div>

          <div className="ph-about-modal-separator" />

          <a className="ph-about-modal-terms-of-use" target="_blank" href="https://ideasource.io/terms-of-use.html">
            Terms of Use
          </a>
          <a className="ph-about-modal-privacy-policy" target="_blank" href="https://ideasource.io/privacy-policy.html">
            Privacy Policy
          </a>
        </div>
      </Modal>
    );
  }
}

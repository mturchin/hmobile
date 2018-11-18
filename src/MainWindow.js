import React, { Component } from 'react';
import { Input, Button, Icon } from 'semantic-ui-react'

let friendID;

class MainWindow extends Component {

  callWithVideo(video) {
    const config = { audio: true };
    config.video = video;
    return () => this.props.startCall(true, friendID, config);
  }
  render() {
    const { clientId } = this.props;
    document.title = `${clientId} - VideoCall`;
    return (
      <div className="container main-window">
        <div>

          <h4>Get started by calling a friend below</h4>
        </div>
        <div>
          <Input placeholder='Your friend ID'
          onChange={event => friendID = event.target.value}
          />

          <div>
            <Button
              className="btn-action fa fa-video-camera"
              onClick={this.callWithVideo(true)}
            >
            Call
              <span className="btn_span"></span>
              <Icon name='microphone' />
              <Icon name='camera' />
            </Button>
            <Button
              className="btn-action fa fa-phone"
              onClick={this.callWithVideo(false)}
            >
              Call
              <span className="btn_span"></span>
              <Icon name='microphone' />
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default MainWindow;

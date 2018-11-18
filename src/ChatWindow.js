import React, { Component } from 'react';
import { Divider, Label, Message, Card, Input, Button, Icon, Grid, Image } from 'semantic-ui-react'
import './App.css';
import moment from 'moment'
import socket from './socket';

class ChatWindow extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  componentDidMount() {

  }

  render() {
    console.log('chat')
    return (
      <div>
        <div className='chat_history'>
          {this.props.messages.map(x=> {
            console.log(x);
            return <div className={x.sendBy === this.props.clientId? 'message_me':'message_other' }>
            <Message
            color={x.sendBy === this.props.clientId? 'green':'purple' }>
            {x.message}
            </Message>
            <span>{moment(x.timestamp).fromNow()}</span>
            </div>
          })
          }
        </div>
        <div>
          <Input type='text' placeholder='...' action>
            <input onChange={this.props.onMessageChange}/>

            <Button color='facebook' type='submit'  onClick={this.props.onSubmit}>
            <Icon name='rocketchat' />

            Chat
          </Button>

          </Input>
          <div className="ui middle aligned aligned grid container upload_files">
            <div className="ui fluid segment">
            <input type="file" onChange={this.fileEvent} className="inputfile" id="embedpollfileinput" />

            <label for="embedpollfileinput" className="ui green right floated button">
              <i className="ui upload icon"></i>
              Upload image
            </label>

            </div>

          </div>
        </div>
      </div>

    );
  }
}

export default ChatWindow;

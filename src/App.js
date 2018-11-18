import React, { Component } from 'react';
import './App.css';
import socket from './socket';
import _ from 'lodash';
import moment from 'moment'
import logo from './logo.svg';
import PeerConnection from './PeerConnection';
import MainWindow from './MainWindow';
import CallWindow from './CallWindow';
import CallModal from './CallModal';
import { Label, Message, Card, Input, Button, Icon, Grid, Image } from 'semantic-ui-react'
var QRCode = require('qrcode.react');

function subscribeToTimer(cb) {
  socket.on('timer', timestamp => cb(null, timestamp));
  socket.emit('subscribeToTimer', 1000);
}
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timestamp: 'no timestamp yet',
      message:'here',
      messages: [],
      clientId: '',
      callWindow: '',
      callModal: '',
      callFrom: '',
      localSrc: null,
      peerSrc: null,
      seconds:0,
      mins:0,
      hours: 0,
      secondsUI: '00',
      minsUI:'00:',
      hoursUI: '00:',

    };
    this.onMessageChange= this.onMessageChange.bind(this);
    this.addMessage= this.addMessage.bind(this);
    this.onSubmit=this.onSubmit.bind(this);
    this.pc = {};
    this.config = null;
    this.startCallHandler = this.startCall.bind(this);
    this.endCallHandler = this.endCall.bind(this);
    this.rejectCallHandler = this.rejectCall.bind(this);
    this.startTimer = this.startTimer.bind(this);

    var self = this;
    socket.on('RECEIVE_MESSAGE', function(data){
      console.log('RECEIVE_MESSAGE', data)
      self.addMessage(data);
      if(!this.timex){
        self.startTimer();
      }
    })
      .on('init', data => this.setState({ clientId: data.id }))
      .on('request', data => this.setState({ callModal: 'active', callFrom: data.from }))
      .on('call', (data) => {
        if (data.sdp) {
          this.pc.setRemoteDescription(data.sdp);
          if (data.sdp.type === 'offer') this.pc.createAnswer();
        } else this.pc.addIceCandidate(data.candidate);
      })
      .on('end', this.endCall.bind(this, false))
      .emit('init');
  }
  componentDidMount() {
    subscribeToTimer((err, timestamp) => this.setState({
       timestamp
     }));
  }


    startCall(isCaller, friendID, config) {
      this.config = config;
      this.pc = new PeerConnection(friendID)
        .on('localStream', (src) => {
          const newState = { callWindow: 'active', localSrc: src };
          if (!isCaller) newState.callModal = '';
          this.setState(newState);
        })
        .on('peerStream', src => this.setState({ peerSrc: src }))
        .start(isCaller, config);
    }

    rejectCall() {
      socket.emit('end', { to: this.state.callFrom });
      this.setState({ callModal: '' });
    }

    endCall(isStarter) {
      if (_.isFunction(this.pc.stop)) this.pc.stop(isStarter);
      this.pc = {};
      this.config = null;
      this.setState({
        callWindow: '',
        localSrc: null,
        peerSrc: null
      });
    }
  addMessage = data => {
    console.log(data);
    this.setState({messages: [...this.state.messages, data]});
    console.log(this.state.messages);
  }
  onMessageChange(e){
    this.setState({message: e.target.value});

  }
  onSubmit(){
    if(!this.timex){
      this.startTimer();
    }
    socket.emit('SEND_MESSAGE', {
      message:  this.state.message,
      sendBy: this.state.clientId,
      timestamp: new Date(),
    })
  }

  startTimer(){
    var self = this;
    this.timex = setTimeout(function(){
      var seconds =  self.state.seconds;
      var mins =  self.state.mins;
      var hours =  self.state.hours;
      seconds++
      if(seconds > 59){
          seconds=0;
          mins++;
         if(mins>59) {
           mins=0;
           hours++;
           if(hours <10) {
             self.setState({hoursUI: hours+':'})
         }
       }

      if(mins<10){
        self.setState({minsUI:'0' + mins+':'})

      }else {
         self.setState({minsUI: mins+':'})

       };
     }
      if(seconds <10) {
        self.setState({secondsUI: '0' + seconds})
      }else {
        self.setState({secondsUI: seconds })
      }
      self.setState({seconds, mins, hours })
      console.log("hours", hours, "mins", mins, "seconds", seconds)
      self.startTimer();
    },1000);
  }

  render() {
    return (
      <div className="App">
        <div  className="App">

        <Grid celled='internally'  className="App">
          <Grid.Row>
            <Grid.Column width={3}>
            <Card>
               <Card.Content header='About you' />
               <Card.Content>
               Your caller Id is
                <Label as='a'>{this.state.clientId}</Label>

               </Card.Content>
               <Card.Content extra>
                 <Icon name='user' />
                 Visit 4 times
               </Card.Content>
             </Card>
             <Card>
                <Card.Content header={'Current Session'} />
                <Card.Content>
                  <Icon name='clock outline' />
                  <div id="timer">
                    <span id="hours">{this.state.hoursUI}</span>
                    <span id="mins">{this.state.minsUI}</span>
                    <span id="seconds">{this.state.secondsUI}</span>
                  </div>
                </Card.Content>
                <Card.Content>
                  {this.state.callFrom && <QRCode value={this.state.callFrom} />}
                  <Button icon labelPosition='left'  color='green'>
                    Pay Now
                  <Icon name='money' />
                  </Button>
                </Card.Content>

              </Card>

            </Grid.Column>
            <Grid.Column width={8}>
            <MainWindow
              clientId={this.state.clientId}
              startCall={this.startCallHandler}
            />
            {this.state.callWindow === 'active' && <CallWindow
              status={this.state.callWindow}
              localSrc={this.state.localSrc}
              peerSrc={this.state.peerSrc}
              config={this.config}
              mediaDevice={this.pc.mediaDevice}
              endCall={this.endCallHandler}
            />}
            {this.state.callFrom && this.state.callModal === 'active' &&
              <CallModal
                status={this.state.callModal}
                startCall={this.startCallHandler}
                rejectCall={this.rejectCallHandler}
                callFrom={this.state.callFrom}
              />
            }


            </Grid.Column>
            <Grid.Column width={5}>
            <div>
              <div className='chat_history'>
                {this.state.messages.map(x=> {
                  console.log(x);
                  return <div className={x.sendBy === this.state.clientId? 'message_me':'message_other' }>
                  <Message
                  color={x.sendBy === this.state.clientId? 'green':'purple' }>
                  {x.message}
                  </Message>
                  <span>{moment(x.timestamp).fromNow()}</span></div>
                })
                }
              </div>
              <div>
                <Input type='text' placeholder='...' action>
                  <input onChange={this.onMessageChange}/>

                  <Button color='facebook' type='submit'  onClick={this.onSubmit}>
                  <Icon name='rocketchat' />

                  Chat
                </Button>

                </Input>
                <div>{this.state.timestamp}</div>
              </div>
            </div>

            </Grid.Column>
          </Grid.Row>

        </Grid>


        </div>
      </div>
    );
  }
}

export default App;

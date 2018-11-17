import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import socket from './socket';
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
      messages: []

    };
    this.onMessageChange= this.onMessageChange.bind(this);
    this.addMessage= this.addMessage.bind(this);
    this.onSubmit=this.onSubmit.bind(this);
    var self = this;
    socket.on('RECEIVE_MESSAGE', function(data){
      console.log('RECEIVE_MESSAGE', data)
      self.addMessage(data);
    })
  }
  componentDidMount() {


    subscribeToTimer((err, timestamp) => this.setState({
       timestamp
     }));
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
    socket.emit('SEND_MESSAGE', {
      message:  this.state.message
    })
  }

  render() {
    return (
      <div className="App">
        This is the timer value: {this.state.timestamp}
        {this.state.messages.map(x=> { console.log(x) ;return <p>{x.message}</p>})}
        <input value={this.state.message} onChange={this.onMessageChange}/>
        <button onClick={this.onSubmit}>Send</button>
      </div>
    );
  }
}

export default App;

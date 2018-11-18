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
    this.loadCamera=this.loadCamera.bind(this);
    this.videoRef = React.createRef();
    this.canvasRef = React.createRef();


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

     navigator.getUserMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msgGetUserMedia );

     if(navigator.getUserMedia){
         navigator.getUserMedia({video: true, audio: false},this.loadCamera,this.loadFail);
     }

     if(navigator.mediaDevices){
       const constraints = {
           video: {
             facingMode: 'user',
             height: { min: 360, ideal: 720, max: 1080 }
           },
           audio: true
         };
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          console.log("getUserMedia", stream)
          this.stream = stream;
          this.emit('stream', stream);
        })
        .catch(err => console.log(err));

     }
     console.log(this.canvasRef.current)
     if(this.canvasRef.current){



       var context = this.canvasRef.current.getContext('2d');
       console.log("context", context)
       this.canvasRef.current.width = 900;
       this.canvasRef.current.height = 700;

       context.width = this.canvasRef.current.width;
       context.height = this.canvasRef.current.height;

       var self = this;
       // setInterval(function(){
       //   // console.log("self.videoRef.current", self.videoRef.current)
       //
       //     self.viewVideo(self.videoRef.current, context);
       // },0.001);
     }

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
  // logger(msg){
  //     $('#logger').text(msg);
  // }

  loadCamera(stream){
    if(this.videoRef.current){
      this.videoRef.current.src = window.URL.createObjectURL(stream);
      console.log("Camera connected");
    }

  }

  loadFail(){
      console.log("Camera not connected");
  }

  viewVideo(video,context){
      context.drawImage(video,0,0,context.width,context.height);
      socket.emit('stream',this.canvasRef.current.toDataURL('image/webp'));
  }



  render() {
    return (
      <div className="App">
        <div>This is the timer value: {this.state.timestamp}</div>

        <video
        ref={this.videoRef}
        src=""
        id="video"
        style={{width:'700px', height: '350px'}} autoplay="true">
        </video>

        <canvas id="preview" ref={this.canvasRef}></canvas>
        {this.state.messages.map(x=> { console.log(x) ;return <p>{x.message}</p>})}
        <input value={this.state.message} onChange={this.onMessageChange}/>
        <button onClick={this.onSubmit}>Send</button>
      </div>
    );
  }
}

export default App;

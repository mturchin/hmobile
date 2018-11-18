import openSocket from 'socket.io-client';
var url = 'https://8080-dot-3799353-dot-devshell.appspot.com/?authuser=0' || 'http://localhost:4200'
const  socket = openSocket(url);

export default socket;

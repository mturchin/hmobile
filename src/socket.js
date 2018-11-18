import openSocket from 'socket.io-client';
var url = process.env.PORT|| 'http://localhost:4200'
const  socket = openSocket(url);

export default socket;

import openSocket from 'socket.io-client';
const  socket = openSocket('http://localhost:4200');

export default socket;

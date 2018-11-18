//Source: https://github.com/nguymin4/react-videocall/blob/master/server/lib/server.js

const express = require('express');
const { createServer } = require('http');
const io = require('socket.io');

const app = express();
const server = createServer(app);
var cors = require('cors')

app.use(cors())

app.use(express.static(__dirname + '/build'));

app.get('*', function(req, res){
  res.sendfile(__dirname + '/build/index.html');
});
// app.get('/', express.static(`${process.cwd()}/../build/index.html`));
console.log(`${process.cwd()}/build/index.html`)


// [START hello_world]
// Say hello!
app.get('/test', (req, res) => {
  res.status(200).send('Hello, world!');
});

module.exports.run = (config) => {
  server.listen(config.PORT);
  console.log(`Server is listening at :${config.PORT}`);
  io.listen(server, { log: true,  origins: '*:*' })
    .on('connection', (client) => {
      client.on('subscribeToTimer', (interval) => {
        console.log('client is subscribing to timer with interval ', interval);
        setInterval(() => {
          client.emit('timer', new Date());
        }, interval);
      });

      client.on('SEND_MESSAGE', function(data){
            console.log('SEND_MESSAGE', data);
            client.emit('RECEIVE_MESSAGE', data);
            client.broadcast.emit('RECEIVE_MESSAGE',data);

        });
    })

};

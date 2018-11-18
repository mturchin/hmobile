//Source: https://github.com/nguymin4/react-videocall/blob/master/server/lib/server.js

const express = require('express');
const { createServer } = require('http');
const io = require('socket.io');
const haiku = require('./haiku');

const app = express();
const server = createServer(app);
var cors = require('cors')
const userIds = {};
const noop = () => {};

app.use(cors())

app.use(express.static(__dirname + '/build'));

app.get('*', function(req, res){
  res.sendfile(__dirname + '/build/index.html');
});
// app.get('/', express.static(`${process.cwd()}/../build/index.html`));
console.log(`${process.cwd()}/build/index.html`)

/**
 * Random ID until the ID is not in use
 */
function randomID(callback) {
  const id = haiku();
  if (id in userIds) setTimeout(() => haiku(callback), 5);
  else callback(id);
}

/**
 * Send data to friend
 */
function sendTo(to, done, fail) {
  const receiver = userIds[to];
  if (receiver) {
    const next = typeof done === 'function' ? done : noop;
    next(receiver);
  } else {
    const next = typeof fail === 'function' ? fail : noop;
    next();
  }
}
// [START hello_world]
// Say hello!
app.get('/test', (req, res) => {
  res.status(200).send('Hello, world!');
});

module.exports.run = (config) => {
  server.listen(config.PORT);
  console.log(`Server is listening at :${config.PORT}`);
  let id;

  io.listen(server, { log: true,  origins: '*:*' })
    .on('connection', (client) => {
      client.on('subscribeToTimer', (interval) => {
        console.log('client is subscribing to timer with interval ', interval);
        setInterval(() => {
          client.emit('timer', new Date());
        }, interval);
      });
        client.on('init', () => {
          randomID((_id) => {
          id = _id;
          userIds[id] = client;
          client.emit('init', { id });
          });
        })
        client.on('request', (data) => {
          sendTo(data.to, to => to.emit('request', { from: id }));
        })
        client.on('call', (data) => {
          sendTo(
          data.to,
          to => to.emit('call', { ...data, from: id }),
          () => client.emit('failed')
          );
        })
        client.on('end', (data) => {
          sendTo(data.to, to => to.emit('end'));
        })
      client.on('stream',function(image){
            console.log('stream', image);
            client.broadcast.emit('stream',image);
        });
      client.on('SEND_MESSAGE', function(data){
            console.log('SEND_MESSAGE', data);
            client.emit('RECEIVE_MESSAGE', data);
            client.broadcast.emit('RECEIVE_MESSAGE',data);

        });
    })

};

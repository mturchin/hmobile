const server = require('./server');



if (module === require.main) {
  // [START server]
  // Start the server
  server.run({PORT:process.env.PORT || 8080});
  // [END server]
}

module.exports = server;

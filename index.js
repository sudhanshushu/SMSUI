var server = require('./server');

server.start(function () {
  console.log('server started: ', server.info);
});
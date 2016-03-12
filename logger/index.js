var winston = require('winston')
 , config = require('../configuration');

function Logger(){
  var transports = [];

  if(config.getEnv() === 'development') {
    transports.push(new (winston.transports.Console)());
  } else {
    transports.push(new winston.transports.File({
      filename: config.get('logger:filename'),
      maxsize: 1048576,
      maxFiles: 3,
      level: config.get('logger:level'),
      logstash: true
    }));
  }

  return new (winston.Logger)({
    transports: transports
  });
}

module.exports = Logger();
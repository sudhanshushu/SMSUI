var nconf = require('nconf');

function Config(){
  nconf.argv().env('_');
  nconf.use('memory');

  var environment = nconf.get('NODE:ENV') || 'development';
  console.log('Running the application with environment : ' + environment);
  var envCgf = nconf.get('NODE:CONFIG:FILE');
  console.log('Environment specific config file : ' + envCgf);
  if(envCgf) nconf.file(environment, envCgf);
  nconf.file('default', 'config/default.json');
}

Config.prototype.get = function(key) {
  return nconf.get(key);
};

Config.prototype.getEnv = function() {
  return nconf.get('NODE:ENV') || 'development';
};

module.exports = new Config();
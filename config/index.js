var config;

// keys.js - figure out what set of credentials to return
if (process.env.NODE_ENV === 'production') {
  // we are in production - return the prod set of keys
  config = require('./prod')
} else {
  // we are in development - return the dev keys!!!
  // config = require('./dev')//Change by alon 29.7.22 9:47
  config = require('./prod')

}
module.exports = config
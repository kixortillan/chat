// Download the Node helper library from twilio.com/docs/node/install
// These are your accountSid and authToken from https://www.twilio.com/console
const accountSid = 'ACccdbde3baf9757a233e97b2a771d5200';
const authToken = 'your_auth_token';

const client = require('twilio')(accountSid, authToken);
var ctoken;
client.api.accounts('ACaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa').tokens
  .create({})
  .then((token) => {
  	console.log(token.username);
  	ctoken = token;
  });

module.exports = ctoken;
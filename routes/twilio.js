var express = require('express');
var http = require('http').Server(express);
var router = express.Router();
//var turn = require('../lib/turn');

/* GET home page. */
router.get('/', function(req, res, next) {

  var accountSid = 'ACccdbde3baf9757a233e97b2a771d5200';
  var authToken = '713251f467dab1374fc9c27541ffb6f2';
  var client = require('twilio')(accountSid, authToken);

  client.tokens.create({}, function(err, token) {
      //console.log(token);
      //res.render('index', { iceServers: JSON.stringify(token.ice_servers) });
      res.json({ iceServers: token.ice_servers });
  });

});

module.exports = router;

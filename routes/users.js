var express = require('express');
var router = express.Router();
var Users = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  
  Users.find().then(function(users) {
  	res.json({users: users});
  });

});

module.exports = router;

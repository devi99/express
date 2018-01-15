var express = require('express');
var router = express.Router();

// Require our controllers.
var question_controller = require('../controllers/questionController'); 

// GET game listing.
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/// QUESTION ROUTES ///

// GET request for list of all Questions.
router.get('/questions', question_controller.question_list);

// GET request for creating a Question. NOTE This must come before route that displays Genre (uses id).
router.get('/question/create', question_controller.question_create_get);

module.exports = router;

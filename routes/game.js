var express = require('express');
var router = express.Router();

// Require our controllers.
var question_controller = require('../controllers/questionController'); 

// GET game listing.
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/// QUESTION ROUTES ///

// GET request for creating a Question. NOTE This must come before route that displays question (uses id).
router.get('/question/create', question_controller.question_create_get);

// POST request for creating Question.
router.post('/question/create', question_controller.question_create_post);

// GET request to delete question.
router.get('/question/:id/delete', question_controller.question_delete_get);

// POST request to delete question.
router.post('/question/:id/delete', question_controller.question_delete_post);

// GET request to update question.
router.get('/question/:id/update', question_controller.question_update_get);

// POST request to update question.
router.post('/question/:id/update', question_controller.question_update_post);

// GET request for one question.
router.get('/question/:id', question_controller.question_detail);

// GET request for list of all Questions.
router.get('/questions', question_controller.question_list);

module.exports = router;

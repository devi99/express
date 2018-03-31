var express = require('express');
var router = express.Router();

// Require our controllers.
var question_controller = require('../controllers/questionController'); 
var game_controller = require('../controllers/gameController'); 

/// GAME ROUTES ///

// GET game home page.
router.get('/', game_controller.game_index);  

// GET game home page.
router.get('/list', game_controller.game_list);  

// GET request for creating a Game.
router.get('/create', game_controller.game_create_get);

// POST request for creating Question.
router.post('/create', game_controller.game_create_post);

// GET request for one question.
router.get('/:id', game_controller.game_detail);

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

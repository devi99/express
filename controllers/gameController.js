var Game = require('../models/game');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var async = require('async');

exports.game_index = function(req, res) {

    async.parallel({
        Game_count: function(callback) {
            Game.count(callback);
        },
    }, function(err, results) {
        res.render('game_index', { title: 'Let us play a Quiz', error: err, data: results });
    });
};

// Display list of all games.
exports.game_list = function(req, res, next) {

    Game.find()
      .exec(function (err, list_games) {
        if (err) { return next(err); }
        // Successful, so render
        res.render('game_list', { title: 'game List', game_list:  list_games});
      });
  
};
  
  // Display detail page for a specific game.
exports.game_detail = function(req, res, next) {
  
      async.parallel({
          game: function(callback) {
  
              Game.findById(req.params.id)
                .exec(callback);
          },
  
      }, function(err, results) {
          if (err) { return next(err); }
          if (results.game==null) { // No results.
              var err = new Error('game not found');
              err.status = 404;
              return next(err);
          }
          // Successful, so render.
          res.render('game_detail', { title: 'Title', game:  results.game } );
      });
  
  };

exports.game_create_get = function(req, res, next) {
    console.log("game_create_get");
    res.render('game_form', { title: 'Create Game' });
};
// Handle game create on POST.
exports.game_create_post = [
    
    // Validate fields.
    //body('game', 'game must not be empty.').isLength({ min: 1 }).trim(),
    //body('correctAnswer', 'correctAnswer must not be empty.').isLength({ min: 1 }).trim(),

  
    // Sanitize fields.
    sanitizeBody('*').trim().escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Game object with escaped and trimmed data.
        var game = new Game(
          { gameId: ( Math.random() * 100000 ) | 0,
            gameStatus: 'Not started',
            gameType:'0',
            numberOfPlayers:2
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({

            }, function(err, results) {
                if (err) { return next(err); }
                console.log("game render"),
                res.render('game_form', { title: 'Create Game',game: game, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save game.
            game.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new game record.
                   res.redirect(game.url);
                });
        }
    }
];



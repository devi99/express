var Question = require('../models/question');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var async = require('async');

exports.game_index = function(req, res) {

    async.parallel({
        question_count: function(callback) {
            Question.count(callback);
        },
    }, function(err, results) {
        res.render('game_index', { title: 'Let us play a Quiz', error: err, data: results });
    });
};


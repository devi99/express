var Question = require('../models/question');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var async = require('async');

exports.index = function(req, res) {

    async.parallel({
        question_count: function(callback) {
            Question.count(callback);
        },
    }, function(err, results) {
        res.render('index', { title: 'Local Library Home', error: err, data: results });
    });
};


// Display list of all questions.
exports.question_list = function(req, res, next) {

  Question.find({}, 'question ')
    .exec(function (err, list_questions) {
      if (err) { return next(err); }
      // Successful, so render
      res.render('question_list', { title: 'Question List', question_list:  list_questions});
    });

};

// Display detail page for a specific question.
exports.question_detail = function(req, res, next) {

    async.parallel({
        question: function(callback) {

            Question.findById(req.params.id)
              .populate('author')
              .populate('genre')
              .exec(callback);
        },
        question_instance: function(callback) {

          QuestionInstance.find({ 'question': req.params.id })
          .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.question==null) { // No results.
            var err = new Error('Question not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('question_detail', { title: 'Title', question:  results.question, question_instances: results.question_instance } );
    });

};

// Display question create form on GET.
exports.question_create_get = function(req, res, next) {

    res.render('question_form', { title: 'Create Question' });

    // Get all authors and genres, which we can use for adding to our question.
/*     async.parallel({
        authors: function(callback) {
            Author.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
    }); */

};

// Handle question create on POST.
exports.question_create_post = [
    // Convert the genre to an array.
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre==='undefined')
            req.body.genre=[];
            else
            req.body.genre=new Array(req.body.genre);
        }
        next();
    },

    // Validate fields.
    body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    body('author', 'Author must not be empty.').isLength({ min: 1 }).trim(),
    body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
    body('isbn', 'ISBN must not be empty').isLength({ min: 1 }).trim(),
  
    // Sanitize fields.
    sanitizeBody('*').trim().escape(),
    sanitizeBody('genre.*').trim().escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Question object with escaped and trimmed data.
        var question = new Question(
          { title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                authors: function(callback) {
                    Author.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (question.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                res.render('question_form', { title: 'Create Question',authors:results.authors, genres:results.genres, question: question, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save question.
            question.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new question record.
                   res.redirect(question.url);
                });
        }
    }
];



// Display question delete form on GET.
exports.question_delete_get = function(req, res, next) {

    async.parallel({
        question: function(callback) {
            Question.findById(req.params.id).populate('author').populate('genre').exec(callback);
        },
        question_questioninstances: function(callback) {
            QuestionInstance.find({ 'question': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.question==null) { // No results.
            res.redirect('/catalog/questions');
        }
        // Successful, so render.
        res.render('question_delete', { title: 'Delete Question', question: results.question, question_instances: results.question_questioninstances } );
    });

};

// Handle question delete on POST.
exports.question_delete_post = function(req, res, next) {

    // Assume the post has valid id (ie no validation/sanitization).

    async.parallel({
        question: function(callback) {
            Question.findById(req.params.id).populate('author').populate('genre').exec(callback);
        },
        question_questioninstances: function(callback) {
            QuestionInstance.find({ 'question': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.question_questioninstances.length > 0) {
            // Question has question_instances. Render in same way as for GET route.
            res.render('question_delete', { title: 'Delete Question', question: results.question, question_instances: results.question_questioninstances } );
            return;
        }
        else {
            // Question has no QuestionInstance objects. Delete object and redirect to the list of questions.
            Question.findByIdAndRemove(req.body.id, function deleteQuestion(err) {
                if (err) { return next(err); }
                // Success - got to questions list.
                res.redirect('/catalog/questions');
            });

        }
    });

};

// Display question update form on GET.
exports.question_update_get = function(req, res, next) {

    // Get question, authors and genres for form.
    async.parallel({
        question: function(callback) {
            Question.findById(req.params.id).populate('author').populate('genre').exec(callback);
        },
        authors: function(callback) {
            Author.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.question==null) { // No results.
                var err = new Error('Question not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            // Mark our selected genres as checked.
            for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
                for (var question_g_iter = 0; question_g_iter < results.question.genre.length; question_g_iter++) {
                    if (results.genres[all_g_iter]._id.toString()==results.question.genre[question_g_iter]._id.toString()) {
                        results.genres[all_g_iter].checked='true';
                    }
                }
            }
            res.render('question_form', { title: 'Update Question', authors:results.authors, genres:results.genres, question: results.question });
        });

};


// Handle question update on POST.
exports.question_update_post = [

    // Convert the genre to an array.
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre==='undefined')
            req.body.genre=[];
            else
            req.body.genre=new Array(req.body.genre);
        }
        next();
    },
   
    // Validate fields.
    body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    body('author', 'Author must not be empty.').isLength({ min: 1 }).trim(),
    body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
    body('isbn', 'ISBN must not be empty').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody('title').trim().escape(),
    sanitizeBody('author').trim().escape(),
    sanitizeBody('summary').trim().escape(),
    sanitizeBody('isbn').trim().escape(),
    sanitizeBody('genre.*').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Question object with escaped/trimmed data and old id.
        var question = new Question(
          { title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
            _id:req.params.id // This is required, or a new ID will be assigned!
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form
            async.parallel({
                authors: function(callback) {
                    Author.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (question.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                res.render('question_form', { title: 'Update Question',authors:results.authors, genres:results.genres, question: question, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Question.findByIdAndUpdate(req.params.id, question, {}, function (err,thequestion) {
                if (err) { return next(err); }
                   // Successful - redirect to question detail page.
                   res.redirect(thequestion.url);
                });
        }
    }
];


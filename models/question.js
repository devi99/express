var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var QuestionSchema = new Schema({
    question: {type: String, required: true},
    correctAnswer: {type: String, required: true},
    fakeAnswer1: {type: String, required: false},
    fakeAnswer2: {type: String, required: false},
    fakeAnswer3: {type: String, required: false},
    fakeAnswer4: {type: String, required: false},
    fakeAnswer5: {type: String, required: false}
});

// Virtual for this question instance URL.
QuestionSchema
.virtual('url')
.get(function () {
  return '/game/question/'+this._id;
});

// Export model.
module.exports = mongoose.model('Question', QuestionSchema);

const mongoose = require('mongoose')

const Schema = mongoose.Schema

// Create a new schema for uploaded documents
const QuestionSchema = new Schema({
  question: String,
  answer: String,
  uploadDate: {
    type: Date,
    default: Date.now,
  },

})

// Create a model from the schema
const Question = mongoose.model(
  'Question',
  QuestionSchema
)

module.exports = Question
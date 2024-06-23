const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema for survey answers
const answerSchema = new Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  response: { type: Schema.Types.Mixed, required: true }
});

// Define the schema for survey questions
const questionSchema = new Schema({
  questionId: { type: String, required: true },
  questionText: { type: String, required: true },
  questionType: { type: String, required: true },
  options: [{ id: String, text: String }], // Only for multiple_choice questions
  answers: [answerSchema],
  analytics: {
    totalResponses: { type: Number, default: 0 },
    distribution: { type: Map, of: Number }, // Flexible key-value pairs for different types of questions
    averageRating: Number,
    responseRate: String,
    mostCommonResponse: Schema.Types.Mixed, // Flexible to handle different types of responses
    sentimentAnalysis: {
      positive: Number,
      neutral: Number,
      negative: Number
    }
  }
});

// Define the schema for the survey
const surveySchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  questions: [questionSchema]
});

// Create the model
const Survey = mongoose.model('Survey', surveySchema);

module.exports = Survey;

const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema for survey answers
const answerSchema = new Schema({
  // userId: { type: String, required: true },
  username: { type: String, required: [true, "Username is required"] },
  response: { type: Schema.Types.Mixed, required: [true, "Response field is required"] }
});

// Define the schema for survey options
const optionSchema = new Schema({
  id: { type: String, required: [true, "Options Id is required"]},
  text: { type: String,  required: [true, "Option text is required"]} 
});

// Define the schema for survey questions
const questionSchema = new Schema({
  questionId: { type: String, required: [true, "Question Id is required"] },
  questionText: { type: String, required: [true, "Question Text is required"] },
  questionType: { type: String, required: [true, "Question Type is required"], enum: {
    values: ['multiple_choice', 'five_point', 'fill_in'],
    message: 'Question type must be either "multiple_choice", "five_point", or "fill_in"'
  }},
  options: {
    type:[optionSchema], // Only for multiple_choice questions
    validate: {
      validator: function(options) {
        if (this.questionType === 'multiple_choice') {
          return options && options.length > 0;
        }
        return true;
      },
      message: 'Options are required for multiple_choice questions'
    }
  },
  answers: [answerSchema], // Reference answer documents
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
    user_id:{
     type: mongoose.Schema.Types.ObjectId,
    required: [true, "User ID is required"]
    },
    title: {
     type: String,
     required: [true, "Title field is required"]
    },
    participants: {
     type: Number,
     default: 0
    },
    point: {
     type: String,
    },
    duration:{
     type: Number,
    },
    preferred_participants: {
     type: Array,
    },
    max_participant: {
     type: Number,
    },
    description: { type: String, required: [true, "Description Field is required"]},
    questions: [questionSchema],// reference question documents
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});


const Survey = mongoose.model('Survey', surveySchema);


module.exports = {Survey};

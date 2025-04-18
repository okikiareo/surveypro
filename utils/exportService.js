const createCsvString = (data) => {
  if (!data || !data.length) return '';
  
  // Extract headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  const headerRow = headers.join(',');
  
  // Create data rows
  const rows = data.map(item => {
    return headers.map(header => {
      // Handle values that might contain commas or quotes
      let value = item[header];
      
      // Convert arrays and objects to JSON strings
      if (value !== null && typeof value === 'object') {
        value = JSON.stringify(value);
      }
      
      // Convert to string and escape quotes
      value = String(value).replace(/"/g, '""');
      
      // Wrap in quotes if contains commas, quotes, or newlines
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        value = `"${value}"`;
      }
      
      return value;
    }).join(',');
  });
  
  // Combine header and data rows
  return [headerRow, ...rows].join('\n');
};

const formatSurveyDataForCsv = (survey) => {
  // Basic survey information
  const surveyInfo = {
    title: survey.title,
    description: survey.description,
    createdAt: survey.createdAt,
    totalParticipants: survey.submittedUsers.length,
    maxParticipants: survey.no_of_participants,
    gender: survey.gender,
    preferred_participants: survey.preferred_participants.join(', ')
  };
  
  // Process questions and responses
  const questionResponses = [];
  
  survey.questions.forEach(question => {
    // For each question, prepare its analytics
    const analytics = {
      questionId: question._id.toString(),
      questionText: question.questionText,
      questionType: question.questionType,
      totalResponses: question.answers.length
    };
    
    // Add type-specific analytics
    if (question.questionType === 'multiple_choice') {
      // Create a distribution map for each option
      const distribution = {};
      question.options.forEach(option => {
        distribution[option.text] = 0;
      });
      
      // Count responses for each option
      question.answers.forEach(answer => {
        if (distribution[answer.response] !== undefined) {
          distribution[answer.response]++;
        }
      });
      
      analytics.distribution = distribution;
      
      // Find most common response
      let maxCount = 0;
      let mostCommon = null;
      Object.entries(distribution).forEach(([option, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mostCommon = option;
        }
      });
      analytics.mostCommonResponse = mostCommon;
      
    } else if (question.questionType === 'five_point') {
      // Calculate average rating
      let sum = 0;
      question.answers.forEach(answer => {
        sum += parseInt(answer.response, 10);
      });
      analytics.averageRating = question.answers.length ? (sum / question.answers.length).toFixed(2) : 0;
      
      // Distribution of ratings
      const distribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
      question.answers.forEach(answer => {
        distribution[answer.response]++;
      });
      analytics.distribution = distribution;
      
    } else if (question.questionType === 'fill_in') {
      // For fill_in questions, we just list all the responses
      analytics.responses = question.answers.map(answer => ({
        respondent: answer.fullname,
        response: answer.response
      }));
    }
    
    questionResponses.push(analytics);
  });
  
  // For individual responses (one row per respondent per question)
  const individualResponses = [];
  
  if (survey.submittedUsers.length > 0) {
    survey.questions.forEach(question => {
      question.answers.forEach(answer => {
        individualResponses.push({
          questionId: question._id.toString(),
          questionText: question.questionText,
          questionType: question.questionType,
          respondentId: answer.userId.toString(),
          respondentName: answer.fullname,
          response: answer.response
        });
      });
    });
  }
  
  return {
    surveyInfo,
    questionResponses,
    individualResponses
  };
};

module.exports = {
  createCsvString,
  formatSurveyDataForCsv
}; 
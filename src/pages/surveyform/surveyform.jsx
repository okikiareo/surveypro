import { Link, Form, useActionData } from "react-router-dom";
import React, { useEffect, useState } from "react";
import "./surveyform.css";
import backaro from "../../assets/img/backaro.svg";
import del from "../../assets/img/del.svg";
import add from "../../assets/img/add.svg";
import dot from "../../assets/img/dot.svg";
import option from "../../assets/img/option.svg";
import copy from "../../assets/img/copy.svg";
import Publish from "../../components/publishsurvey/publish";
import useAuthStore from "../../components/store/useAuthStore";
import { toast } from "react-toastify";

const SurveyForm = () => {

  const data = useActionData();
  console.log(data)
  const { currentSurveyId } = useAuthStore();

  const [isPublishVisible, setIsPublishVisible] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const handlePostSubmit = async (e) => {
    e.preventDefault()
    // Assume this function is triggered when the Post button is clicked
    try {
      setIsPosting(true);
      toast.success("Survey posted successfully!", {
        onClose: () => setIsPublishVisible(true),
        autoClose: 1500, // Delay to show Publish component
      }); // Show Publish component after success
    } catch (error) {
      console.error("Error posting questions:", error);
    } finally {
      setIsPosting(false); // Reset posting state
    }
  };

  const [questions, setQuestions] = useState([
    {
      id: currentSurveyId,
      text: "",
      type: "Multiple Choice",
      options: [""],
    },
  ]);

  const addNewQuestion = (id) => {
    const newQuestion = {
      questionId: id,
      questionText: "",
      questionType: "Multiple Choice",
      required: "",
      options: [""],
    };
    setQuestions([...questions, newQuestion]);
  };

  const deleteQuestion = (id) => {
    setQuestions(questions.filter((question) => question.id !== id));
  };

  const duplicateQuestion = (id) => {
    const questionToDuplicate = questions.find((q) => q.id === id);
    if (questionToDuplicate) {
      const duplicatedQuestion = {
        ...questionToDuplicate,
        id: questions.length + 1,
      };
      setQuestions([...questions, duplicatedQuestion]);
    }
  };

  const handleQuestionChange = (id, field, value) => {
    const updatedQuestions = questions.map((q) =>
      q.id === id ? { ...q, [field]: value } : q
    );
    setQuestions(updatedQuestions);
  };

  const addOption = (id) => {
    const updatedQuestions = questions.map((q) =>
      q.id === id ? { ...q, options: [...q.options, ""] } : q
    );
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionId, index, value) => {
    const updatedQuestions = questions.map((q) =>
      q.id === questionId
        ? {
          ...q,
          options: q.options.map((option, i) =>
            i === index ? value : option
          ),
        }
        : q
    );
    setQuestions(updatedQuestions);
  };
  return (
    <section className="form-page">
      <div className="wrap">
        <div className="form-head flex">
          <Link to="/postsurvey">
            <img src={backaro} className="backaro" alt="Back" />
          </Link>
          <div className="form-h">
            <h3>Add Questions</h3>
          </div>
        </div>

        <div className="form-container">
          <Form method="post" action="/surveyform">
            {/* To pass id to action */}
            <input type="hidden" name="currentSurveyId" value={currentSurveyId} />

            {questions.map((question) => (
              <div className="oneQuestion" key={question.id}>
                <div className="question-field flex">
                  <input
                    className="question-input"
                    type="text"
                    name="questionText"
                    required
                    placeholder="Untitled Question"
                    value={question.text}
                    onChange={(e) =>
                      handleQuestionChange(question.id, "text", e.target.value)
                    }
                  />
                  <img
                    src={copy}
                    className="copy-icon"
                    alt="Duplicate"
                    onClick={() => duplicateQuestion(question.id)}
                  />
                  <img
                    src={del}
                    className="delete-icon"
                    alt="Delete"
                    onClick={() => deleteQuestion(question.id)}
                  />
                  <img src={option} className="question-option" alt="Options" />
                </div>

                <div className="choice-field custom-dropdown flex">
                  <div className="wrap-icon flex">
                    <img src={dot} className="dot-icon" alt="Dot" />
                    <select
                      name="questionType"
                      value={question.type}
                      onChange={(e) =>
                        handleQuestionChange(question.id, "type", e.target.value)
                      }
                      className="choice-select"
                    >
                      <option value="Multiple Choice" key="multiple">Multiple Choice</option>
                      <option value="Single Choice" key="single">Single Choice</option>
                    </select>
                  </div>

                  <div className="options-list flex">
                    <div className="option">
                      {question.options.map((option, index) => (
                        <div className="wrap-icon flex" key={index}>
                          <input
                            type="text"
                            name="options"
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) =>
                              handleOptionChange(
                                question.id,
                                index,
                                e.target.value
                              )
                            }
                            className="option-input"
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      className="option-select flex"
                      type="button"
                      onClick={() => addOption(question.id)}
                    >
                      Add option
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button className="next-question flex" onClick={addNewQuestion}>
              Next Question <img src={add} alt="Add" />
            </button>

            <button type="submit" className="post-btn" onClick={handlePostSubmit}
              disabled={isPosting}>
              {isPosting ? "Posting..." : "Post"}
            </button>
          </Form>
        </div>
        {/* Render Publish component conditionally */}
        {isPublishVisible && <Publish id={currentSurveyId} />}
      </div>
    </section>
  );
};

export default SurveyForm;
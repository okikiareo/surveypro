import { Link, Form, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import useAuthStore from "../../store/useAuthStore";
import config from "../../config/config";
import backaro from "../../assets/img/backaro.svg";

const AnswerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const authToken = useAuthStore((state) => state.authToken);

  const [meta, setMeta] = useState({ title: "", description: "" });
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`${config.API_URL}/forms/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.msg || "Failed to load form");
        setMeta({ title: data.title || "Form", description: data.description || "" });
        setFields(Array.isArray(data.fields) ? data.fields : []);
      } catch (error) {
        toast.error(error.message || "Error loading form");
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [id, authToken]);

  const handleChange = (label, value) => {
    setAnswers((prev) => ({ ...prev, [label]: value }));
  };

  const handleCheckboxChange = (label, option, checked) => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[label]) ? prev[label] : [];
      return {
        ...prev,
        [label]: checked
          ? [...current, option]
          : current.filter((o) => o !== option),
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // basic required validation
    const missing = fields.some((f) => f.required && (answers[f.label] == null || (Array.isArray(answers[f.label]) ? answers[f.label].length === 0 : String(answers[f.label]).trim() === "")));
    if (missing) {
      toast.error("Please complete all required fields");
      return;
    }

    setSubmitting(true);
    const payload = {
      answers: fields.map((f) => ({ label: f.label, response: answers[f.label] })),
    };

    try {
      const response = await fetch(`${config.API_URL}/forms/${id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || "Failed to submit form");
      toast.success(data.msg || "Responses submitted. Thank you!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message || "Error submitting form");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="ans-msg">Loading form...</p>;
  if (!fields.length) return <p className="ans-msg">No fields to answer.</p>;

  return (
    <section className="fillsurvey">
      <div className="fillsurvey_inner wrap">
        <div className="survey-ans-details flex">
          <div className="flex ans-back-title">
            <Link to={"/dashboard"}>
              <img src={backaro} className="backaro" />
            </Link>
            <div>
              <h3 className="survey_title_ans">{meta.title}</h3>
              <p className="ans-post-time">{meta.description}</p>
            </div>
          </div>
        </div>

        <Form onSubmit={handleSubmit} className="ans-form">
          {fields.map((field, index) => (
            <div key={`${field.label}-${index}`} className="question-answer">
              <p className="ans-question">
                <span>{index + 1}.</span> {field.label}
              </p>
              {field.type === "text" && (
                <input
                  className="fillin-ans"
                  type="text"
                  placeholder="Your answer"
                  onChange={(e) => handleChange(field.label, e.target.value)}
                  required={field.required}
                />
              )}
              {field.type === "textarea" && (
                <textarea
                  className="fillin-ans"
                  placeholder="Your answer"
                  onChange={(e) => handleChange(field.label, e.target.value)}
                  required={field.required}
                  rows={4}
                />
              )}
              {field.type === "date" && (
                <input
                  className="fillin-ans"
                  type="date"
                  onChange={(e) => handleChange(field.label, e.target.value)}
                  required={field.required}
                />
              )}
              {field.type === "radio" && Array.isArray(field.options) && (
                field.options.map((opt, i) => (
                  <label key={i} className="answer-ques-opt">
                    <input
                      type="radio"
                      name={`field-${index}`}
                      value={opt}
                      onChange={(e) => handleChange(field.label, e.target.value)}
                      required={field.required}
                    />
                    {opt}
                  </label>
                ))
              )}
              {field.type === "checkbox" && Array.isArray(field.options) && (
                field.options.map((opt, i) => (
                  <label key={i} className="answer-ques-opt">
                    <input
                      type="checkbox"
                      value={opt}
                      onChange={(e) => handleCheckboxChange(field.label, opt, e.target.checked)}
                    />
                    {opt}
                  </label>
                ))
              )}
            </div>
          ))}
          <div className="submit-div flex">
            <button type="submit" className="submit-ans-btn" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </Form>
      </div>
    </section>
  );
};

export default AnswerForm;



import { Link, Form, useActionData, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import backaro from "../../assets/img/backaro.svg";
import del from "../../assets/img/del.svg";
import add from "../../assets/img/add.svg";
import plus from "../../assets/img/icon-add.svg";
import dot from "../../assets/img/dot.svg";
import copy from "../../assets/img/copy.svg";
import useAuthStore from "../../store/useAuthStore";
import PricingModal from "../../components/pricingmodal/pricingmodal";
import { toast } from "react-toastify";
import config from "../../config/config";
import axios from "axios";
import ShareLink from "../../components/sharelink/sharelink"

const FormQuestions = () => {
  const navigate = useNavigate();
  const data = useActionData();
  const { currentFormId } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const authToken = useAuthStore((state) => state.authToken);
  const [isLoading, setIsLoading] = useState(true);

  // Add new state for delete loading
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [formMeta, setFormMeta] = useState({ title: "", description: "" });
  const [fields, setFields] = useState([
    {
      id: Date.now(),
      label: "",
      type: "text",
      required: true,
      options: [],
    },
  ]);

  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);

  // Load existing form
  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`${config.API_URL}/forms/${currentFormId}`,
          { headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" } });
        const data = await response.json();

        if (response.ok) {
          setFormMeta({ title: data.title || "", description: data.description || "" });
          if (Array.isArray(data.fields) && data.fields.length > 0) {
            const formatted = data.fields.map((f) => ({
              id: Date.now() + Math.random(),
              label: f.label || "",
              type: f.type || "text",
              required: Boolean(f.required),
              options: Array.isArray(f.options)
                ? f.options.map((opt) => (typeof opt === "string" ? opt : String(opt)))
                : [],
            }));
            setFields(formatted);
          }
        } else {
          toast.error(data.msg || "Failed to load form");
        }
      } catch (error) {
        console.error("Error loading form:", error);
        toast.error("Error loading form");
      } finally {
        setIsLoading(false);
      }
    };

    if (currentFormId) {
      fetchForm();
    } else {
      setIsLoading(false);
    }
  }, [currentFormId, authToken]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        title: formMeta.title,
        description: formMeta.description,
        fields: fields.map((f) => ({
          label: f.label.trim(),
          type: f.type,
          required: Boolean(f.required),
          options:
            f.type === "radio" || f.type === "checkbox"
              ? f.options.map((opt) => String(opt).trim()).filter((o) => o !== "")
              : undefined,
        })),
        shares: { type: "public" },
      };

      const response = await fetch(`${config.API_URL}/forms/${currentFormId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.msg || "Failed to save form");
      }

      toast.success(data.msg || "Form saved successfully");
    } catch (error) {
      toast.error(error.message || "Failed to save form");
    } finally {
      setIsSaving(false);
    }
  };
  const addNewField = () => {
    const newField = {
      id: Date.now(),
      label: "",
      type: "text",
      required: false,
      options: [],
    };
    setFields([...fields, newField]);
  };

  const deleteField = (id) => {
    setIsDeletingId(id);
    setFields(fields.filter((f) => f.id !== id));
    setIsDeletingId(null);
  };

  const duplicateField = (id) => {
    const fieldToDuplicate = fields.find((f) => f.id === id);
    if (fieldToDuplicate) {
      const duplicated = { ...fieldToDuplicate, id: Date.now() };
      setFields([...fields, duplicated]);
    }
  };

  const handleFieldChange = (id, key, value) => {
    const updated = fields.map((f) =>
      f.id === id
        ? {
            ...f,
            [key]: value,
            ...(key === "type" && !(value === "radio" || value === "checkbox")
              ? { options: [] }
              : {}),
          }
        : f
    );
    setFields(updated);
  };

  const addOption = (id) => {
    const updated = fields.map((f) =>
      f.id === id ? { ...f, options: [...f.options, ""] } : f
    );
    setFields(updated);
  };

  const handleOptionChange = (id, index, value) => {
    const updated = fields.map((f) =>
      f.id === id
        ? { ...f, options: f.options.map((opt, i) => (i === index ? value : opt)) }
        : f
    );
    setFields(updated);
  };

  // Question Upload Function
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }
    const formData = new FormData();
    formData.append("document", file);

    try {
      setIsUploading(true);
      setUploadProgress(30);

      // Used Axios for the upload tracking
      const response = await axios.post(
        `${config.API_URL}/surveys/${currentSurveyId}/upload-questionnaire`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      if (response.data.status === "success") {
        toast.success(response.data.msg);
        // Refresh questions after successful upload
        // here
        const newQuestionsResponse = await axios.get(
          `${config.API_URL}/surveys/${currentSurveyId}/questions`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        const formattedQuestions = newQuestionsResponse.data.questions.map(
          (q) => ({
            id: Date.now() + Math.random(),
            questionId: q._id,
            questionText: q.questionText,
            questionType: q.questionType,
            required: q.required,
            options: q.options.map((opt) => ({
              text: typeof opt === "string" ? opt : opt.text,
              allowsCustomInput:
                typeof opt === "object"
                  ? opt.allowsCustomInput || false
                  : false,
            })),
          })
        );

        setQuestions(formattedQuestions);
      }
    } catch (error) {
      console.error("File upload failed:", error);
      toast.error(error.response?.data?.message || "Failed to upload PDF");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      e.target.value = ""; // Reset file input
    }
  };

  return (
    <>
   <ShareLink/>
    <section className="form-page">
      <div className="wrap">
        <div className="form-head flex">
          <Link to="/create-form">
            <img src={backaro} className="backaro" alt="Back" />
          </Link>
          <div className="form-h">
            <h3>Add Form Fields</h3>
          </div>
        </div>

        {isLoading ? (
          <div className="loading">Loading questions...</div>
        ) : (
          <div className="form-container">
            <Form onSubmit={(e)=>{e.preventDefault(); handleSave();}}>
              {/* Upload File Questions */}
              {/* <div className="Q-file-upload">
                <label className="flex Q-upload">
                  <input
                    type="file"
                    accept=".pdf"
                    name="document"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                    disabled={isUploading}
                  />
                  <img src={plus} alt="" />
                  {isUploading ? (
                    `Uploading... ${uploadProgress}%`
                  ) : (
                    "Upload Questions PDF"
                  )}
                </label>
                <p className="upload-note">
                  Upload a PDF file to automatically populate questions
                </p>
              </div> */}

              {fields.map((field) => (
                <div className="oneQuestion" key={field.id}>
                  <div className="question-field flex">
                    <input
                      className="question-input"
                      type="text"
                      name="label"
                      required
                      placeholder="Field label"
                      value={field.label}
                      onChange={(e) => handleFieldChange(field.id, "label", e.target.value)}
                    />
                    <img
                      src={copy}
                      className="copy-icon"
                      alt="Duplicate"
                      onClick={() => duplicateField(field.id)}
                    />
                    {isDeletingId === field.id ? (
                      <span className="deleting-spinner">Deleting...</span>
                    ) : (
                      <img
                        src={del}
                        className="delete-icon"
                        alt="Delete"
                        onClick={() => deleteField(field.id)}
                      />
                    )}
                  </div>

                  <div className="choice-field custom-dropdown flex">
                    <div className="wrap-icon type-row flex">
                      <img src={dot} className="dot-icon" alt="Dot" />
                      <select
                        name="type"
                        value={field.type}
                        onChange={(e) => handleFieldChange(field.id, "type", e.target.value)}
                        className="choice-select"
                      >
                        <option value="text">Text</option>
                        <option value="textarea">Paragraph</option>
                        <option value="radio">Multiple Choice</option>
                        <option value="checkbox">Checkboxes</option>
                        <option value="date">Date</option>
                      </select>
                    </div>
                    {(field.type === "radio" || field.type === "checkbox") && (
                      <div className="options-list flex">
                        <div className="option">
                          {field.options.map((option, index) => (
                            <div className="wrap-icon flex" key={index}>
                              <input
                                key={index}
                                type="text"
                                name="options"
                                placeholder={`Option ${index + 1}`}
                                value={option}
                                onChange={(e) => handleOptionChange(field.id, index, e.target.value)}
                                className="option-input"
                              />
                            </div>
                          ))}
                        </div>

                        <button
                          className="option-select flex"
                          type="button"
                          onClick={() => addOption(field.id)}
                        >
                          Add option
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="wrap-icon flex" style={{gap: "8px", alignItems: "center"}}>
                    <label>
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => handleFieldChange(field.id, "required", e.target.checked)}
                      />
                      Required
                    </label>
                  </div>
                </div>
              ))}

              <button className="next-question flex" type="button" onClick={addNewField}>
                Add Field <img src={add} alt="Add" />
              </button>

              <div className="button-group flex">
                <button type="submit" className="post-btn" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </Form>
          </div>
        )}
      </div>
    </section>
    </>
  );
};

export default FormQuestions;

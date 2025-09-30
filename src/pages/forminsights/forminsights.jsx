import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import useAuthStore from "../../store/useAuthStore";
import config from "../../config/config";
import backaro from "../../assets/img/backaro.svg";

const FormInsights = () => {
  const { id } = useParams();
  const authToken = useAuthStore((state) => state.authToken);
  const [meta, setMeta] = useState({ title: "", description: "" });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
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

        // If backend has dedicated insights endpoint, switch here:
        const insightsRes = await fetch(`${config.API_URL}/forms/${id}/insights`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });
        if (insightsRes.ok) {
          const insightsData = await insightsRes.json();
          setStats(insightsData);
        } else {
          // Fallback minimal view if no insights endpoint
          setStats({ totalResponses: data.totalResponses || 0 });
        }
      } catch (error) {
        toast.error(error.message || "Error loading insights");
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [id, authToken]);

  if (loading) return <p className="ans-msg">Loading form insights...</p>;

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

        <div className="form-container">
          <div className="question-answer">
            <p className="ans-question"><span>1.</span> Total Responses</p>
            <p>{stats?.totalResponses ?? "--"}</p>
          </div>
          {Array.isArray(stats?.questions) && stats.questions.map((q, i) => (
            <div key={i} className="question-answer">
              <p className="ans-question"><span>{i + 2}.</span> {q.label}</p>
              {q.type === 'radio' || q.type === 'checkbox' ? (
                <ul>
                  {q.options?.map((opt, j) => (
                    <li key={j}>{opt.text || opt}: {opt.count ?? 0}</li>
                  ))}
                </ul>
              ) : (
                <p>Responses: {q.count ?? 0}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FormInsights;



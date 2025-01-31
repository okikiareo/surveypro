import { useEffect, useState } from "react";
import { Form, Link } from "react-router-dom";
import config from "../../config/config";
import useAuthStore from "../../components/store/useAuthStore";
import { toast } from "react-toastify";
import { formatDistanceToNow, parseISO } from "date-fns";
import search from "../../assets/img/search.svg";
import sort from "../../assets/img/sort.svg";
import dept from "../../assets/img/dept.svg";
import members from "../../assets/img/members.svg";
import view from "../../assets/img/eye.svg"
import unview from "../../assets/img/uneye.svg"
import nextaro from "../../assets/img/nextaro.svg"

import "./dashboard.css"

const dashboard = () => {

  const [searchKey, setSearchKey] = useState("");
  const authToken = useAuthStore((state) => state.authToken);
  const surveys = useAuthStore((state) => state.surveys);
  const setSurveys = useAuthStore((state) => state.setSurveys);
  const [showPoint, setShowPoint] = useState(false);

  useEffect(() => {
    const fetchSurveys = async () => {
      const API_URL = `${config.API_URL}/surveys`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      };

      const response = await fetch(API_URL, options);
      const json = await response.json();

      try {

        if (!response.ok) {
          throw new Error(json.message || "Failed to fetch surveys");
        }

        // Sort surveys by createdAt in descending order
        const sortedSurveys = json.surveys.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setSurveys(sortedSurveys);

      } catch (error) {
        toast.error(error.message || "Error fetching surveys");
        console.error("Error fetching surveys:", error);
      }
    }
    fetchSurveys();

  }, [authToken, setSurveys])

  const filteredSurveys = surveys.filter((survey) =>
    survey.title.toLowerCase().includes(searchKey.toLowerCase())
  );

   const pointToggle = () => {
      setShowPoint((prevState) => !prevState);
    };
    const iconPass = showPoint ? view : unview;

  return (
    <section className="dashboard">
      <div className="dashboard_inner wrap">

        <div className="points-board">
          <div className="points-head flex">
            <div className="points-label flex">
              Points Balance:
              <img src={iconPass} 
              onClick={pointToggle}
              alt="View Points" 
              />
            </div>
            <div className="transactions-history">
              {/* <Link href="">Transactions History <img src={nextaro} alt="" /> </Link> */}
            </div>
          </div>
          <div>
            <div className="points-value"
             
            >
               {showPoint ? "0.00" : "****"}
            </div>
          </div>
        </div>

        <div className="dash_head flex">
          <Form className="classForm">
            <div className="search desktop flex">
              <button className="flex" type={"submit"}>
                <img src={search} />
              </button>
              <input type="text" placeholder="Search for surveys" onChange={(e) => setSearchKey(e.target.value)} />
            </div>
          </Form>
          <div className="dashboard_sort flex">
            <h4>Sort by</h4> <img src={sort} alt="" />
          </div>
        </div>
        <div className="dashboard_surveys">
          <div className="survey_head flex">
            <h3 className="active_head">Available Surveys</h3>
            <h3>My Surveys</h3>
          </div>
          <div className="survey_posts">
            {/* Remove onclick; it's for checking the next page purpose */}
            {filteredSurveys.length > 0 ? (
              filteredSurveys.map((survey, index) => (
                <Link key={survey._id} to={`/expandsurvey/${survey._id}`}>
                  <div
                    className={`survey_post ${index === 0 ? "first_post" : ""}`}
                    key={survey._id}
                  >
                    <div className="post_time flex">
                      <p className="posted">Posted {formatDistanceToNow(parseISO(survey.createdAt), { addSuffix: true }) || "N/A"}
                      </p>
                      <p className="duration">
                        Duration: <b>{survey.duration || 0}</b> min
                      </p>
                    </div>
                    <div className="survey_details flex">
                      <h3 className="survey_title">{survey.title}</h3>
                      <h4 className="point">{survey.point || 0} Pts</h4>
                    </div>
                    <p className="survey_info">
                      {survey.description}
                      <a href="">...see more</a>
                    </p>
                    <div className="survey_class flex">
                      <div className="dept flex">
                        <img src={dept} alt="" />
                        <h4 className="department">
                          Inst. of <span className="dept">{survey.user_id ? survey.user_id.instituition : "N/A"}</span>
                        </h4>
                      </div>
                      <div className="participants flex">
                        <img src={members} alt="" />
                        <p>
                          <span className="num_participant">{survey.max_participant || 0}</span>{" "}
                          Participants
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="no_result">Opps! Survey not found..</p>
            )}
          </div>

        </div>

      </div>
    </section>
  )
}

export default dashboard;

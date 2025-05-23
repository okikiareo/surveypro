import "./publish.css"
import config from "../../config/config"
import { Form, useNavigate } from "react-router-dom"
import { useState } from "react"
import { toast } from "react-toastify";

const Publish = ({ id }) => {
    const [publish, setPublish] = useState(false);
    const authToken = localStorage.getItem("token");
    const navigate = useNavigate();

    const handlePublish = async () => {
        setPublish(true);
        const API_URL = `${config.API_URL}/surveys/${id}/publish`;
        const publishFetch = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        });
        // const publishData = await publishFetch.json();

        // setPublish(publishData);
        // return null;
try{

        if (publishFetch.ok) {
            toast.success("Survey published successfully!", {
              onClose: () => navigate("/dashboard"),
              autoClose: 1500,
            });
          } else {
            toast.error("Failed to publish survey.");
          }
        } catch (error) {
          console.error("Error publishing survey:", error);
          toast.error("An error occurred while publishing.");
        } finally {
          setPublish(false);
        }
    }
    console.log(publish)

    return (
        <section className="publish flex">
            <div className="publish-box flex">
                <p className="publish-msg">Now proceed to publish this survey.</p>
                {/* <Form method="post" action="/publish"> */}
                    {/* Include surveyId in form data */}
                    {/* <input type="hidden" name="surveyId" value="12345" /> Replace with actual ID */}

                    <button type="button" className="post-btn" onClick={() => handlePublish()}>
                        Publish
                    </button>
                {/* </Form> */}
            </div>
        </section>
    )
}
export default Publish;
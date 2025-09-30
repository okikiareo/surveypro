import config from "../../config/config";
import { toast } from "react-toastify";
import { redirect } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

const action = async ({ request }) => {
  const authToken = localStorage.getItem("token");
  const formData = await request.formData();

  const payload = {
    title: formData.get("title"),
    description: formData.get("description"),
    fields: [],
    shares: { type: "public" },
  };

  const API_URL = `${config.API_URL}/forms`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Allow-Control-Allow-Origin": "*",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });

    const json = await response.json();

    if (!response.ok) {
      toast.error(json.msg || json.message || "Failed to create form");
      return null;
    }

    toast.success(json.msg || "Form created successfully!");

    // Try common id shapes
    const createdId =
      json?.form?._id || json?.data?._id || json?._id || json?.id || "";

    if (createdId) {
      const { setFormId } = useAuthStore.getState();
      setFormId(createdId);
    }

    return redirect("/formquestions");
  } catch (error) {
    console.error("Error creating form:", error);
    toast.error("An error occurred. Please try again.");
    return null;
  }
};

export default action;



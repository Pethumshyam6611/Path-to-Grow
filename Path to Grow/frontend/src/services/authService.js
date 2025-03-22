import axios from "axios";

const API_URL = "http://localhost:5000/auth";

export const googleLogin = () => {
  window.open(`${API_URL}/google`, "_self");
};

export const logout = async () => {
  await axios.get(`${API_URL}/logout`, { withCredentials: true });
  localStorage.removeItem("user");
  window.location.href = "/";
};

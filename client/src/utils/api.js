import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 60000,
});

const token = localStorage.getItem("sm_token");
if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem("sm_token");
      delete api.defaults.headers.common["Authorization"];
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;

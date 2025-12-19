import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api/v1"
});

// Add auth token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration and refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        // Try to refresh the token
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken } = res.data;
        localStorage.setItem("accessToken", accessToken);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return API(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userEmail");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ==================
// JOBS API
// ==================
export const fetchJobs = (params = {}) => API.get("/jobs", { params });

export const fetchMatchedJobs = (params = {}) =>
  API.get("/resume/matched-jobs", { params });

export const likeJob = (jobId, source = "swipe") =>
  API.post(`/jobs/${jobId}/like`, { source });

export const skipJob = (jobId, source = "swipe") =>
  API.post(`/jobs/${jobId}/skip`, { source });

export const unlikeJob = (jobId) =>
  API.delete(`/jobs/${jobId}/like`);

export const applyToJob = (jobId) =>
  API.post(`/jobs/${jobId}/apply`);

export const fetchLikedJobs = (params = {}) =>
  API.get("/jobs/user/liked", { params });

export const fetchUserStats = () =>
  API.get("/jobs/user/stats");

// ==================
// RESUME API
// ==================
export const uploadResume = (fileData, fileName, mimeType) =>
  API.post("/resume/upload", { fileData, fileName, mimeType });

export const getResumeStatus = () =>
  API.get("/resume/status");

export const deleteResume = () =>
  API.delete("/resume");

export const analyzeResumeText = (text) =>
  API.post("/resume/analyze-text", { text });

// ==================
// USER API
// ==================
export const getCurrentUser = () =>
  axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
  });

export const updateProfile = (data) =>
  axios.patch(`${import.meta.env.VITE_API_URL}/auth/profile`, data, {
    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
  });

export const completeOnboarding = (data) =>
  axios.post(`${import.meta.env.VITE_API_URL}/auth/onboarding`, data, {
    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
  });

export default API;

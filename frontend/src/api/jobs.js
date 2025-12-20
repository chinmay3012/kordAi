import axios from "axios";

/**
 * =========================
 * AXIOS INSTANCE
 * =========================
 */
const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
});

/**
 * =========================
 * REQUEST INTERCEPTOR
 * =========================
 * Attach access token to every request
 */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * =========================
 * RESPONSE INTERCEPTOR
 * =========================
 * Handle token refresh on 401
 */
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loop
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        // Refresh access token
        const res = await API.post("/auth/refresh", { refreshToken });
        const { accessToken } = res.data;

        // Store new token
        localStorage.setItem("accessToken", accessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return API(originalRequest);
      } catch (refreshError) {
        // Hard fail: clear session and return to home
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userEmail");

        // IMPORTANT: avoid hard navigation to /login
        window.location.replace("/");

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * =========================
 * JOBS API
 * =========================
 */
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

/**
 * =========================
 * RESUME API
 * =========================
 */
export const uploadResume = (fileData, fileName, mimeType) =>
  API.post("/resume/upload", { fileData, fileName, mimeType });

export const getResumeStatus = () =>
  API.get("/resume/status");

export const deleteResume = () =>
  API.delete("/resume");

export const analyzeResumeText = (text) =>
  API.post("/resume/analyze-text", { text });

/**
 * =========================
 * USER API
 * =========================
 */
export const getCurrentUser = () =>
  API.get("/auth/me");

export const updateProfile = (data) =>
  API.patch("/auth/profile", data);

export const completeOnboarding = (data) =>
  API.post("/auth/onboarding", data);

export default API;

import axios from "axios";

/**
 * =========================
 * AXIOS INSTANCE
 * =========================
 */
const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ""}/api/v1`,
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
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
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // specific check for 401 and that we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return API(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const currentToken = localStorage.getItem("token");
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_URL || ""}/api/v1/auth/refresh`,
          {},
          {
            headers: currentToken ? { "Authorization": `Bearer ${currentToken}` } : {},
            withCredentials: true
          }
        );

        const { accessToken } = refreshResponse.data;
        if (accessToken) {
          localStorage.setItem("token", accessToken);
        }

        processQueue(null);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return API(originalRequest);
      } catch (err) {
        processQueue(err);
        isRefreshing = false;

        // Redirect to login if refresh fails
        window.location.href = "/login";
        return Promise.reject(err);
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

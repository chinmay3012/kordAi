import axios from "axios";

/**
 * =========================
 * AXIOS INSTANCE
 * =========================
 */
const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ""}/api/v1`,
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
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
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
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return API(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userEmail");
        window.location.href = "/login.html"; // Ensure full redirect
        return Promise.reject(error);
      }

      try {
        // Use a new instance or raw axios to avoid interceptor loop
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || ""}/api/v1/auth/refresh`,
          { refreshToken }
        );

        const { accessToken } = response.data;

        localStorage.setItem("accessToken", accessToken);
        API.defaults.headers.common["Authorization"] = "Bearer " + accessToken;

        processQueue(null, accessToken);
        isRefreshing = false;

        originalRequest.headers["Authorization"] = "Bearer " + accessToken;
        return API(originalRequest);
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;

        // Clear auth data and redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userEmail");
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

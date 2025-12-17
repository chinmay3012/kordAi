import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:7070/api/v1"
});

export const fetchJobs = () => API.get("/jobs");

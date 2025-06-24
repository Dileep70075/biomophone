import axios from "axios";

export const makeRequest = axios.create({
  baseURL: "http://45.79.117.40:8800/api/",
  withCredentials: true,
});

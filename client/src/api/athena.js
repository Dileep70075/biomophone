import axios from "axios";
import { getLocalUser } from "../utils/localStorage";

const APP_URL = import.meta.env.VITE_APP_MY_API_URL;

const athena = axios.create({
  baseURL: APP_URL,
});

athena.interceptors.request.use(
  (config) => {
    const user = getLocalUser();
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }

    return config;
  },
  (err) => {
    return Promise.reject(err);
  }
);

athena.interceptors.response.use(
  (response) => response,
  (err) => {
    return Promise.reject(err);
  }
);

export default athena;

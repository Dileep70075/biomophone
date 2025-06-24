import axios from 'axios';
import { checkAuthentication } from "../../services/authService/auth-service";
const API_URL = import.meta.env.VITE_APP_MY_API_URL;
export const getAllOtherUsers = async () => {
  try {
    const userData = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;
  const token = userData?.token;
  // console.log("token:", token);
    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) {
      console.warn("User not authenticated.");
      return []; // or throw new Error("Not authenticated");
    }
    const response = await axios.get(`${API_URL}/api/auth/getAllOtherUsersPrisma`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // console.log("response:", response.data);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Failed to fetch users.");
    }
  } catch (error) {
    console.error("Error in getAllOtherUsers:", error.message || error);
    return [];
  }
};

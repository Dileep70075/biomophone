import axios from "axios";
import { getLocalUser, removeLocalUser } from "../../utils/localStorage";
import athena from "../../api/athena";
const API_URL = import.meta.env.VITE_APP_MY_API_URL;
export const registerUser = async (data) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/auth/registerPrisma`,
      data
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 409 && data.field) {
        throw {
          field: data.field,
          error: data.message || "Account already exists",
        };
      }
      throw { error: data.message || "Something went wrong" };
    } else if (error.request) {
      throw { error: "Network error. Please check your internet connection." };
    } else {
      throw { error: "Unexpected error. Try again later." };
    }
  }
};
export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/auth/loginPrisma`,
      credentials,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    localStorage.setItem("user", JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "An error occurred during login"
    );
  }
};
export const checkAuthentication = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  // Retrieve user from local storage
  const token = user?.token;
  if (!token) {
    console.error("No token found");
    return false;
  }
  // Add logic to verify token expiration
  // If expired, return false or refresh token
  return user && user.success;
};

export const checkUserLoggedIn = async () => {
  // console.log("checkUserLoggedIn called");
  try {
    const user = JSON.parse(localStorage.getItem("user")); // Retrieve user from local storage
    if (!user || !user.success) {
      return { isLoggedIn: false, error: "No user is logged in" };
    }
    const { id: userId } = user.user;
    const response = await athena.post(`/api/auth/CheckIfUserLoggedInPrisma`, {
      userId,
    });
    return response.data;
  } catch (error) {
    console.error("Error in check logged in user client : ", error);
    return {
      isLoggedIn: false,
      error: error.response?.data?.error || "An error occurred",
    };
  }
};

export const handleLogout = async (navigate, setIsLoading) => {
  try {
    console.log("handleLogout called");
    const data = await checkUserLoggedIn();
    console.log("data in handleLogout : ", data);
    if (data.isLoggedIn) {
      removeLocalUser();
      setIsLoading(false);  
      navigate("/login", { replace: true });
    }
  } catch (error) {
    console.error("Error in handleLogout:", error);
    // alert("Something went wrong. Please try again.");
    throw new Error("Something went wrong, please try again!");
  }
};

import React, { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "./authContext";

export const UserProfileContext = createContext();

export const UserProfileProvider = ({ children }) => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const userData = user || { user: {} };
      const userDetails = userData.user || {};

      return {
        username: userDetails.username || "",
        email: userDetails.email || "",
        name: userDetails.name || "",
        profilePicture: userDetails.profilePic || "",
        bio: userDetails.bio || "",
        privacy: userDetails.privacy || "PUBLIC",
        interests: userDetails.interests || [],
        userId: userDetails.id || "",
        token: userData.token || "",
      };
    } catch (error) {
      console.error("Error initializing user profile:", error);
      return {
        username: "",
        email: "",
        name: "",
        profilePicture: "",
        bio: "",
        privacy: "PUBLIC",
        interests: [],
        userId: "",
        token: "",
      };
    }
  });

  useEffect(() => {
    if (user) {
      const userDetails = user.user || {};
      setUserProfile((prev) => ({
        ...prev,
        username: userDetails.username || "",
        email: userDetails.email || "",
        name: userDetails.name || "",
        profilePicture: userDetails.profilePic || "",
        bio: userDetails.bio || "",
        privacy: userDetails.privacy || "PUBLIC",
        interests: userDetails.interests || [],
        userId: userDetails.id || "",
        token: user.token || "",
      }));
    }
  }, [user]);

  const updateUserProfile = (key, value) => {
    setUserProfile((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <UserProfileContext.Provider value={{ userProfile, updateUserProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

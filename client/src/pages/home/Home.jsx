import Stories from "../../components/stories/Stories";
import Posts from "../../components/posts/Posts";
import React, { useState } from "react";
import Share from "../../components/share/Share";
import "./home.scss";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import StoryView from "../../components/stories/StoryView";
import {
  checkUserLoggedIn,
  handleLogout,
} from "../../services/authService/auth-service";
import { getLocalUser } from "../../utils/localStorage";
const Home = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [sessionCheckComplete, setSessionCheckComplete] = useState(false);

  const checkSession = async () => {
    try {
      const user = getLocalUser();
      if (!user || !user.success) {
        await handleLogout(navigate, setIsLoading);
        return;
      }

      const data = await checkUserLoggedIn();

      if (!data.isLoggedIn) {
        await handleLogout(navigate, setIsLoading);
      }
    } catch (error) {
      console.error("Error checking session:", error);
    } finally {
      setIsLoading(false);
      setSessionCheckComplete(true);
    }
  };

  useEffect(() => {
    if (sessionCheckComplete) return;
    const isChecked = () => {
      checkSession();
    };

    isChecked();
  }, [navigate, sessionCheckComplete]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="home">
      {/* <Stories/> */}
      <StoryView />
      <Share />
      <Posts />
    </div>
  );
};

export default Home;

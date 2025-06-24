import "./leftBar.scss";
import React, { useEffect, useState } from "react";
import Friends from "../../assets/1.png";
import Groups from "../../assets/2.png";
import Market from "../../assets/3.png";
import Watch from "../../assets/4.png";
import Memories from "../../assets/5.png";
import Events from "../../assets/6.png";
import Gaming from "../../assets/7.png";
import Gallery from "../../assets/8.png";
import Videos from "../../assets/9.png";
import Messages from "../../assets/10.png";
import Tutorials from "../../assets/11.png";
import Courses from "../../assets/12.png";
import Fund from "../../assets/13.png";
import { UserProfileContext } from "../../context/UserProfileContext"; // Updated to use UserProfileContext
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

const LeftBar = () => {
  const { userProfile } = useContext(UserProfileContext); 
  const [users, setUsers] = useState([]);
  const API_URL = import.meta.env.VITE_APP_MY_API_URL;
  const IMAGE_URL = import.meta.env.VITE_MINIO_ENDPOINT;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
  const userData = JSON.parse(localStorage.getItem("user"));
  const token = userData?.token;
  // console.log(token);
        const response = await fetch(`${API_URL}/api/profiles/profile`,{
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        setUsers(data);
        // console.log(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  },[setUsers])
  const navigate = useNavigate();
  const handleProfileClick = () => {
    navigate("/profile");
  };
  
  return (
    <div className="leftBar">
      <div className="container">
        <div className="menu">
          <div
            className="user"
            onClick={handleProfileClick}
            style={{ cursor: "pointer" }}
          >
            <img
              src={userProfile ?`${IMAGE_URL}${users?.img}` : null}
              alt="Profile"
            />
            <span>{userProfile.name}</span>
          </div>
          <div className="item">
            <img src={Friends} alt="" />
            <span style={{cursor:"pointer"}} onClick={() => navigate("/friends")}>Friends</span>
          </div>
          <div className="item" style={{ cursor: "pointer"}}>
            <img src={Groups} alt="" />
            <span onClick={() => navigate("/community")}>Community</span>
          </div>
          <div className="item">
            <img src={Market} alt="" />
            <span className="marketplace-link" onClick={() => navigate("/Marketplace")}>Marketplace</span>
          </div>
          <div className="item">
            <img src={Watch} alt="" />
            <span className="marketplace-link" onClick={() => navigate("/Watch")}>Watch</span>
          </div>
          <div className="item" style={{ cursor: "pointer"}}>
            <img src={Memories} alt="" />
            <span onClick={() => navigate("/premium")}>Premium</span>
          </div>
        </div>
        <hr />
        <div className="menu">
          <span>Your shortcuts</span>
          <div className="item" style={{ cursor: "pointer" }}>
            <img src={Events} alt="Events" />
            <span onClick={() => navigate("/events")}>Events</span>
          </div>
          <div className="item">
            <img src={Gaming} alt="" />
            <span>Gaming</span>
          </div>
          <div className="item">
            <img src={Gallery} alt="" />
            <span>Gallery</span>
          </div>
          <div className="item">
            <img src={Videos} alt="" />
            <span style={{cursor: "pointer"}} onClick={()=>navigate("/reel")}>Reels</span>
          </div>
          <div className="item">
            <img src={Messages} alt="" />
            {/* <span>Messages</span> */}
            <span className="marketplace-link" onClick={() => navigate("/Messages")}>Messages</span>
          </div>
        </div>
        <hr />
        <div className="menu">
          <span>Others</span>
          <div className="item">
            <img src={Fund} alt="" />
            <span>Fundraiser</span>
          </div>
          <div className="item">
            <img src={Tutorials} alt="" />
            <span>Tutorials</span>
          </div>
          <div className="item">
            <img src={Courses} alt="" />
            <span>Courses</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftBar;

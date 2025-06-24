import React from "react";
import "./navbar.scss";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { DarkModeContext } from "../../context/darkModeContext";
import { UserProfileContext } from "../../context/UserProfileContext";
import LeftBar from "../leftBar/LeftBar";
import Modal from "../Home/ProfileModal";
import { handleLogout } from "../../services/authService/auth-service";

const Navbar = () => {
  const { toggle, darkMode } = useContext(DarkModeContext);
  const { userProfile } = useContext(UserProfileContext);
  const { username, profilePicture } = userProfile;
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
const [users, setUsers] = useState([]);
  const API_URL = import.meta.env.VITE_APP_MY_API_URL;
  const IMAGE_URL = import.meta.env.VITE_MINIO_ENDPOINT;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
  const userData = JSON.parse(localStorage.getItem("user"));
  const token = userData?.token;
        const response = await fetch(`${API_URL}/api/profiles/profile`,{
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  },[setUsers])

  const handleProfileClick = async () => {
    setIsModalOpen(true);
    try {
      await handleLogout(navigate, setIsLoading);
    } catch (error) {
      console.error("Logout failed:", error);
    }
    finally {
      setIsLoading(false);
    }
  };


  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  const handleToggleIcons = () => {
    setShowMore(!showMore);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="navbar">
      <div className="left">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span>Biomophone</span>
        </Link>
        <div className="icons">
          <HomeOutlinedIcon />
          {darkMode ? (
            <WbSunnyOutlinedIcon onClick={toggle} />
          ) : (
            <DarkModeOutlinedIcon onClick={toggle} />
          )}
          <GridViewOutlinedIcon />
        </div>
        <div className="search">
          <SearchOutlinedIcon />
          <input type="text" placeholder="Search..." />
        </div>
      </div>

      <div className="hamburger" onClick={toggleMenu}>
        {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
      </div>

      <div className={`dropdown-menu ${isMenuOpen ? "open" : ""}`}>
        <LeftBar className={isMenuOpen ? "open" : ""} />
      </div>

      <div className="right">
        <PersonOutlinedIcon onClick={toggleModal} />
        <EmailOutlinedIcon />
        <NotificationsOutlinedIcon />
        <div className="user">
          {users?.img ? (
            <img
              src={`${IMAGE_URL}${users.img}`}
              alt="Profile"
              className="navbar-profile-pic"
              onClick={handleProfileClick}
              style={{ cursor: "pointer" }}
            />
          ) : (
            <div
              className="default-avatar"
              onClick={handleProfileClick}
              style={{ cursor: "pointer" }}
            >
              {username?.charAt(0)}
            </div>
          )}
          <span>{username || "User"}</span>
        </div>
      </div>

      <div className={`bottom-bar ${showMore ? "show-more" : ""}`}>
        <HomeOutlinedIcon />
        <EmailOutlinedIcon />
        <NotificationsOutlinedIcon />
        <GridViewOutlinedIcon onClick={handleToggleIcons} />
        <div className="more-icons">
          {darkMode ? (
            <WbSunnyOutlinedIcon onClick={toggle} />
          ) : (
            <DarkModeOutlinedIcon onClick={toggle} />
          )}
          <PersonOutlinedIcon onClick={toggleModal} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Navbar;

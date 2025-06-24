import React, { useCallback } from "react";
import "./modal.scss";
import athena from "../../api/athena";
import { getLocalUser, removeLocalUser } from "../../utils/localStorage";
import { useNavigate } from "react-router-dom";

const Modal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const navigate = useNavigate();
  const userData = getLocalUser();

  const handleLogout = useCallback(
    async (removeAll = false) => {
      const currentUser = getLocalUser();

      if (!currentUser) {
        alert("No user is logged in");
        return;
      }

      try {
        const { id: userId } = currentUser.user;

        const response = await athena.post(`api/auth/logoutPrisma`, {
          userId,
          removeAll,
        });

        console.log("response in modal:", response);

        if (response.status === 200 || response.statusText === "OK") {
          await new Promise((resolve) => {
            removeLocalUser();
            setTimeout(resolve, 50);
          });

          console.log("userData 2 :", userData);

          navigate("/login");
          onClose();
        } else {
          console.log("userData 3 :", userData);
          throw new Error("Logout failed");
        }
      } catch (error) {
        console.error("Logout error:", error);
        console.log("Error details:", error.response?.data || error.message);
        alert(error.response?.data?.error || "An error occurred during logout");
      }
    },
    [onClose, navigate]
  );

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2>Session Management</h2>
        <p>
          You are logged in as{" "}
          <strong>{userData?.user?.name || "Unknown"}</strong>.
        </p>
        <button onClick={() => handleLogout(false)}>Sign Out</button>
        <button onClick={() => handleLogout(true)}>
          Sign Out from All Devices
        </button>
      </div>
    </div>
  );
};

export default Modal;

import React, { useEffect, useState } from 'react';
import axios from "axios";
// import { getAllOtherUsers } from "../../services/friendRequest/friend-Request";
import { checkAuthentication } from "../../services/authService/auth-service";
import "./FreindRequests.scss";
const API_URL = import.meta.env.VITE_APP_MY_API_URL;
const IMAGE_URL = import.meta.env.VITE_MINIO_ENDPOINT;
// console.log("API_URL", API_URL);
const FreindRequests = () => {
  const [users, setUsers] = useState([]);
  // console.log("users", users);
  const userData = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;
  const token = userData?.token;





  useEffect(() => {
    async function FriendDetails() {
      const isAuthenticated = await checkAuthentication();
      // console.log("isAuthenticated", isAuthenticated);
      if (!isAuthenticated) {
        console.warn("User not authenticated.");
        return [];
      }
      const response = await axios.get(`${API_URL}/api/requests/requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      // console.log("response", response);
      if (response.data.success) {
        // console.log("response", response.data.data);
        setUsers(response.data.data);
        // console.log("response", response.data.data);
      }
      else { console.error("Error fetching friend requests:", response.data.message); }
    }
    FriendDetails();
  }, []);

  const sendRequest = async (userId) => {
    // console.log("userId", userId);
    try {
      const response = await axios.post(`${API_URL}/api/requests/send-request`, { receiverId:userId }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      console.log("response", response);
    }
    catch (error) {
      // console.log("error", error);
      console.error("Error sending friend request:", error);
    }
  }


  const updateACCEPTED = async (id) => {
    console.log("requestId", id);
    try {
      const response = await axios.post(
        `${API_URL}/api/requests/accept-request`,
        { requestId:id }, // send requestId in the body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      console.log("response", response);
    }
    catch (error) {
      console.log("error", error);
      console.error("Error accepting friend request:", error);
    }
  }


const updateDECLINED = async (id) => {
  console.log("requestId", id);
  try {
    const response = await axios.post(
      `${API_URL}/api/requests/decline-request`,
      { requestId:id }, // send requestId in the body
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );
    console.log("response", response);
  }
  catch (error) {
    console.log("error", error);
    console.error("Error rejecting friend request:", error);
  }
}





  return (
    <div className="friend-requests-container">
      <h2>Friend Requests</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            <img src={`${IMAGE_URL}${user?.img}`} />
            <strong>Name : {user.name}</strong> 
            
            {/* <strong>Email:</strong> {user.email} */}

            {(user.myRequest === undefined || user.myRequest === null) && (user.userRequest === undefined || user.userRequest === null) ? (
              <button onClick={() => sendRequest(user.id)}>Send Request</button>
            ) : null}
            {user.myRequest != null && user.myRequest.status === 'PENDING' ? (
              <button>waiting</button>
            ) : null}
            {user.userRequest != null && user.userRequest.status === 'PENDING' ? (
              <>
                <button onClick={() => updateACCEPTED(user.userRequest.id)}>Accept</button>
                <button onClick={() => updateDECLINED(user.userRequest.id)}>Reject</button>
              </>
            ) : null}
            {user.userRequest != null && user.userRequest.status === 'ACCEPTED' ? (
              <button>friend</button>
            ) : null}
            {user.myRequest != null && user.myRequest.status === 'ACCEPTED' ?
              (<div>Friend</div>)
              : null}




{user.userRequest != null && user.userRequest.status === 'DECLINED' ? (
              <button onClick={() => sendRequest(user.id)}>Send Request</button>
            ) : null}
            {user.myRequest != null && user.myRequest.status === 'DECLINED' ?
             <button onClick={() => sendRequest(user.id)}>Send Request</button>
              : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FreindRequests;



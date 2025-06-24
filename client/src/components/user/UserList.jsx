// import React, { useEffect, useState } from 'react';

// const UserList = () => {
//   const [loggedInUsers, setLoggedInUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchLoggedInUsers = async () => {
//       try {
//         const response = await fetch('http://localhost:8800/api/users/logged-in', {
//           method: 'GET',
//           headers: {
//             'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming you're storing the token in localStorage
//           }
        

//         });
//         const data = await response.json();
//         console.log(localStorage.getItem('token'))
//         if (response.ok) {
//           setLoggedInUsers(data); // Set the logged-in users
//         } else {
//           setError(data.error || 'Failed to fetch users');
//         }
//       } catch (err) {
//         setError('An error occurred',err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchLoggedInUsers();
//   }, []);

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>{error}</div>;

//   return (
//     <div>
//       <h3>Logged In Users</h3>
//       <ul>
//         {loggedInUsers.length === 0 ? (
//           <li>No users are currently logged in.</li>
//         ) : (
//           loggedInUsers.map(user => (
//             <li key={user.id}>{user.name}</li>
//           ))
//         )}
//       </ul>
//     </div>
//   );
// };

// export default UserList;

// import React, { useContext, useEffect, useState } from "react";
// import { UserProfileContext } from "../../context/UserProfileContext"; // Adjust the import path as needed

// const UserList = () => {
//   const { userProfile } = useContext(UserProfileContext);
//   const [loggedInUsers, setLoggedInUsers] = useState([]);

//   useEffect(() => {
//     // Get all logged-in users from localStorage
//     const allUsers = JSON.parse(localStorage.getItem("allLoggedUsers")) || [];
//     // Add the current user if not already in the list
//     if (!allUsers.some(user => user.userId === userProfile.userId)) {
//       allUsers.push(userProfile);
//       localStorage.setItem("allLoggedUsers", JSON.stringify(allUsers));
//     }
//     setLoggedInUsers(allUsers);
//   }, [userProfile]);

//   return (
//     <div>
//       <h3>Logged In Users</h3>
//       <ul>
//         {loggedInUsers.length === 0 ? (
//           <li>No users are currently logged in.</li>
//         ) : (
//           loggedInUsers.map((user) => (
//             <li key={user.userId}>
//               <strong>Name:</strong> {user.name || "Unknown"} <br />
//               <strong>Email:</strong> {user.email || "No email"} <br />
//               <strong>Bio:</strong> {user.bio || "No bio available"}
//             </li>
//           ))
//         )}
//       </ul>
//     </div>
//   );
// };

// export default UserList;import React, { useEffect, useState } from "react"

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LoggedInUserList = () => {
  const [loggedInUsers, setLoggedInUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLoggedInUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8800/api/auth/loggedInUsers', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Use the token stored in localStorage (if any)
          },
        });
      
        setLoggedInUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching logged-in users');
        setLoading(false);
      }
    };

    fetchLoggedInUsers();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Logged-in Users</h2>
      <ul>
        {loggedInUsers.map((user) => (
          <li key={user.id}>
            <p>Username: {user.username}</p>
            <p>Name: {user.name}</p>
            <p>Email: {user.email}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LoggedInUserList;

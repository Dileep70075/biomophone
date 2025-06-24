// import connectToDb from "../connect.js"; // Default import
// import jwt from "jsonwebtoken";

// export const getUser = (req, res) => {
//   const userId = req.params.userId;
//   const q = "SELECT * FROM users WHERE id=?";

//   db.query(q, [userId], (err, data) => {
//     if (err) return res.status(500).json(err);
//     const { password, ...info } = data[0];
//     return res.json(info);
//   });
// };

// export const updateUser = (req, res) => {
//   const token = req.cookies.accessToken;
//   if (!token) return res.status(401).json("Not authenticated!");

//   jwt.verify(token, "secretkey", (err, userInfo) => {
//     if (err) return res.status(403).json("Token is not valid!");

//     const q =
//       "UPDATE users SET `name`=?,`city`=?,`website`=?,`profilePic`=?,`coverPic`=? WHERE id=? ";

//     db.query(
//       q,
//       [
//         req.body.name,
//         req.body.city,
//         req.body.website,
//         req.body.coverPic,
//         req.body.profilePic,
//         userInfo.id,
//       ],
//       (err, data) => {
//         if (err) res.status(500).json(err);
//         if (data.affectedRows > 0) return res.json("Updated!");
//         return res.status(403).json("You can update only your post!");
//       }
//     );
//   });
// };

import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();
import jwt from "jsonwebtoken";

// Fetch user by ID with token verification
export const getUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove sensitive information such as password
    const { password, ...userInfo } = user;
    return res.json(userInfo);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Update user details based on JWT token
export const updateUser = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, process.env.SECRET_KEY, async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const { name, city, website, profilePic, coverPic } = req.body;
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userInfo.id }, // Use decoded user info from token
        data: {
          name,
          city,
          website,
          profilePic,
          coverPic,
        },
      });

      return res.json(updatedUser);
    } catch (err) {
      return res.status(500).json({ error: "Failed to update user" });
    }
  });
};

// Get the list of all logged-in users
export const getLoggedInUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { isLoggedIn: true }, // Track the login status if you have this field
    });
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch logged-in users" });
  }
};

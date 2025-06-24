import { prisma } from "../utils/db.js";
import {
  checkIfUserLoggedIn,
  loginUser,
  registerUser,
} from "../services/authService/authService.js";

export const registerPrisma = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);
    res
      .status(201)
      .json({ success: true, message: "User registered successfully", user });
  } catch (error) {
    next(error);
  }
};

export const loginPrisma = async (req, res, next) => {
  try {
    const { token, user } = await loginUser(req.body);
    res
      .status(200)
      .json({ success: true, message: "Login successful", token, user });
  } catch (error) {
   res.status(500)
    .json({error: error.message?error.message:error});
  }
};

// export const CheckIfUserLoggedIn = async (req, res) => {
//   const { userId } = req.body;
//   const token = req.headers.authorization?.split(" ")[1];

//   if (!userId) {
//     return res.status(400).json({ error: "User ID is required" });
//   }

//   try {
//     const isLoggedIn = await checkIfUserLoggedIn(userId, token);
//     if (isLoggedIn) {
//       return res
//         .status(200)
//         .json({ message: "User is logged in", isLoggedIn: true });
//     } else {
//       return res
//         .status(401)
//         .json({ error: "User is not logged in", isLoggedIn: false });
//     }
//   } catch (error) {
//     console.error("Error in CheckIfUserLoggedInPrisma:", error);
//     if (error.message === "User not found") {
//       return res.status(404).json({ error: error.message });
//     }
//     return res
//       .status(500)
//       .json({ error: error.message?error.message:error });
//   }
// };


export const CheckIfUserLoggedIn = async (req, res) => {
  const { userId } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const numericUserId = Number(userId);
  if (isNaN(numericUserId)) {
    return res.status(400).json({ error: "User ID must be a number" });
  }

  try {
    const isLoggedIn = await checkIfUserLoggedIn(numericUserId, token);
    if (isLoggedIn) {
      return res
        .status(200)
        .json({ message: "User is logged in", isLoggedIn: true });
    } else {
      return res
        .status(401)
        .json({ error: "User is not logged in", isLoggedIn: false });
    }
  } catch (error) {
    console.error("Error in CheckIfUserLoggedIn:", error);
    if (error.message === "User not found") {
      return res.status(404).json({ error: error.message });
    }
    return res
      .status(500)
      .json({ error: error?.message || "Internal server error" });
  }
};


export const logoutPrisma = async (req, res) => {
  const { userId, removeAll } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!userId) {
    return res.status(400).json({ error: "User ID is required." });
  }

  if (!removeAll && !token) {
    return res.status(400).json({
      error: "Token is required for single-device logout.",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { sessionTokens: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    let sessionTokens = user.sessionTokens || [];

    if (sessionTokens.length === 0) {
      return res.status(200).json({ message: "User is already logged out." });
    }

    if (removeAll) {
      if (!sessionTokens.includes(token)) {
        return res.status(403).json({
          error: "Unauthorized. Token does not match any active session.",
        });
      }
      sessionTokens = [];
    } else {
      if (!sessionTokens.includes(token)) {
        return res.status(400).json({ error: "Token not found." });
      }
      sessionTokens = sessionTokens.filter((t) => t !== token);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { sessionTokens },
    });

    return res.status(200).json({
      message: removeAll
        ? "Logged out from all devices."
        : "Logged out from this device.",
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error." });
  } finally {
    await prisma.$disconnect();
  }
};

export const getLoggedInUsersPrisma = async (req, res) => {
  try {
    // Fetch all users with non-empty sessionTokens (indicating they are logged in)
    const users = await prisma.user.findMany({
      where: {
        sessionTokens: {
          not: [],
        },
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
      },
    });

    // Return the logged-in users' data
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching logged-in users:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllOtherUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: currentUserId,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,  },
    });
    res.status(200).json({ message: 'success', user: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message ? error.message : error });
  }
};


// Login function
// export const loginPrisma = async (req, res) => {
//     const { username, password } = req.body;

//     if (!username || !password) {
//         return res.status(400).json({ error: 'Username and password are required' });
//     }

//     try {
//         // Find the user by username
//         const user = await prisma.user.findUnique({
//             where: { username },
//             select: { id: true, username: true, name: true, password: true, sessionTokens: true },
//         });

//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         // Check password
//         const isPasswordCorrect = bcrypt.compareSync(password, user.password);
//         if (!isPasswordCorrect) {
//             return res.status(400).json({ error: 'Wrong password' });
//         }

//         // Generate JWT with SECRET_KEY from environment
//         const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, { expiresIn: '90d' });

//         // Initialize sessionTokens if it's null or not an array
//         const sessionTokens = Array.isArray(user.sessionTokens) ? user.sessionTokens : [];

//         // Append the new token (you can add checks here to limit the array size)
//         sessionTokens.push(token);
//         console.log(sessionTokens);

//         // Update the sessionTokens field in the database
//         await prisma.user.update({
//             where: { id: user.id },
//             data: { sessionTokens },
//         });

//         // Send the token in the response body
//         return res.status(200).json({
//             message: 'Login successful',
//             token, // Send JWT token in the response body
//             user: { id: user.id, username: user.username, name: user.name },
//         });

//     } catch (error) {
//         console.error('Error logging in:', error);
//         return res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

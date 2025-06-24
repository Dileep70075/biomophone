import { prisma } from "../../utils/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (userData) => {
  const { username, email, password, name } = userData;

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });

  if (existingUser) {
    throw { status: 409, message: "User already exists" };
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  try {
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        name,
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    throw { status: 500, message: "Database error: " + error.message };
  }
};

export const loginUser = async ({ username, password }) => {
  if (!username || !password) {
    throw { status: 400, message: "Please provide valid credentials" };
  }
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      password: true,
      sessionTokens: true,
    },
  });
  if (!user) {
    throw { status: 404, message: "User not found." };
  }
  const isPasswordCorrect = bcrypt.compareSync(password, user.password);
  if (!isPasswordCorrect) {
    throw { status: 400, message: "Invalid credentials." };
  }
  console.log("token",process.env.JWT_SECRET_KEY)
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "90d",
  });
  const MAX_SESSION_TOKENS = 5;
  const sessionTokens = user.sessionTokens || [];
  if (sessionTokens.length >= MAX_SESSION_TOKENS) {
    sessionTokens.shift();
  }
  sessionTokens.push(token);
  await prisma.user.update({
    where: { id: user.id },
    data: { sessionTokens },
  });
  return {
    token,
    user: { id: user.id, username: user.username, name: user.name },
  };
};

export const checkIfUserLoggedIn = async (userId, token) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { sessionTokens: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const sessionTokens = Array.isArray(user.sessionTokens)
      ? user.sessionTokens
      : [];

    return sessionTokens.includes(token);
  } catch (error) {
    console.error("Error checking if user is logged in:", error);
    throw error;
  }
};

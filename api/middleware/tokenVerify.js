import jwt, { decode } from "jsonwebtoken";
import { prisma } from "../utils/db.js";

const authenticateJWT = async (req, res, next) => {
  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];
  const token = authHeader?.startsWith("Bearer")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res
      .status(401)
      .json({ error: "Token is missing. Please provide a valid token." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { sessionTokens: true },
    });
    if (!user || !user.sessionTokens.includes(token)) {
      return res
        .status(401)
        .json({ error: "Token is invalid or has been revoked." });
    }

    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Invalid or expired token." });
    }

    return res.status(500).json({ error: "Internal Server Error." });
  }
};

export default authenticateJWT;

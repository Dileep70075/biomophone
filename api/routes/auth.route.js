import express from "express";
import { login, register, logout } from "../controllers/auth.js";
import {
  loginPrisma,
  registerPrisma,
  logoutPrisma,
  CheckIfUserLoggedIn,
  getLoggedInUsersPrisma,
  getAllOtherUsers ,
} from "../rewritten-controllers/auth.controller.js";
import authenticateJWT from "../middleware/tokenVerify.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  loginSchema,
  registerSchema,
} from "../middleware/authValidation/userSchema.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);

// rewritten api
router.post("/registerPrisma", validateRequest(registerSchema), registerPrisma);
router.post("/loginPrisma", validateRequest(loginSchema), loginPrisma);
router.post("/logoutPrisma", authenticateJWT, logoutPrisma);
router.get("/getAllOtherUsersPrisma", authenticateJWT, getAllOtherUsers );
router.post(
  "/CheckIfUserLoggedInPrisma",
  authenticateJWT,
  CheckIfUserLoggedIn
);

// New route to get logged-in users
router.get("/loggedInUsers", authenticateJWT, getLoggedInUsersPrisma);

export default router;

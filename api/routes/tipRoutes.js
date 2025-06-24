import express from "express";
import { tipCreator } from "../rewritten-controllers/tipController.js";

const router = express.Router();

// Route to handle tipping
router.post("/", tipCreator);

export default router;

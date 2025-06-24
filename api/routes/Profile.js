import express from "express";
import multer from "multer";
import { PrismaClient } from '@prisma/client';
import authenticateJWT from '../middleware/tokenVerify.js';
import mime from "mime-types";
const prisma = new PrismaClient();
const router = express.Router();
const upload = multer({ dest: 'uploads/' });
import { uploadFileToMinIO, deleteLocalFile } from "../utils/minio.js";
const getUserProfile = async (req, res) => {
  try {
    // Use the authenticated user's ID
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      include: { stats: true, posts: true },
    });
    if (!userProfile) {
      return res.status(404).json({ message: "User not found" });
    }
    userProfile.interests = userProfile.interests ? JSON.parse(userProfile.interests) : [];
    res.status(200).json(userProfile);
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, bio, interests, privacySettings } = req.body;
    const userIdInt = parseInt(userId);
    if (isNaN(userIdInt)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    const user = await prisma.user.findUnique({ where: { id: userIdInt } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    let imgPath = user.img;
    if (req.file) {
      try {
        const BUCKET = 'image-storage';
        const IMAGEFILEPATH = req.file.path;
        // Detect MIME type for any file
        const fileType = mime.lookup(IMAGEFILEPATH) || req.file.mimetype || "application/octet-stream";
        const { presignedUrl, filePath } = await uploadFileToMinIO(IMAGEFILEPATH, fileType, BUCKET);
        imgPath = filePath;
        // Delete the file from uploads after upload
        deleteLocalFile(IMAGEFILEPATH);
      } catch (uploadErr) {
        console.error("Error uploading to MinIO:", uploadErr);
        return res.status(500).json({ error: "Failed to upload image" });
      }
    }

    const updatedProfile = await prisma.user.update({
      where: { id: userIdInt },
      data: {
        name,
        bio,
        img: imgPath,
        interests: JSON.stringify(interests),
        privacySettings: "PUBLIC",
      },
    });
    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error("Error updating profile:", error.message);
    res.status(500).json({ error: error.message ? error.message : error });
  }
};

const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const userStats = await prisma.stats.findUnique({
      where: { id: parseInt(userId) },
    });
    if (!userStats) {
      return res.status(404).json({ message: 'Stats not found' });
    }
    res.status(200).json(userStats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { followers, posts, likes } = req.body;
    // Update user stats logic
    const updatedStats = await prisma.stats.update({
      where: { id: parseInt(userId) },
      data: { followers, posts, likes },
    });
    res.status(200).json(updatedStats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Routes
router.get('/profile', authenticateJWT, getUserProfile);
router.put('/profile/:userId', upload.single('img'), updateUserProfile);
router.get('/stats/:userId', getUserStats);
router.put('/stats/:userId', updateUserStats);

export default router;

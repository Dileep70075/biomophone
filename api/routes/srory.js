import express from "express";
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import fs from "fs";
import path from "path";
import * as Minio from "minio";
import multer from "multer";

const prisma = new PrismaClient();
const bucketName = "biophome";

// MinIO client configuration
const minioClient = new Minio.Client({
  endPoint: "s3storage.duoples.com",
  port: 443,
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

// Initialize bucket if it doesn't exist
const initializeBucket = async () => {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName);
      console.log(`Bucket '${bucketName}' created successfully`);
    }
  } catch (error) {
    console.error("Error initializing bucket:", error);
  }
};

// initializeBucket();

// Multer setup for file upload
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
}).single("file");

// Function to upload file to MinIO
const uploadFileToMinIO = async (filePath, fileType) => {
  const fileStream = fs.createReadStream(filePath);
  const fileName = `${Date.now()}-${path.basename(filePath)}`;
  const metaData = { "Content-Type": fileType || "application/octet-stream" };

  try {
    await minioClient.putObject(bucketName, fileName, fileStream, metaData);
    return `https://s3storage.duoples.com/${bucketName}/${fileName}`;
  } catch (error) {
    console.error("MinIO upload error:", error);
    throw error;
  }
};

// Route Handlers
const createStory = async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      upload(req, res, (err) => (err ? reject(err) : resolve()));
    });

    const { userId, content, type, expiresAt } = req.body;

    if (!userId || !content || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let fileUrl = null;
    if (req.file) {
      try {
        fileUrl = await uploadFileToMinIO(req.file.path, req.file.mimetype);
      } finally {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting temp file:", err);
        });
      }
    }

    const story = await prisma.story.create({
      data: {
        content,
        userId: parseInt(userId),
        type,
        expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 24 * 60 * 60 * 1000),
        imageUrl: type === "IMAGE" ? fileUrl : null,
        videoUrl: type === "VIDEO" ? fileUrl : null,
      },
    });

    res.status(201).json(story);
  } catch (error) {
    console.error("Error creating story:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

const getStories = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId in request." });
    }

    const stories = await prisma.story.findMany({
      where: {
        userId: parseInt(userId),
        OR: [
          { expiresAt: { gt: new Date() } },
          { highlight: true },
        ],
      },
      include: { views: true },
    });

    res.status(200).json(stories);
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const viewStory = async (req, res) => {
  try {
    const { storyId, userId } = req.body;

    if (!storyId || !userId) {
      return res.status(400).json({ error: "Missing storyId or userId" });
    }

    await prisma.storyViewer.create({ data: { storyId, userId } });
    const updatedStory = await prisma.story.update({
      where: { id: parseInt(storyId) },
      data: { views: { increment: 1 } },
    });

    res.status(200).json(updatedStory);
  } catch (error) {
    console.error("Error viewing story:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const highlightStory = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedStory = await prisma.story.update({
      where: { id: parseInt(id) },
      data: { highlight: true },
    });

    res.status(200).json(updatedStory);
  } catch (error) {
    console.error("Error highlighting story:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const draftStory = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const drafts = await prisma.story.findMany({
      where: { userId: parseInt(userId), isDraft: true },
    });

    res.status(200).json(drafts);
  } catch (error) {
    console.error("Error fetching drafts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Express Router
const router = express.Router();
router.post("/create", createStory);
router.get("/", getStories);
router.post("/view", viewStory);
router.patch("/highlight/:id", highlightStory);
router.get("/drafts", draftStory);

export default router;

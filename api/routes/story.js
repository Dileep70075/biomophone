import express from "express";
import multer from "multer";
// import { initializeBucket, uploadFileToMinIO } from "../utils/minio.js";
import fs from "fs";
import { prisma } from "../utils/db.js";

const router = express.Router();
const bucketName = "biophome";

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
}).single("file");

export const createStory = async (req, res) => {
  try {
    await initializeBucket(bucketName); // Initialize bucket

    await new Promise((resolve, reject) => {
      upload(req, res, (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    const { userId, content, type } = req.body;
    if (!userId || !content || !type) {
      return res.status(400).json({
        error: "User ID, content, and type are required",
        receivedData: req.body,
      });
    }

    let fileUrl = null;

    if (req.file) {
      try {
        fileUrl = await uploadFileToMinIO(
          req.file.path,
          req.file.mimetype,
          bucketName
        );
      } catch (error) {
        console.error("Error uploading file to MinIO:", error);
        return res.status(500).json({
          error: "Failed to upload file",
          details: error.message,
        });
      } finally {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting temporary file:", err);
        });
      }
    }

    const expiresAt = req.body.expiresAt
      ? new Date(req.body.expiresAt)
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // Default to 24 hours

    const story = await prisma.story.create({
      data: {
        content,
        userId: parseInt(userId),
        type,
        expiresAt,
        imageUrl: type === "IMAGE" ? fileUrl : null,
        videoUrl: type === "VIDEO" ? fileUrl : null,
      },
    });

    return res.status(201).json(story);
  } catch (error) {
    console.error("Error creating story:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

// Fetch stories uploaded by a user
export const getStories = async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: "Missing userId in request." });
  }

  try {
    const stories = await prisma.story.findMany({
      where: { userId },
      include: {
        views: true, // Include viewers data if needed
      },
    });

    return res.status(200).json(stories);
  } catch (error) {
    console.error("Error fetching stories:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// View Story API
export const viewStory = async () => {
  const { storyId, userId } = req.body;
  if (!storyId || !userId) {
    return res
      .status(400)
      .json({ error: "Missing storyId or userId in request body." });
  }

  try {
    await prisma.storyViewer.create({
      data: {
        storyId,
        userId,
      },
    });

    const updatedStory = await prisma.story.update({
      where: { id: storyId },
      data: { views: { increment: 1 } },
    });

    return res.status(200).json(updatedStory);
  } catch (error) {
    console.error("Error viewing story:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const highlightStory = async (req, res) => {
  const { storyId } = req.body;
  if (!storyId) {
    return res.status(400).json({ error: "Missing storyId in request body." });
  }

  try {
    const updatedStory = await prisma.story.update({
      where: { id: storyId },
      data: { highlight: true },
    });

    return res.status(200).json(updatedStory);
  } catch (error) {
    console.error("Error highlighting story:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Draft Story API - Fetch stories marked as draft
export const draftStory = async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const drafts = await prisma.story.findMany({
      where: { userId, isDraft: true },
    });
    return res.status(200).json(drafts);
  } catch (error) {
    console.error("Error fetching drafts:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Routes
router.post("/create", createStory);
router.get("/", getStories);
router.post("/view", viewStory);
router.post("/highlight", highlightStory);
router.get("/drafts", draftStory);

export default router;

// import pkg from "@prisma/client";
// const { PrismaClient } = pkg;
// import fs from "fs";
// import path from "path";
// import * as Minio from "minio";
// import multer from "multer";
// import express from "express";

// const prisma = new PrismaClient();
// const bucketName = "biophome";

// // MinIO client configuration
// const minioClient = new Minio.Client({
//   endPoint: "s3storage.duoples.com",
//   port: 443,
//   useSSL: true,
//   accessKey: process.env.MINIO_ACCESS_KEY,
//   secretKey: process.env.MINIO_SECRET_KEY,
// });

// // Initialize bucket if it doesn't exist
// const initializeBucket = async () => {
//   try {
//     const exists = await minioClient.bucketExists(bucketName);
//     if (!exists) {
//       await minioClient.makeBucket(bucketName);
//       console.log(`Bucket '${bucketName}' created successfully`);
//     }
//   } catch (error) {
//     console.error("Error initializing bucket:", error);
//   }
// };

// initializeBucket();

// // Multer setup for file upload
// const upload = multer({
//   dest: "uploads/",
//   limits: {
//     fileSize: 50 * 1024 * 1024, // 50MB limit
//   },
// }).single("file");

// // Function to upload file to MinIO
// const uploadFileToMinIO = async (filePath, fileType) => {
//   const fileStream = fs.createReadStream(filePath);
//   const fileName = `${Date.now()}-${path.basename(filePath)}`;
//   const metaData = {
//     "Content-Type": fileType || "application/octet-stream",
//   };

//   try {
//     await minioClient.putObject(bucketName, fileName, fileStream, metaData);
//     const fileUrl = `https://s3storage.duoples.com/${bucketName}/${fileName}`;
//     return fileUrl;
//   } catch (error) {
//     console.error("MinIO upload error:", error);
//     throw error;
//   }
// };

// // Create Story API
// export const createStory = async (req, res) => {
//   try {
//     // Handle file upload
//     await new Promise((resolve, reject) => {
//       upload(req, res, (err) => {
//         if (err) reject(err);
//         resolve();
//       });
//     });

//     const { userId, content, type } = req.body;

//     if (!userId || !content || !type) {
//       return res.status(400).json({
//         error: "User ID, content, and type are required",
//         receivedData: req.body,
//       });
//     }

//     let fileUrl = null;

//     if (req.file) {
//       try {
//         fileUrl = await uploadFileToMinIO(req.file.path, req.file.mimetype);
//       } catch (error) {
//         console.error("Error uploading file to MinIO:", error);
//         return res.status(500).json({
//           error: "Failed to upload file",
//           details: error.message,
//         });
//       } finally {
//         fs.unlink(req.file.path, (err) => {
//           if (err) console.error("Error deleting temporary file:", err);
//         });
//       }
//     }

//     const expiresAt = req.body.expiresAt
//       ? new Date(req.body.expiresAt)
//       : new Date(Date.now() + 24 * 60 * 60 * 1000); // Default to 24 hours

//     const story = await prisma.story.create({
//       data: {
//         content,
//         userId: parseInt(userId),
//         type,
//         expiresAt,
//         imageUrl: type === "IMAGE" ? fileUrl : null,
//         videoUrl: type === "VIDEO" ? fileUrl : null,
//       },
//     });

//     return res.status(201).json(story);
//   } catch (error) {
//     console.error("Error creating story:", error);
//     return res.status(500).json({
//       error: "Internal Server Error",
//       details: error.message,
//     });
//   }
// };

// // Fetch stories uploaded by a user
// export const getStories = async (req, res) => {
//   const { userId } = req.query; // Assuming userId is passed as a query parameter

//   if (!userId) {
//     return res.status(400).json({ error: "Missing userId in request." });
//   }

//   try {
//     const stories = await prisma.story.findMany({
//       where: { userId },
//       include: {
//         views: true, // Include viewers data if needed
//       },
//     });

//     return res.status(200).json(stories);
//   } catch (error) {
//     console.error("Error fetching stories:", error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// // View Story API
// export const viewStory = async (req, res) => {
//   const { storyId, userId } = req.body;

//   if (!storyId || !userId) {
//     return res
//       .status(400)
//       .json({ error: "Missing storyId or userId in request body." });
//   }

//   try {
//     await prisma.storyViewer.create({
//       data: {
//         storyId,
//         userId,
//       },
//     });

//     const updatedStory = await prisma.story.update({
//       where: { id: storyId },
//       data: { views: { increment: 1 } },
//     });

//     return res.status(200).json(updatedStory);
//   } catch (error) {
//     console.error("Error viewing story:", error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// // Highlight Story API
// export const highlightStory = async (req, res) => {
//   const { storyId } = req.body;

//   if (!storyId) {
//     return res.status(400).json({ error: "Missing storyId in request body." });
//   }

//   try {
//     const updatedStory = await prisma.story.update({
//       where: { id: storyId },
//       data: { highlight: true },
//     });

//     return res.status(200).json(updatedStory);
//   } catch (error) {
//     console.error("Error highlighting story:", error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// // Draft Story API - Fetch stories marked as draft
// export const draftStory = async (req, res) => {
//   const { userId } = req.query;

//   if (!userId) {
//     return res.status(400).json({ error: "User ID is required" });
//   }

//   try {
//     const drafts = await prisma.story.findMany({
//       where: { userId, isDraft: true },
//     });
//     return res.status(200).json(drafts);
//   } catch (error) {
//     console.error("Error fetching drafts:", error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// const router = express.Router();
// router.post("/create", createStory); // Create Story Route
// router.get("/", getStories); // Create Story Route
// router.post("/view", viewStory); // View Story Route
// router.post("/highlight", highlightStory); // Highlight Story Route
// router.get("/drafts", draftStory); // Drafts Route

// export default router;

































































// import express from "express";
// import multer from "multer";
// // import { initializeBucket, uploadFileToMinIO } from "../utils/minio.js";
// import fs from "fs";
// import { prisma } from "../utils/db.js";

// const router = express.Router();
// const bucketName = "biophome";

// const upload = multer({
//   dest: "uploads/",
//   limits: {
//     fileSize: 50 * 1024 * 1024, // 50MB limit
//   },
// }).single("file");

// export const createStory = async (req, res) => {
//   try {
//     await initializeBucket(bucketName); // Initialize bucket

//     await new Promise((resolve, reject) => {
//       upload(req, res, (err) => {
//         if (err) reject(err);
//         resolve();
//       });
//     });

//     const { userId, content, type } = req.body;
//     if (!userId || !content || !type) {
//       return res.status(400).json({
//         error: "User ID, content, and type are required",
//         receivedData: req.body,
//       });
//     }

//     let fileUrl = null;

//     if (req.file) {
//       try {
//         fileUrl = await uploadFileToMinIO(
//           req.file.path,
//           req.file.mimetype,
//           bucketName
//         );
//       } catch (error) {
//         console.error("Error uploading file to MinIO:", error);
//         return res.status(500).json({
//           error: "Failed to upload file",
//           details: error.message,
//         });
//       } finally {
//         fs.unlink(req.file.path, (err) => {
//           if (err) console.error("Error deleting temporary file:", err);
//         });
//       }
//     }

//     const expiresAt = req.body.expiresAt
//       ? new Date(req.body.expiresAt)
//       : new Date(Date.now() + 24 * 60 * 60 * 1000); // Default to 24 hours

//     const story = await prisma.story.create({
//       data: {
//         content,
//         userId: parseInt(userId),
//         type,
//         expiresAt,
//         imageUrl: type === "IMAGE" ? fileUrl : null,
//         videoUrl: type === "VIDEO" ? fileUrl : null,
//       },
//     });

//     return res.status(201).json(story);
//   } catch (error) {
//     console.error("Error creating story:", error);
//     return res.status(500).json({
//       error: "Internal Server Error",
//       details: error.message,
//     });
//   }
// };

// // Fetch stories uploaded by a user
// export const getStories = async (req, res) => {
//   const { userId } = req.query;
//   if (!userId) {
//     return res.status(400).json({ error: "Missing userId in request." });
//   }

//   try {
//     const stories = await prisma.story.findMany({
//       where: { userId },
//       include: {
//         views: true, // Include viewers data if needed
//       },
//     });

//     return res.status(200).json(stories);
//   } catch (error) {
//     console.error("Error fetching stories:", error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// // View Story API
// export const viewStory = async () => {
//   const { storyId, userId } = req.body;
//   if (!storyId || !userId) {
//     return res
//       .status(400)
//       .json({ error: "Missing storyId or userId in request body." });
//   }

//   try {
//     await prisma.storyViewer.create({
//       data: {
//         storyId,
//         userId,
//       },
//     });

//     const updatedStory = await prisma.story.update({
//       where: { id: storyId },
//       data: { views: { increment: 1 } },
//     });

//     return res.status(200).json(updatedStory);
//   } catch (error) {
//     console.error("Error viewing story:", error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// export const highlightStory = async (req, res) => {
//   const { storyId } = req.body;
//   if (!storyId) {
//     return res.status(400).json({ error: "Missing storyId in request body." });
//   }

//   try {
//     const updatedStory = await prisma.story.update({
//       where: { id: storyId },
//       data: { highlight: true },
//     });

//     return res.status(200).json(updatedStory);
//   } catch (error) {
//     console.error("Error highlighting story:", error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// // Draft Story API - Fetch stories marked as draft
// export const draftStory = async (req, res) => {
//   const { userId } = req.query;
//   if (!userId) {
//     return res.status(400).json({ error: "User ID is required" });
//   }

//   try {
//     const drafts = await prisma.story.findMany({
//       where: { userId, isDraft: true },
//     });
//     return res.status(200).json(drafts);
//   } catch (error) {
//     console.error("Error fetching drafts:", error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// // Routes
// router.post("/create", createStory);
// router.get("/", getStories);
// router.post("/view", viewStory);
// router.post("/highlight", highlightStory);
// router.get("/drafts", draftStory);

// export default router;

// // import pkg from "@prisma/client";
// // const { PrismaClient } = pkg;
// // import fs from "fs";
// // import path from "path";
// // import * as Minio from "minio";
// // import multer from "multer";
// // import express from "express";

// // const prisma = new PrismaClient();
// // const bucketName = "biophome";

// // // MinIO client configuration
// // const minioClient = new Minio.Client({
// //   endPoint: "s3storage.duoples.com",
// //   port: 443,
// //   useSSL: true,
// //   accessKey: process.env.MINIO_ACCESS_KEY,
// //   secretKey: process.env.MINIO_SECRET_KEY,
// // });

// // // Initialize bucket if it doesn't exist
// // const initializeBucket = async () => {
// //   try {
// //     const exists = await minioClient.bucketExists(bucketName);
// //     if (!exists) {
// //       await minioClient.makeBucket(bucketName);
// //       console.log(`Bucket '${bucketName}' created successfully`);
// //     }
// //   } catch (error) {
// //     console.error("Error initializing bucket:", error);
// //   }
// // };

// // initializeBucket();

// // // Multer setup for file upload
// // const upload = multer({
// //   dest: "uploads/",
// //   limits: {
// //     fileSize: 50 * 1024 * 1024, // 50MB limit
// //   },
// // }).single("file");

// // // Function to upload file to MinIO
// // const uploadFileToMinIO = async (filePath, fileType) => {
// //   const fileStream = fs.createReadStream(filePath);
// //   const fileName = `${Date.now()}-${path.basename(filePath)}`;
// //   const metaData = {
// //     "Content-Type": fileType || "application/octet-stream",
// //   };

// //   try {
// //     await minioClient.putObject(bucketName, fileName, fileStream, metaData);
// //     const fileUrl = `https://s3storage.duoples.com/${bucketName}/${fileName}`;
// //     return fileUrl;
// //   } catch (error) {
// //     console.error("MinIO upload error:", error);
// //     throw error;
// //   }
// // };

// // // Create Story API
// // export const createStory = async (req, res) => {
// //   try {
// //     // Handle file upload
// //     await new Promise((resolve, reject) => {
// //       upload(req, res, (err) => {
// //         if (err) reject(err);
// //         resolve();
// //       });
// //     });

// //     const { userId, content, type } = req.body;

// //     if (!userId || !content || !type) {
// //       return res.status(400).json({
// //         error: "User ID, content, and type are required",
// //         receivedData: req.body,
// //       });
// //     }

// //     let fileUrl = null;

// //     if (req.file) {
// //       try {
// //         fileUrl = await uploadFileToMinIO(req.file.path, req.file.mimetype);
// //       } catch (error) {
// //         console.error("Error uploading file to MinIO:", error);
// //         return res.status(500).json({
// //           error: "Failed to upload file",
// //           details: error.message,
// //         });
// //       } finally {
// //         fs.unlink(req.file.path, (err) => {
// //           if (err) console.error("Error deleting temporary file:", err);
// //         });
// //       }
// //     }

// //     const expiresAt = req.body.expiresAt
// //       ? new Date(req.body.expiresAt)
// //       : new Date(Date.now() + 24 * 60 * 60 * 1000); // Default to 24 hours

// //     const story = await prisma.story.create({
// //       data: {
// //         content,
// //         userId: parseInt(userId),
// //         type,
// //         expiresAt,
// //         imageUrl: type === "IMAGE" ? fileUrl : null,
// //         videoUrl: type === "VIDEO" ? fileUrl : null,
// //       },
// //     });

// //     return res.status(201).json(story);
// //   } catch (error) {
// //     console.error("Error creating story:", error);
// //     return res.status(500).json({
// //       error: "Internal Server Error",
// //       details: error.message,
// //     });
// //   }
// // };

// // // Fetch stories uploaded by a user
// // export const getStories = async (req, res) => {
// //   const { userId } = req.query; // Assuming userId is passed as a query parameter

// //   if (!userId) {
// //     return res.status(400).json({ error: "Missing userId in request." });
// //   }

// //   try {
// //     const stories = await prisma.story.findMany({
// //       where: { userId },
// //       include: {
// //         views: true, // Include viewers data if needed
// //       },
// //     });

// //     return res.status(200).json(stories);
// //   } catch (error) {
// //     console.error("Error fetching stories:", error);
// //     return res.status(500).json({ error: "Internal Server Error" });
// //   }
// // };

// // // View Story API
// // export const viewStory = async (req, res) => {
// //   const { storyId, userId } = req.body;

// //   if (!storyId || !userId) {
// //     return res
// //       .status(400)
// //       .json({ error: "Missing storyId or userId in request body." });
// //   }

// //   try {
// //     await prisma.storyViewer.create({
// //       data: {
// //         storyId,
// //         userId,
// //       },
// //     });

// //     const updatedStory = await prisma.story.update({
// //       where: { id: storyId },
// //       data: { views: { increment: 1 } },
// //     });

// //     return res.status(200).json(updatedStory);
// //   } catch (error) {
// //     console.error("Error viewing story:", error);
// //     return res.status(500).json({ error: "Internal Server Error" });
// //   }
// // };

// // // Highlight Story API
// // export const highlightStory = async (req, res) => {
// //   const { storyId } = req.body;

// //   if (!storyId) {
// //     return res.status(400).json({ error: "Missing storyId in request body." });
// //   }

// //   try {
// //     const updatedStory = await prisma.story.update({
// //       where: { id: storyId },
// //       data: { highlight: true },
// //     });

// //     return res.status(200).json(updatedStory);
// //   } catch (error) {
// //     console.error("Error highlighting story:", error);
// //     return res.status(500).json({ error: "Internal Server Error" });
// //   }
// // };

// // // Draft Story API - Fetch stories marked as draft
// // export const draftStory = async (req, res) => {
// //   const { userId } = req.query;

// //   if (!userId) {
// //     return res.status(400).json({ error: "User ID is required" });
// //   }

// //   try {
// //     const drafts = await prisma.story.findMany({
// //       where: { userId, isDraft: true },
// //     });
// //     return res.status(200).json(drafts);
// //   } catch (error) {
// //     console.error("Error fetching drafts:", error);
// //     return res.status(500).json({ error: "Internal Server Error" });
// //   }
// // };

// // const router = express.Router();
// // router.post("/create", createStory); // Create Story Route
// // router.get("/", getStories); // Create Story Route
// // router.post("/view", viewStory); // View Story Route
// // router.post("/highlight", highlightStory); // Highlight Story Route
// // router.get("/drafts", draftStory); // Drafts Route

// // export default router;

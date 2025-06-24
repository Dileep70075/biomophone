import fs from "fs";
import {
  // copyFileToPublicBucket,
  // initializeBucket,
  // uploadFileToMinIO,
} from "../utils/minio.js";
import { prisma } from "../utils/db.js";

const bucketName = "biophone-bucket2";

export const createPost = async (req, res) => {
  try {
    const { userId, content } = req.body;
    if (!userId || !content) {
      return res.status(400).json({
        error: "User ID and content are required",
        receivedData: req.body,
      });
    }

    let imageUrl = null;
    let filePath = null;

    if (req.file) {
      try {
        await initializeBucket(bucketName); // initializing bucket if not exist

        const uploadResult = await uploadFileToMinIO(
          req.file.path,
          req.file.mimetype,
          bucketName
        );

        if (!uploadResult?.presignedUrl || !uploadResult?.filePath) {
          throw new Error(
            "MinIO upload failed, missing presignedUrl or filePath"
          );
        }

        imageUrl = uploadResult.presignedUrl;
        filePath = uploadResult.filePath;
      } catch (error) {
        console.error("Error uploading to MinIO:", error);
        return res.status(500).json({
          error: "Failed to upload image",
          details: error.message,
        });
      } finally {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting temporary file:", err);
        });
      }
    }

    const post = await prisma.post.create({
      data: {
        content,
        img: filePath,
        authorId: parseInt(userId),
      },
    });

    return res.status(201).json({
      ...post,
      img: imageUrl,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

export const getImage = async (req, res) => {
  try {
    console.log("enter get image");
    const { bucketName, fileName } = req.params;
    // const userId = req.user.id;

    const post = await prisma.post.findFirst({
      where: {
        img: fileName,
        // authorId: userId,
      },
    });

    if (!post) {
      return res.status(403).json({ error: "Access denied" });
    }

    const stream = await minioClient.getObject(bucketName, fileName);

    const fileExtension = path.extname(fileName).toLowerCase();
    let contentType = "application/octet-stream"; // Default content type

    switch (fileExtension) {
      case ".jpg":
      case ".jpeg":
        contentType = "image/jpeg";
        break;
      case ".png":
        contentType = "image/png";
        break;
      case ".mp4":
        contentType = "video/mp4";
        break;
      case ".pdf":
        contentType = "application/pdf";
        break;
    }

    res.setHeader("Content-Type", contentType);

    stream.pipe(res);
  } catch (error) {
    console.error("Error fetching file:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

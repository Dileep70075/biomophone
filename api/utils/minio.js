import * as Minio from "minio";
import fs from "fs";
import path from "path";
import mime from "mime-types";

// Validate required environment variables
const validateEnvVariables = () => {
  const requiredEnvVars = [
    "MINIO_ENDPOINT",
    "MINIO_ACCESS_KEY",
    "MINIO_SECRET_KEY",
  ];

  if (process.env.NODE_ENV !== "production") {
    requiredEnvVars.push(
      "MINIO_DEVELOPMENT_ENDPOINT",
      "MINIO_DEVELOPMENT_ACCESS_KEY",
      "MINIO_DEVELOPMENT_SECRET_KEY"
    );
  }

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
};

validateEnvVariables();

let s3Config = {
  endPoint: process.env.MINIO_ENDPOINT,
  // port: process.env.MINIO_PORT,
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
};

if (process.env.NODE_ENV !== "production") {
  s3Config = {
    endPoint: process.env.MINIO_DEVELOPMENT_ENDPOINT,
    // port: process.env.MINIO_DEVELOPMENT_PORT,
    useSSL: true,
    accessKey: process.env.MINIO_DEVELOPMENT_ACCESS_KEY,
    secretKey: process.env.MINIO_DEVELOPMENT_SECRET_KEY,
  };
}

export const minioClient = new Minio.Client(s3Config);

export const initializeBucket = async (bucketName, isPublic = false) => {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName);
    }

    if (isPublic) {
      const policy = {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: "*",
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${bucketName}/*`],
          },
        ],
      };
      await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
    }

    return true;
  } catch (error) {
    console.error("Error initializing bucket:", error);
    return false;
  }
};

export const uploadFileToMinIO = async (IMAGEFILEPATH, fileType, bucketName) => {
  // Auto-detect MIME type if not provided
  const detectedType = fileType || mime.lookup(IMAGEFILEPATH) || "application/octet-stream";
  const fileStream = fs.createReadStream(IMAGEFILEPATH);
  const fileName = `${Date.now()}-${path.basename(IMAGEFILEPATH)}`;
  const metaData = {
    "Content-Type": detectedType,
  };
  try {
    await minioClient.putObject(bucketName, fileName, fileStream, metaData);

    if (fs.existsSync(IMAGEFILEPATH)) {
      fs.unlinkSync(IMAGEFILEPATH);
    } else {
      console.warn('Temp file does not exist:', IMAGEFILEPATH);
    }

    let fileUrl;
    if (process.env.NODE_ENV === "production") {
      fileUrl = `${process.env.MINIO_URL}/${bucketName}/${fileName}`;
    } else {
      fileUrl = `http://${process.env.MINIO_DEVELOPMENT_ENDPOINT}:${process.env.MINIO_DEVELOPMENT_PORT}/${bucketName}/${fileName}`;
    }
    const presignedUrl = await minioClient.presignedGetObject(
      bucketName,
      fileName,
      24 * 60 * 60 // 1 day expiry
    );
    const filePath = `${bucketName}/${fileName}`;
    return { presignedUrl, filePath };
  } catch (error) {
    console.error("MinIO upload error:", error);
    throw error;
  }
};

// No longer needed to this function !...
export const copyFileToPublicBucket = async (privateBucket, fileName) => {
  const publicBucket = process.env.MINIO_PUBLIC_BUCKET;
  try {
    await initializeBucket(publicBucket, true);
    await minioClient.copyObject(
      publicBucket,
      fileName,
      `/${privateBucket}/${fileName}`
    );
    let publicUrl;
    if (process.env.NODE_ENV === "production") {
      publicUrl = `${process.env.MINIO_URL}/${publicBucket}/${fileName}`;
    } else {
      publicUrl = `http://${process.env.MINIO_DEVELOPMENT_ENDPOINT}:${process.env.MINIO_DEVELOPMENT_PORT}/${publicBucket}/${fileName}`;
    }
    // console.log("public url : ", publicUrl);
    return publicUrl;
  } catch (error) {
    console.error("Error copying file to public bucket:", error);
    throw error;
  }
};











/**
 * Delete a file from the local uploads directory.
 * @param {string} filePath - The path to the file to delete.
 * @returns {boolean} - True if deleted, false otherwise.
 */
export const deleteLocalFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    } else {
      console.warn("File does not exist:", filePath);
      return false;
    }
  } catch (err) {
    console.error("Error deleting file:", filePath, err);
    return false;
  }
};

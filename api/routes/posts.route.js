import express from "express";
import { getPosts, addPost, deletePost } from "../controllers/post.js";
import { upload } from "../middleware/multer.js";
import authenticateJWT from "../middleware/tokenVerify.js";
import {
  createPost,
  getImage,
} from "../rewritten-controllers/posts.controller.js";

const router = express.Router();

router.get("/", getPosts);
// router.post("/", addPost);
router.delete("/:id", deletePost);

router.get("/:bucketName/:fileName", authenticateJWT, getImage);

router.post(
  "/createPostPrisma",
  upload.single("img"),
  authenticateJWT,
  createPost
);

export default router;

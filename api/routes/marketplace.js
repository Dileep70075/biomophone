import express from "express";
import multer from "multer";
import path from "path";
import {
  createItem,
  getAllItems,
  updateItem,
  deleteItem,
  getItemById,
} from "../rewritten-controllers/marketplaceController.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Save in 'uploads' directory
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });
const router = express.Router();

router.post("/", upload.single("imageUrl"), createItem);
router.get("/", getAllItems);
router.put("/:id", upload.single("imageUrl"), updateItem); // Add route for updating an item
router.delete("/:id", deleteItem);
router.get("/:id", getItemById);
export default router;

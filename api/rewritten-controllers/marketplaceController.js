import { PrismaClient } from '@prisma/client';
import mime from "mime-types";
import { uploadFileToMinIO, deleteLocalFile } from '../utils/minio.js';
const prisma = new PrismaClient();

export const createItem = async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }
    // Detect MIME type for any file
    const fileType = mime.lookup(req.file.path) || req.file.mimetype || "application/octet-stream";
    let imageUrl = `/uploads/${req.file.filename}`;
    if (!title || !description || isNaN(price) || !imageUrl || !category) {
      return res.status(400).json({ error: 'All fields are required and must be valid' });
    }
    if (title.length < 3) {
      return res.status(400).json({ error: 'Title must be at least 3 characters long' });
    }
    if (description.length < 10) {
      return res.status(400).json({ error: 'Description must be at least 10 characters long' });
    }
    if (parseFloat(price) <= 0) {
      return res.status(400).json({ error: 'Price must be greater than zero' });
    }
    const existingItem = await prisma.marketplaceItem.findFirst({
      where: {
        title,
        price: parseFloat(price),
      },
    });
    if (existingItem) {
      return res.status(409).json({ message: 'Item with the same title and price already exists' });
    }

    // Upload to MinIO and delete local file
    let minioFilePath = null;
    try {
      const BUCKET = 'image-storage';
      const IMAGEFILEPATH = req.file.path;
      const { presignedUrl, filePath } = await uploadFileToMinIO(IMAGEFILEPATH, fileType, BUCKET);
      minioFilePath = filePath;
      deleteLocalFile(IMAGEFILEPATH);
      imageUrl = filePath; // Save MinIO path in DB
    } catch (uploadErr) {
      console.error("Error uploading to MinIO:", uploadErr);
      return res.status(500).json({ error: "Failed to upload image" });
    }

    const item = await prisma.marketplaceItem.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        imageUrl,
        category,
      },
    });
    res.status(201).json({ data: item, message: 'success' });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: error.message || error });
  }
};

export const getAllItems = async (req, res) => {
  try {
    const items = await prisma.marketplaceItem.findMany();
    res.status(201).json({ data: items, message: 'success' });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.marketplaceItem.findUnique({
      where: { id: parseInt(id) },
    });
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json({ data: item, message: "success" });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.marketplaceItem.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, category } = req.body;
    let imageUrl = null;

    if (req.file) {
      // Detect MIME type for any file
      const fileType = mime.lookup(req.file.path) || req.file.mimetype || "application/octet-stream";
      try {
        const BUCKET = 'image-storage';
        const IMAGEFILEPATH = req.file.path;
        const { presignedUrl, filePath } = await uploadFileToMinIO(IMAGEFILEPATH, fileType, BUCKET);
        deleteLocalFile(IMAGEFILEPATH);
        imageUrl = filePath; // Save MinIO path in DB
      } catch (uploadErr) {
        console.error("Error uploading to MinIO:", uploadErr);
        return res.status(500).json({ error: "Failed to upload image" });
      }
    }

    if (!title || !description || isNaN(price) || !category) {
      return res.status(400).json({ error: 'All fields are required and must be valid' });
    }
    if (title.length < 3) {
      return res.status(400).json({ error: 'Title must be at least 3 characters long' });
    }
    if (description.length < 10) {
      return res.status(400).json({ error: 'Description must be at least 10 characters long' });
    }
    if (parseFloat(price) <= 0) {
      return res.status(400).json({ error: 'Price must be greater than zero' });
    }

    const updatedItem = await prisma.marketplaceItem.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        price: parseFloat(price),
        ...(imageUrl && { imageUrl }), // Update imageUrl only if a new file is uploaded
        category,
      },
    });

    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: error.message ? error.message : error });
  }
};



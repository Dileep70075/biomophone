import express from 'express';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();
import authenticateJWT from "../middleware/tokenVerify.js";
export const createCommunity = async (req, res) => {
  const { name, description, type } = req.body;

  try {
    const community = await prisma.community.create({
      data: {
        name,
        description,
        type,
        userId: req.user.id, // Ensure userId is included
      },
    });
    return res.status(201).json(community);
  } catch (error) {
    console.error('Error creating community:', error);
    return res.status(500).json({ error: error.message ? error.message : error });
  }
};

export const getAllCommunities = async (req, res) => {
  try {
    const communities = await prisma.community.findMany({
      where: { userId: req.user.id }, // Fetch only communities belonging to the logged-in user
    });
    return res.status(200).json(communities);
  } catch (error) {
    console.error('Error fetching communities:', error);
    return res.status(500).json({ error: error.message ? error.message : error });
  }
};

// New function to get one community by ID
export const oneCommunity = async (req, res) => {
  const { id } = req.query; // Retrieve the ID from query parameters
  try {
    const community = await prisma.community.findUnique({
      where: { id: parseInt(id, 10) }, // Ensure the ID is an integer
    });

    if (community) {
      return res.status(200).json(community);
    } else {
      return res.status(404).json({ error: 'Community not found' });
    }
  } catch (error) {
    console.error('Error fetching community:', error);
    return res.status(500).json({ error: error.message ? error.message : error });
  }
};

const router = express.Router();

router.post('/create',authenticateJWT, createCommunity);
router.get('/',authenticateJWT, getAllCommunities);
router.get('/one', oneCommunity); // Add route for fetching one community

export default router;

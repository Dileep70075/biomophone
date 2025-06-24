import express from 'express';
import { prisma } from '../utils/db.js';

const router = express.Router();

router.get('/all-users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
      }
    });
    res.status(200).json(users);
    // console.log(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({error:error.message ? error.message : error  });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
      }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error:error.message ? error.message : error });
  }
});

// Update user by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, username } = req.body;
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { name, email, username }
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error:error.message ? error.message : error });
  }
});

// Delete user by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await prisma.friendRequest.deleteMany({
      where: {
        OR: [
          { senderId: parseInt(id) },
          { receiverId: parseInt(id) }
        ]
      }
    });
    await prisma.user.delete({
      where: { id: parseInt(id) }
    });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message ? error.message : error });
  }
});

export default router;

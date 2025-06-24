import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const router = express.Router();

// Admin Dashboard: Get user stats
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalReports = await prisma.report.count();
    const flaggedPosts = await prisma.post.count({
      where: { isFlagged: true },
    });

    const stats = {
      totalUsers,
      totalReports,
      flaggedPosts,
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Admin: Reported Content
export const getReportedContent = async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        content: true, // Assuming 'content' is the related table where the reported post is stored
        user: true, // Assuming 'user' is the related table for the reporting user
      },
    });

    return res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching reported content:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Admin: Block User
export const blockUser = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId in request body.' });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isBlocked: true },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error blocking user:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Admin: Mute User
export const muteUser = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId in request body.' });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isMuted: true },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error muting user:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Admin: Report User
export const reportUser = async (req, res) => {
  const { userId, reason } = req.body;

  if (!userId || !reason) {
    return res.status(400).json({ error: 'User ID and reason are required.' });
  }

  try {
    const report = await prisma.report.create({
      data: {
        userId,
        reason,
        status: 'PENDING', // Assuming pending status for new reports
      },
    });

    return res.status(201).json(report);
  } catch (error) {
    console.error('Error reporting user:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Admin Routes
router.get('/stats', getUserStats);
router.get('/reports', getReportedContent);
router.post('/block', blockUser);
router.post('/mute', muteUser);
router.post('/report', reportUser);

export default router;

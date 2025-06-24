import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();
export const getChartData = async (req, res) => {
    try {
      const data = [
        { label: 'Users', value: await prisma.user.count() },
        { label: 'Reports', value: await prisma.report.count() },
        { label: 'Flagged Posts', value: await prisma.post.count({ where: { isFlagged: true } }) },
      ];
  
      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  router.get('/chart-data', getChartData);
  export default router;
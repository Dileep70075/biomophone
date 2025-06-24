// src/routes/rsvps.js
import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/create', async (req, res) => {
  const { eventId, status } = req.body;

  try {
    const rsvp = await prisma.rSVP.create({
      data: {
        eventId,
        status,
        userId: req.user.id, // Assuming you have user authentication setup
      },
    });
    return res.status(201).json(rsvp);
  } catch (error) {
    console.error('Error creating RSVP:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;

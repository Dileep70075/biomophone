import express from 'express';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();


export const createEvent = async (req, res) => {
  const { name, description, date, groupId, creatorId } = req.body;

  try {

    if (!name || !description || !date || !creatorId) {
      return res.status(400).json({ error: "All fields except groupId are required!" });
    }
    const user = await prisma.user.findUnique({
      where: { id: creatorId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (groupId) {
      const group = await prisma.group.findUnique({
        where: { id: parseInt(groupId) },
      });

      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }
    }
    const event = await prisma.event.create({
      data: {
        name,
        description,
        date: new Date(date),
        groupId: groupId ? parseInt(groupId) : null,    creatorId,
      },
    });

    return res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
export const getAllEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany();
    return res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const router = express.Router();
router.post('/create', createEvent);
router.get('/', getAllEvents);

export default router;
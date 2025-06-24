
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { sendReminder } from './notificationService';

const prisma = new PrismaClient();

cron.schedule('0 9 * * *', async () => {
  const events = await prisma.event.findMany({
    where: {
      date: {
        gte: new Date(),
        lt: new Date(Date.now() + 24 * 60 * 60 * 1000), 
      },
    },
  });

  events.forEach((event) => {
    sendReminder(event); 
  });
});

export default cron;

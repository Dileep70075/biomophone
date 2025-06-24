import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

// Send a message
export const sendMessage = async (req, res) => {
    const { senderId, receiverId, content } = req.body;

    if (!senderId || !receiverId || !content) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const message = await prisma.message.create({
            data: {
                content,
                senderId,
                receiverId,
            },
        });

        return res.status(201).json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Fetch messages between two users
// export const getMessages = async (req, res) => {
//     const { userId1, userId2 } = req.params;

//     if (!userId1 || !userId2) {
//         return res.status(400).json({ error: 'User IDs are required' });
//     }

//     try {
//         const messages = await prisma.message.findMany({
//             where: {
//                 OR: [
//                     { senderId: parseInt(userId1), receiverId: parseInt(userId2) },
//                     { senderId: parseInt(userId2), receiverId: parseInt(userId1) },
//                 ],
//             },
//             orderBy: {
//                 createdAt: 'asc',
//             },
//         });

//         return res.status(200).json(messages);
//     } catch (error) {
//         console.error('Error fetching messages:', error);
//         return res.status(500).json({ error: 'Internal Server Error' });
//     }
// };
export const getMessages = async (req, res) => {
    const { userId1, userId2 } = req.params;
    const { page = 1, limit = 20 } = req.query;  // Default pagination
  
    try {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: parseInt(userId1), receiverId: parseInt(userId2) },
            { senderId: parseInt(userId2), receiverId: parseInt(userId1) },
          ],
        },
        orderBy: {
          createdAt: 'asc',
        },
        skip: (page - 1) * limit,
        take: limit,
      });
  
      return res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
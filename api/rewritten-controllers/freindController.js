import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();





export const sendFriendRequest = async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user?.id; 
  // console.log("senderId:", senderId);
  // console.log("receiverId:", receiverId);
  if (!receiverId || !senderId) {
    return res.status(400).json({ message: 'Sender or receiver not found' });
  }
  try {
    const receiver = await prisma.user.findUnique({
      where: { id: parseInt(receiverId) },
    });
    if (!receiver) {
      return res.status(404).json({ message: 'User not found' });
    }
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: senderId, receiverId: parseInt(receiverId) },
          { senderId: parseInt(receiverId), receiverId: senderId },
        ],
        status: 'PENDING',
      },
    });
    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent or received' });
    }
    const newRequest = await prisma.friendRequest.create({
      data: {
        senderId: senderId,
        receiverId: parseInt(receiverId),
      },
    });
    res.status(201).json({ message: 'Friend request sent', request: newRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};







export const acceptFriendRequest = async (req, res) => {
  const { requestId } = req.body;
  console.log("requestId:", requestId);
  const receiverId = req.user?.id; // Authenticated user
  try {
    const request = await prisma.friendRequest.findUnique({
      where: { id: parseInt(requestId) },
    });
    if (!request) {
      return res.status(404).json({ error: 'Friend request not found.' });
    }
    if (request.status !== 'PENDING') {
      return res.status(400).json({ error: 'Request already processed.' });
    }
    if (request.receiverId !== receiverId) {
      return res.status(403).json({ error: 'Unauthorized to accept this request.' });
    }
    await prisma.friendRequest.update({
      where: { id: request.id },
      data: { status: 'ACCEPTED' },
    });
    await prisma.user.update({
      where: { id: request.senderId },
      data: {
        friends: { connect: { id: request.receiverId } },
      },
    });
    await prisma.user.update({
      where: { id: request.receiverId },
      data: {
        friends: { connect: { id: request.senderId } },
      },
    });
    res.status(200).json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};








export const declineFriendRequest = async (req, res) => {
  const { requestId } = req.body;
  const receiverId = req.user?.id;
  try {
    const request = await prisma.friendRequest.findUnique({
      where: { id: parseInt(requestId) },
    });
    if (!request) {
      return res.status(404).json({ error: 'Friend request not found.' });
    }
    if (request.receiverId !== receiverId) {
      return res.status(403).json({ error: 'Unauthorized to decline this request.' });
    }
    const declined = await prisma.friendRequest.update({
      where: { id: parseInt(requestId) },
      data: { status: 'DECLINED' },
    });
    res.status(200).json({ message: 'Friend request declined', request: declined });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};














export const getFriendRequests = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(400).json({ message: 'User ID not found' });
  }
  try {
    // 1. Get all users except the current user
    const allUsers = await prisma.user.findMany({
      where: { id: { not: userId } },
      select: { id: true, email: true, name: true, img: true }
    });

    // 2. Get all friend requests where the user is sender or receiver
    const friendRequests = await prisma.friendRequest.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      }
    });

    // 3. Map users to include friend request status if exists
    const formattedUsers = allUsers.map(user => {
      // Find if a request exists between current user and this user
      const myRequest = friendRequests.find(
        req => req.senderId === userId && req.receiverId === user.id
      );
      const userRequest = friendRequests.find(
        req => req.senderId === user.id && req.receiverId === userId
      );
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        img: user.img,
        myRequest: myRequest || null,
        userRequest: userRequest || null
      };
    });

    return res.status(200).json({
      message: 'getLoginUser success',
      data: formattedUsers,
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message ? error.message : error });
  }
};
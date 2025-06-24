import pkg from '@prisma/client';
const { PrismaClient } = pkg;
export const prisma = new PrismaClient();

export const tipCreator = async (req, res) => {
  const { userId, creatorId, amount } = req.body;

  try {
    if (!userId || !creatorId || !amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid tipping data." });
    }

    const tip = await prisma.tip.create({
      data: {
        userId,
        creatorId,
        amount,
      },
    });

    res.status(201).json({ message: "Tip successfully sent!", tip });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send tip.", error });
  }
};

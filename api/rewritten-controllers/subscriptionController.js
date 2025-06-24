import pkg from '@prisma/client';
const { PrismaClient } = pkg;
export const prisma = new PrismaClient();

const subscriptionPlans = {
  Basic: { price: 10, duration: 1 },
  Premium: { price: 25, duration: 1 },
  Pro: { price: 50, duration: 1 },
};

// Subscribe User
export const subscribeUser = async (req, res) => {
  const { userId, plan } = req.body;

  if (!subscriptionPlans[plan]) {
    return res.status(400).json({ message: "Invalid subscription plan." });
  }

  const { price, duration } = subscriptionPlans[plan];
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(startDate.getMonth() + duration);

  try {
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      return res.status(400).json({ message: "User does not exist!" });
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        plan,
        amount: price,
        startDate,
        endDate,
        isActive: true,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        isPremium: true,
        membershipExpiry: endDate,
      },
    });

    res.status(201).json({
      success: true,
      message: `Successfully subscribed to the ${plan} plan!`,
      subscription,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create subscription.", error });
  }
};

// Fetch Subscription
export const fetchSubscription = async (req, res) => {
  const { userId } = req.body;

  try {
    const subscription = await prisma.subscription.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription) {
      return res.status(404).json({ success: false, message: "No active subscription found." });
    }

    res.status(200).json({ success: true, subscription });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch subscription.", error });
  }
};

// Cancel Subscription
export const cancelSubscription = async (req, res) => {
  const { userId } = req.body;

  try {
    const subscription = await prisma.subscription.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    if (!subscription) {
      return res.status(404).json({ success: false, message: "No active subscription found to cancel." });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isPremium: false },
    });

    res.status(200).json({ success: true, message: "Subscription cancelled successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to cancel subscription.", error });
  }
};

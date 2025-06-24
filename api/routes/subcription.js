import express from "express";
import { subscribeUser, fetchSubscription, cancelSubscription } from "../rewritten-controllers/subscriptionController.js";

const router = express.Router();

// Route to subscribe a user
router.post("/sub", (req, res) => {
  const { action } = req.body;

  if (action === "subscribe") {
    subscribeUser(req, res);
  } else if (action === "fetch") {
    fetchSubscription(req, res);
  } else if (action === "cancel") {
    cancelSubscription(req, res);
  } else {
    res.status(400).json({ success: false, message: "Invalid action provided." });
  }
});

export default router;

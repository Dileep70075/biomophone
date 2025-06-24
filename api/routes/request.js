import express from 'express';
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getFriendRequests,
} from '../rewritten-controllers/freindController.js';
import authenticateJWT from '../middleware/tokenVerify.js';

const router = express.Router();

router.post('/send-request', authenticateJWT, sendFriendRequest);
router.post('/accept-request', authenticateJWT, acceptFriendRequest);
router.post('/decline-request', authenticateJWT, declineFriendRequest);
router.get('/requests', authenticateJWT, getFriendRequests);

export default router;

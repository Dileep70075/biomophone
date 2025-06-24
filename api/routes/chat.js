import express from 'express';
import { sendMessage, getMessages } from '../rewritten-controllers/chatController.js';
import authenticateJWT from "../middleware/tokenVerify.js";


const router = express.Router();

router.post('/send', authenticateJWT , sendMessage);
router.get('/messages/:userId1/:userId2', authenticateJWT , getMessages);

export default router;

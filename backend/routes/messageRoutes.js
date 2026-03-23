const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getRecentMessages
} = require('../controllers/messageController');

// All message routes require authentication and donor role
router.use(protect);
router.use(authorize('donor'));

// Conversations
router.get('/conversations', getConversations);
router.get('/recent', getRecentMessages);

// Messages with specific school
router.get('/:schoolId', getMessages);
router.post('/:schoolId', sendMessage);
router.put('/:schoolId/read', markAsRead);

module.exports = router;
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Message = require('../models/Message');
const School = require('../models/School');
const User = require('../models/User');

// All message routes require authentication
router.use(protect);
router.use(authorize('donor'));

// IMPORTANT: Specific routes MUST come before parameter routes
// Get recent messages (must be before :schoolId route)
router.get('/recent', async (req, res) => {
  try {
    const donorId = req.user.id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: donorId, receiverRole: 'school' },
            { receiverId: donorId, senderRole: 'school' }
          ]
        }
      },
      {
        $group: {
          _id: '$schoolId',
          lastMessage: { $last: '$text' },
          lastMessageTime: { $last: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiverId', donorId] }, { $eq: ['$read', false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { lastMessageTime: -1 } },
      { $limit: 5 }
    ]);

    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const school = await School.findById(conv._id);
        return {
          schoolId: conv._id,
          schoolName: school?.schoolName || 'Unknown School',
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessageTime,
          unread: conv.unreadCount > 0
        };
      })
    );

    res.json(populatedConversations);
  } catch (error) {
    console.error('Get recent messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get conversations list
router.get('/conversations', async (req, res) => {
  try {
    const donorId = req.user.id;
    
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: donorId, receiverRole: 'school' },
            { receiverId: donorId, senderRole: 'school' }
          ]
        }
      },
      {
        $group: {
          _id: '$schoolId',
          lastMessage: { $last: '$text' },
          lastMessageTime: { $last: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiverId', donorId] }, { $eq: ['$read', false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { lastMessageTime: -1 } }
    ]);

    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const school = await School.findById(conv._id);
        return {
          schoolId: conv._id,
          schoolName: school?.schoolName || 'Unknown School',
          schoolLocation: school?.address?.city || 'Unknown',
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessageTime,
          unreadCount: conv.unreadCount
        };
      })
    );

    res.json(populatedConversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages with a specific school (must come after specific routes)
router.get('/:schoolId', async (req, res) => {
  try {
    const { schoolId } = req.params;
    const donorId = req.user.id;

    // Validate schoolId is a valid ObjectId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return res.status(400).json({ message: 'Invalid school ID' });
    }

    const messages = await Message.find({
      schoolId,
      $or: [
        { senderId: donorId, receiverRole: 'school' },
        { receiverId: donorId, senderRole: 'school' }
      ]
    }).sort('createdAt');

    // Mark messages as read
    await Message.updateMany(
      {
        schoolId,
        receiverId: donorId,
        senderRole: 'school',
        read: false
      },
      { $set: { read: true, readAt: new Date() } }
    );

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message to school
router.post('/:schoolId', async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { message } = req.body;
    const donorId = req.user.id;

    // Validate schoolId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return res.status(400).json({ message: 'Invalid school ID' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    const newMessage = new Message({
      senderId: donorId,
      senderRole: 'donor',
      receiverId: school.userId,
      receiverRole: 'school',
      schoolId,
      text: message.trim(),
      read: false
    });

    await newMessage.save();

    res.status(201).json({
      id: newMessage._id,
      sender: 'donor',
      text: newMessage.text,
      createdAt: newMessage.createdAt,
      read: newMessage.read
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark messages as read
router.put('/:schoolId/read', async (req, res) => {
  try {
    const { schoolId } = req.params;
    const donorId = req.user.id;

    // Validate schoolId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return res.status(400).json({ message: 'Invalid school ID' });
    }

    await Message.updateMany(
      {
        schoolId,
        receiverId: donorId,
        senderRole: 'school',
        read: false
      },
      { $set: { read: true, readAt: new Date() } }
    );

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
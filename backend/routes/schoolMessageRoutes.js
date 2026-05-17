const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Message = require('../models/Message');
const School = require('../models/School');
const Donor = require('../models/Donor');
const mongoose = require('mongoose');

// All message routes require authentication and school role
router.use(protect);
router.use(authorize('school'));

// Get conversations for school
router.get('/conversations', async (req, res) => {
  try {
    const school = await School.findOne({ userId: req.user.id });
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    const conversations = await Message.aggregate([
      {
        $match: {
          schoolId: school._id,
          $or: [
            { senderRole: 'donor' },
            { receiverRole: 'donor' }
          ]
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderRole', 'donor'] },
              '$senderId',
              '$receiverId'
            ]
          },
          lastMessage: { $last: '$text' },
          lastMessageTime: { $last: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiverId', req.user.id] }, { $eq: ['$read', false] }] },
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
        const donor = await Donor.findOne({ userId: conv._id });
        return {
          donorId: conv._id,
          donorName: donor?.fullName || 'Donor',
          donorEmail: (await User.findById(conv._id))?.email,
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessageTime,
          unreadCount: conv.unreadCount
        };
      })
    );

    res.json(populatedConversations);
  } catch (error) {
    console.error('Get school conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages with a specific donor
router.get('/:donorId', async (req, res) => {
  try {
    const { donorId } = req.params;
    const school = await School.findOne({ userId: req.user.id });
    
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    if (!mongoose.Types.ObjectId.isValid(donorId)) {
      return res.status(400).json({ message: 'Invalid donor ID' });
    }

    const messages = await Message.find({
      schoolId: school._id,
      $or: [
        { senderId: donorId, senderRole: 'donor' },
        { receiverId: donorId, receiverRole: 'donor' }
      ]
    }).sort('createdAt');

    // Mark messages as read
    await Message.updateMany(
      {
        schoolId: school._id,
        senderRole: 'donor',
        read: false
      },
      { $set: { read: true, readAt: new Date() } }
    );

    res.json(messages);
  } catch (error) {
    console.error('Get school messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message to donor
router.post('/:donorId', async (req, res) => {
  try {
    const { donorId } = req.params;
    const { message } = req.body;
    const school = await School.findOne({ userId: req.user.id });
    
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    const donor = await User.findById(donorId);
    if (!donor || donor.role !== 'donor') {
      return res.status(404).json({ message: 'Donor not found' });
    }

    const newMessage = new Message({
      senderId: req.user.id,
      senderRole: 'school',
      receiverId: donorId,
      receiverRole: 'donor',
      schoolId: school._id,
      text: message.trim(),
      read: false
    });

    await newMessage.save();

    res.status(201).json({
      id: newMessage._id,
      sender: 'school',
      text: newMessage.text,
      createdAt: newMessage.createdAt,
      read: newMessage.read
    });
  } catch (error) {
    console.error('Send school message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark messages as read
router.put('/:donorId/read', async (req, res) => {
  try {
    const { donorId } = req.params;
    const school = await School.findOne({ userId: req.user.id });
    
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    await Message.updateMany(
      {
        schoolId: school._id,
        senderRole: 'donor',
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
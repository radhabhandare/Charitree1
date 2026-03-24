const Message = require('../models/Message');
const School = require('../models/School');
const Donor = require('../models/Donor');
const Notification = require('../models/Notification');

// @desc    Get conversations for donor
// @route   GET /api/donor/messages/conversations
// @access  Private (Donor)
const getConversations = async (req, res) => {
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
          schoolImage: school?.images?.[0] || null,
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
};

// @desc    Get messages with a school
// @route   GET /api/donor/messages/:schoolId
// @access  Private (Donor)
const getMessages = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const donorId = req.user.id;

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
      {
        $set: { read: true, readAt: new Date() }
      }
    );

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send message to school
// @route   POST /api/donor/messages/:schoolId
// @access  Private (Donor)
const sendMessage = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { message, attachment } = req.body;
    const donorId = req.user.id;

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
      read: false,
      attachment: attachment || null
    });

    await newMessage.save();

    // Create notification for school
    const notification = new Notification({
      userId: school.userId,
      title: 'New Message Received',
      message: `A donor has sent you a message.`,
      type: 'new_message',
      relatedId: newMessage._id
    });
    await notification.save();

    res.status(201).json({
      id: newMessage._id,
      sender: 'donor',
      text: newMessage.text,
      createdAt: newMessage.createdAt,
      read: newMessage.read,
      attachment: newMessage.attachment
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/donor/messages/:schoolId/read
// @access  Private (Donor)
const markAsRead = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const donorId = req.user.id;

    await Message.updateMany(
      {
        schoolId,
        receiverId: donorId,
        senderRole: 'school',
        read: false
      },
      {
        $set: { read: true, readAt: new Date() }
      }
    );

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get recent messages (last 5 conversations)
// @route   GET /api/donor/messages/recent
// @access  Private (Donor)
const getRecentMessages = async (req, res) => {
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
          unread: conv.unreadCount > 0,
          read: conv.unreadCount === 0
        };
      })
    );

    res.json(populatedConversations);
  } catch (error) {
    console.error('Get recent messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete message
// @route   DELETE /api/donor/messages/:messageId
// @access  Private (Donor)
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findOne({
      _id: req.params.messageId,
      senderId: req.user.id
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.deleteOne();
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getRecentMessages,
  deleteMessage
};
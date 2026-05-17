const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const donationRoutes = require('./routes/donationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const donorRoutes = require('./routes/donorRoutes');
const schoolRoutes = require('./routes/schoolRoutes');
const schoolMessageRoutes = require('./routes/schoolMessageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const campaignRoutes = require('./routes/campaignRoutes');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
});

// Socket.io middleware for authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.userId);

  // Join school-specific room
  socket.on('school:join', () => {
    socket.join(`school_${socket.userId}`);
    console.log(`📌 School ${socket.userId} joined their room`);
  });

  // Join donor-specific room
  socket.on('room:join', ({ donorId }) => {
    socket.join(`donor_${donorId}`);
    console.log(`📌 User ${socket.userId} joined donor room: ${donorId}`);
  });

  // Leave donor room
  socket.on('room:leave', ({ donorId }) => {
    socket.leave(`donor_${donorId}`);
  });

  // Typing indicator
  socket.on('typing:school', ({ donorId, isTyping }) => {
    socket.to(`donor_${donorId}`).emit('typing:school', { isTyping });
  });

  socket.on('typing:donor', ({ schoolId, isTyping }) => {
    socket.to(`school_${schoolId}`).emit('typing:donor', { isTyping });
  });

  // New message event
  socket.on('message:send', async (messageData) => {
    // Broadcast to the recipient's room
    if (messageData.recipientId) {
      socket.to(`donor_${messageData.recipientId}`).emit('message:new', messageData);
      socket.to(`school_${messageData.recipientId}`).emit('message:new', messageData);
    }
  });

  // Presence updates
  socket.on('presence:update', ({ userId, online }) => {
    // Broadcast to all rooms this user is in
    socket.broadcast.emit('presence:update', { userId, online });
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.userId);
  });
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500
});
app.use('/api', limiter);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Backend API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/donor/messages', messageRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/school/messages', schoolMessageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/campaigns', campaignRoutes);

console.log('\n✅ Registered Routes:');
console.log('  /api/auth');
console.log('  /api/admin');
console.log('  /api/donations');
console.log('  /api/donor/messages');
console.log('  /api/donor');
console.log('  /api/schools');
console.log('  /api/school/messages');
console.log('  /api/notifications');
console.log('  /api/campaigns');

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
});
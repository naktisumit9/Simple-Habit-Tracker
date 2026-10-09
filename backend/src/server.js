import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { UserModel, HabitModel, HabitLogModel } from './db.js';
import { sendOtp, verifyOtp, isRealApiKeyConfigured } from './minimoth.js';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'workshop_secret_default_key';

// Middleware
app.use(cors());
app.use(express.json());

// Basic Auth Middleware
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }
}

// ==========================================
// 5 WORKSHOP BACKEND API ENDPOINTS
// ==========================================

// 1. POST /api/auth/send-otp - Trigger OTP to phone via Minimoth
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || typeof phone !== 'string' || phone.trim().length < 8) {
      return res.status(400).json({ error: 'Valid phone number is required (e.g. +919876543210)' });
    }

    const cleanPhone = phone.trim();
    const result = await sendOtp(cleanPhone);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to send OTP' });
  }
});

// 2. POST /api/auth/verify-otp - Verify OTP with Minimoth & Login/Register user
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, code, name } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ error: 'Phone and 6-digit OTP code are required' });
    }

    const cleanPhone = phone.trim();
    const cleanCode = String(code).trim();

    // Verify OTP with Minimoth
    await verifyOtp(cleanPhone, cleanCode);

    // Find or register user
    let user = UserModel.findByPhone(cleanPhone);
    if (!user) {
      user = UserModel.create({ phone: cleanPhone, name: name || 'Habit Builder' });
    } else if (name && name.trim() && user.name !== name.trim()) {
      user.name = name.trim();
    }

    // Issue lightweight session token
    const token = jwt.sign({ userId: user.id, phone: user.phone }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
      },
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Verification failed' });
  }
});

// 3. GET /api/habits - List user's habits with today's completion & streaks
app.get('/api/habits', requireAuth, (req, res) => {
  try {
    const habits = HabitModel.findByUserId(req.user.id);
    return res.json({ habits });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve habits' });
  }
});

// 4. POST /api/habits - Create a new habit
app.post('/api/habits', requireAuth, (req, res) => {
  try {
    const { title, category } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Habit title is required' });
    }

    const habit = HabitModel.create({
      userId: req.user.id,
      title,
      category: category || 'Daily',
    });

    return res.status(201).json({ habit });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create habit' });
  }
});

// 5. POST /api/habits/:id/toggle - Toggle today's completion for a habit
app.post('/api/habits/:id/toggle', requireAuth, (req, res) => {
  try {
    const habit = HabitModel.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    if (habit.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to modify this habit' });
    }

    HabitLogModel.toggleToday(habit.id);

    // Return the refreshed habit with updated streak and today's status
    const allUserHabits = HabitModel.findByUserId(req.user.id);
    const updated = allUserHabits.find((h) => h.id === habit.id);

    return res.json({ habit: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to toggle habit' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(`🚀 Simple Habit Tracker Backend running on port ${PORT}`);
  console.log(`🔑 Minimoth Live Key Configured: ${isRealApiKeyConfigured() ? 'YES' : 'NO (Demo Mode: code 123456)'}`);
  console.log(`📡 Endpoints:`);
  console.log(`   1. POST /api/auth/send-otp`);
  console.log(`   2. POST /api/auth/verify-otp`);
  console.log(`   3. GET  /api/habits`);
  console.log(`   4. POST /api/habits`);
  console.log(`   5. POST /api/habits/:id/toggle`);
  console.log(`=================================================\n`);
});


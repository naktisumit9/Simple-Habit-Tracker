import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial state for our 3 database entities
const defaultState = {
  users: [],       // Entity 1: User { id, phone, name, createdAt }
  habits: [],      // Entity 2: Habit { id, userId, title, category, createdAt }
  habitLogs: [],   // Entity 3: HabitLog { id, habitId, date, completedAt }
};

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultState, null, 2));
      return defaultState;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db:', err);
    return defaultState;
  }
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Helper: Format Date as YYYY-MM-DD
export function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper: Calculate previous day string
function getPreviousDateString(dateStr, daysAgo = 1) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - daysAgo);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// --- ENTITY 1: USER MODEL ---
export const UserModel = {
  findByPhone(phone) {
    const db = readDb();
    return db.users.find((u) => u.phone === phone) || null;
  },

  findById(id) {
    const db = readDb();
    return db.users.find((u) => u.id === id) || null;
  },

  create({ phone, name }) {
    const db = readDb();
    const newUser = {
      id: 'usr_' + Date.now() + Math.random().toString(36).substring(2, 6),
      phone,
      name: name && name.trim() ? name.trim() : 'Tracker',
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    writeDb(db);
    return newUser;
  },
};

// --- ENTITY 2: HABIT MODEL ---
export const HabitModel = {
  findByUserId(userId) {
    const db = readDb();
    const today = getTodayDateString();
    const userHabits = db.habits.filter((h) => h.userId === userId);

    return userHabits.map((habit) => {
      // Find today's completion
      const completedToday = db.habitLogs.some(
        (log) => log.habitId === habit.id && log.date === today
      );

      // Calculate streak
      const habitLogs = db.habitLogs.filter((log) => log.habitId === habit.id);
      const loggedDates = new Set(habitLogs.map((l) => l.date));

      let streak = 0;
      let checkDate = today;

      if (loggedDates.has(today)) {
        streak = 1;
        checkDate = getPreviousDateString(today, 1);
        while (loggedDates.has(checkDate)) {
          streak += 1;
          checkDate = getPreviousDateString(checkDate, 1);
        }
      } else {
        const yesterday = getPreviousDateString(today, 1);
        if (loggedDates.has(yesterday)) {
          streak = 1;
          checkDate = getPreviousDateString(yesterday, 1);
          while (loggedDates.has(checkDate)) {
            streak += 1;
            checkDate = getPreviousDateString(checkDate, 1);
          }
        }
      }

      return {
        ...habit,
        completedToday,
        streak,
      };
    });
  },

  findById(id) {
    const db = readDb();
    return db.habits.find((h) => h.id === id) || null;
  },

  create({ userId, title, category }) {
    const db = readDb();
    const newHabit = {
      id: 'hbt_' + Date.now() + Math.random().toString(36).substring(2, 6),
      userId,
      title: title.trim(),
      category: category ? category.trim() : 'General',
      createdAt: new Date().toISOString(),
    };
    db.habits.push(newHabit);
    writeDb(db);
    return {
      ...newHabit,
      completedToday: false,
      streak: 0,
    };
  },
};

// --- ENTITY 3: HABIT LOG MODEL ---
export const HabitLogModel = {
  toggleToday(habitId) {
    const db = readDb();
    const today = getTodayDateString();
    const existingIndex = db.habitLogs.findIndex(
      (log) => log.habitId === habitId && log.date === today
    );

    let completedToday = false;

    if (existingIndex >= 0) {
      // Remove log (untoggle)
      db.habitLogs.splice(existingIndex, 1);
      completedToday = false;
    } else {
      // Create new log (mark completed)
      db.habitLogs.push({
        id: 'log_' + Date.now() + Math.random().toString(36).substring(2, 6),
        habitId,
        date: today,
        completedAt: new Date().toISOString(),
      });
      completedToday = true;
    }

    writeDb(db);
    return { completedToday, date: today };
  },
};


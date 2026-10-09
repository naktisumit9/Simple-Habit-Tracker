/**
 * Frontend API client
 * Interacts with the 5 backend API endpoints.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export function getAuthToken() {
  return localStorage.getItem('habit_tracker_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('habit_tracker_token', token);
  } else {
    localStorage.removeItem('habit_tracker_token');
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('habit_tracker_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem('habit_tracker_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('habit_tracker_user');
  }
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Network request failed');
  }

  return data;
}

// 1. POST /api/auth/send-otp
export function apiSendOtp(phone) {
  return request('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

// 2. POST /api/auth/verify-otp
export function apiVerifyOtp(phone, code, name) {
  return request('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, code, name }),
  });
}

// 3. GET /api/habits
export function apiGetHabits() {
  return request('/habits');
}

// 4. POST /api/habits
export function apiCreateHabit(title, category) {
  return request('/habits', {
    method: 'POST',
    body: JSON.stringify({ title, category }),
  });
}

// 5. POST /api/habits/:id/toggle
export function apiToggleHabit(id) {
  return request(`/habits/${id}/toggle`, {
    method: 'POST',
  });
}


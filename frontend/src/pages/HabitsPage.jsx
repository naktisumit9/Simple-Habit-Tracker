import React, { useState, useEffect } from 'react';
import { apiGetHabits, apiToggleHabit } from '../api';

export default function HabitsPage({ user, onNavigateToNew, onLogout }) {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiGetHabits();
      setHabits(res.habits || []);
    } catch (err) {
      setError(err.message || 'Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleToggle = async (habitId) => {
    try {
      setTogglingId(habitId);
      const res = await apiToggleHabit(habitId);
      // Update habit in local list
      setHabits((prev) =>
        prev.map((h) => (h.id === habitId ? res.habit : h))
      );
    } catch (err) {
      alert(err.message || 'Failed to update habit');
    } finally {
      setTogglingId(null);
    }
  };

  const completedCount = habits.filter((h) => h.completedToday).length;
  const totalCount = habits.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="dashboard-container">
      {/* Top Bar */}
      <header className="dashboard-header">
        <div>
          <span className="date-badge">{todayFormatted}</span>
          <h1 className="greeting-title">Hello, {user?.name || 'Friend'} 👋</h1>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={onLogout} title="Log out">
            Logout
          </button>
          <button className="btn btn-primary" onClick={onNavigateToNew}>
            + Add Habit
          </button>
        </div>
      </header>

      {/* Progress Card */}
      {totalCount > 0 && (
        <div className="progress-card">
          <div className="progress-info">
            <span className="progress-label">Today's Progress</span>
            <span className="progress-stats">
              {completedCount} of {totalCount} completed ({progressPercent}%)
            </span>
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Habits List */}
      <section className="habits-section">
        <h2 className="section-title">Today's Habits</h2>

        {loading ? (
          <div className="loading-state">Loading your habits...</div>
        ) : habits.length === 0 ? (
          <div className="empty-card">
            <div className="empty-icon">🌱</div>
            <h3>No habits yet</h3>
            <p>Forming a habit takes just 21 days. Start your first one today!</p>
            <button className="btn btn-primary" onClick={onNavigateToNew}>
              Create Your First Habit
            </button>
          </div>
        ) : (
          <div className="habits-list">
            {habits.map((habit) => {
              const isDone = habit.completedToday;
              const isBusy = togglingId === habit.id;

              return (
                <div
                  key={habit.id}
                  className={`habit-card ${isDone ? 'is-completed' : ''}`}
                >
                  <button
                    type="button"
                    className={`toggle-check-btn ${isDone ? 'checked' : ''}`}
                    onClick={() => handleToggle(habit.id)}
                    disabled={isBusy}
                    aria-label={`Mark ${habit.title} as ${isDone ? 'incomplete' : 'complete'}`}
                  >
                    {isBusy ? '...' : isDone ? '✓' : ''}
                  </button>

                  <div className="habit-content">
                    <span className="habit-title">{habit.title}</span>
                    <div className="habit-meta">
                      <span className="category-pill">{habit.category || 'Daily'}</span>
                      <span className="streak-badge">
                        🔥 {habit.streak} {habit.streak === 1 ? 'day' : 'days'} streak
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}


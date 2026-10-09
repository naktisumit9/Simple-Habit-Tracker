import React, { useState } from 'react';
import { apiCreateHabit } from '../api';

const PRESETS = [
  { title: 'Drink 2L Water', category: 'Health' },
  { title: 'Read 15 Pages', category: 'Learning' },
  { title: 'Morning 20m Walk', category: 'Fitness' },
  { title: '10 mins Meditation', category: 'Mind' },
  { title: 'Write Journal Entry', category: 'Focus' },
];

const CATEGORIES = ['Health', 'Fitness', 'Learning', 'Mind', 'Focus', 'Daily'];

export default function NewHabitPage({ onCreated, onCancel }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Daily');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a habit name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiCreateHabit(title.trim(), category);
      onCreated();
    } catch (err) {
      setError(err.message || 'Failed to create habit');
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset) => {
    setTitle(preset.title);
    setCategory(preset.category);
    setError(null);
  };

  return (
    <div className="new-habit-container">
      <div className="card-header">
        <button type="button" className="btn-link" onClick={onCancel}>
          ← Back to Habits
        </button>
        <h1 className="page-heading">Add New Habit</h1>
        <p className="page-subheading">Choose a habit you want to track consistently</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Quick Suggestion Presets */}
      <div className="presets-box">
        <span className="presets-label">Popular Suggestions:</span>
        <div className="preset-chips">
          {PRESETS.map((p) => (
            <button
              key={p.title}
              type="button"
              className="preset-chip"
              onClick={() => applyPreset(p)}
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="habit-form">
        <div className="form-group">
          <label htmlFor="habit-title">Habit Name</label>
          <input
            id="habit-title"
            type="text"
            className="input"
            placeholder="e.g. Read 20 pages, No sugar, 30m gym"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <div className="category-options">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-select-pill ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
                disabled={loading}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving Habit...' : 'Save Habit →'}
          </button>
        </div>
      </form>
    </div>
  );
}


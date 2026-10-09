import React, { useState, useEffect } from 'react';
import { getAuthToken, getStoredUser, setAuthToken, setStoredUser } from './api';
import AuthPage from './pages/AuthPage';
import HabitsPage from './pages/HabitsPage';
import NewHabitPage from './pages/NewHabitPage';

export default function App() {
  const [user, setUser] = useState(null);
  // Current page state: 'auth' | 'habits' | 'new'
  const [currentPage, setCurrentPage] = useState('auth');

  useEffect(() => {
    const token = getAuthToken();
    const storedUser = getStoredUser();
    if (token && storedUser) {
      setUser(storedUser);
      setCurrentPage('habits');
    } else {
      setCurrentPage('auth');
    }
  }, []);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setCurrentPage('habits');
  };

  const handleLogout = () => {
    setAuthToken(null);
    setStoredUser(null);
    setUser(null);
    setCurrentPage('auth');
  };

  return (
    <div className="app-shell">
      <main className="main-content">
        {currentPage === 'auth' && (
          <AuthPage onLoginSuccess={handleLoginSuccess} />
        )}

        {currentPage === 'habits' && (
          <HabitsPage
            user={user}
            onNavigateToNew={() => setCurrentPage('new')}
            onLogout={handleLogout}
          />
        )}

        {currentPage === 'new' && (
          <NewHabitPage
            onCreated={() => setCurrentPage('habits')}
            onCancel={() => setCurrentPage('habits')}
          />
        )}
      </main>
    </div>
  );
}


import React, { useState } from 'react';
import { apiSendOtp, apiVerifyOtp, setAuthToken, setStoredUser } from '../api';

export default function AuthPage({ onLoginSuccess }) {
  const [phone, setPhone] = useState('+91');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!phone || phone.trim().length < 8) {
      setError('Please enter a valid phone number with country code (e.g. +919876543210)');
      return;
    }

    setLoading(true);
    try {
      const res = await apiSendOtp(phone.trim());
      setMessage(res.message || 'OTP code sent to your phone!');
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please check backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!code || code.trim().length < 4) {
      setError('Please enter the verification code received');
      return;
    }

    setLoading(true);
    try {
      const res = await apiVerifyOtp(phone.trim(), code.trim(), name.trim());
      setAuthToken(res.token);
      setStoredUser(res.user);
      onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Verification failed. Please check code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="app-badge">Simple Habit Tracker</div>
        <h1 className="auth-title">
          {step === 'phone' ? 'Welcome!' : 'Enter Verification Code'}
        </h1>
        <p className="auth-subtitle">
          {step === 'phone'
            ? 'Sign up or log in securely using OTP via Minimoth'
            : `Code sent to ${phone}`}
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} className="auth-form">
          <div className="form-group">
            <label htmlFor="name-input">Your Name (optional)</label>
            <input
              id="name-input"
              type="text"
              className="input"
              placeholder="e.g. Alex"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone-input">Phone Number (E.164 format)</label>
            <input
              id="phone-input"
              type="tel"
              className="input"
              placeholder="+919876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={loading}
            />
            <span className="input-hint">Include country code (e.g. +91 for India, +1 for US)</span>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Sending OTP via Minimoth...' : 'Send Verification Code →'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="auth-form">
          <div className="form-group">
            <label htmlFor="code-input">6-Digit OTP Code</label>
            <input
              id="code-input"
              type="text"
              className="input otp-input"
              placeholder="123456"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoFocus
              required
              disabled={loading}
            />
            <span className="input-hint">
              Check WhatsApp or SMS. (Demo mode code is: <strong>123456</strong>)
            </span>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify & Continue →'}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setStep('phone');
              setCode('');
              setError(null);
            }}
            disabled={loading}
          >
            ← Back to phone number
          </button>
        </form>
      )}

      <div className="auth-footer">
        <span className="minimoth-pill">⚡ Powered by Minimoth OTP API</span>
      </div>
    </div>
  );
}


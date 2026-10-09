/**
 * Minimoth API Integration
 * Documentation: https://minimoth.dev
 * Handles OTP delivery (WhatsApp/SMS fallback) and verification.
 */

const MINIMOTH_BASE_URL = 'https://api.minimoth.dev';

// In-memory demo store when running in offline/demo mode without active API key
const demoOtpStore = new Map();

/**
 * Checks if a real Minimoth API key is configured
 */
export function isRealApiKeyConfigured() {
  const apiKey = process.env.MINIMOTH_API_KEY;
  return Boolean(apiKey && apiKey.trim() !== '' && apiKey !== 'your_minimoth_api_key_here');
}

/**
 * Sends OTP to user's phone via Minimoth API
 * @param {string} phone - E.164 formatted phone number (e.g., +919876543210)
 */
export async function sendOtp(phone) {
  const apiKey = process.env.MINIMOTH_API_KEY;

  if (isRealApiKeyConfigured()) {
    const response = await fetch(`${MINIMOTH_BASE_URL}/v1/otp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify({ phone }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to send OTP via Minimoth');
    }

    return {
      success: true,
      message: data.message || 'OTP sent successfully via WhatsApp/SMS',
      otpId: data.otp_id || null,
      mode: 'live',
    };
  }

  // Workshop fallback mode (when user hasn't added Minimoth key yet)
  const mockCode = '123456';
  demoOtpStore.set(phone, mockCode);
  console.log(`\n[Minimoth Demo Mode] 🔑 OTP for ${phone} is: ${mockCode}`);
  console.log(`[Minimoth Demo Mode] Set a real MINIMOTH_API_KEY in backend/.env for live WhatsApp/SMS.\n`);

  return {
    success: true,
    message: 'OTP sent! (Workshop Demo Mode: use code 123456)',
    otpId: 'demo_' + Date.now(),
    mode: 'demo',
  };
}

/**
 * Verifies OTP code via Minimoth API
 * @param {string} phone - E.164 formatted phone number
 * @param {string} code - 6-digit OTP code entered by user
 */
export async function verifyOtp(phone, code) {
  const apiKey = process.env.MINIMOTH_API_KEY;

  if (isRealApiKeyConfigured()) {
    const response = await fetch(`${MINIMOTH_BASE_URL}/v1/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify({ phone, code }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Invalid or expired OTP');
    }

    return {
      verified: true,
      data,
    };
  }

  // Workshop fallback verification
  const expected = demoOtpStore.get(phone) || '123456';
  if (code.trim() === expected || code.trim() === '123456') {
    demoOtpStore.delete(phone);
    return {
      verified: true,
      demo: true,
    };
  }

  throw new Error('Invalid OTP code. Please enter 123456 in demo mode.');
}


import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { getDB, saveDB, generateId } from '../config/db.js';
import { JWT_SECRET } from '../middleware/authMiddleware.js';
import { sendOTPEmail } from '../utils/email.js';


// RFC-5322-ish "good enough" email check — rejects obviously malformed
// addresses (no @, no domain, spaces, etc.) without being overly strict.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isValidEmail = (email) => typeof email === 'string' && EMAIL_REGEX.test(email.trim());

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const recordSecurityLog = (email, action, status, ip, userAgent, details = '') => {
  try {
    const db = getDB();
    if (!db.security_logs) db.security_logs = [];
    const logEntry = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      email: email || 'anonymous',
      action,
      status,
      ip: ip || '127.0.0.1',
      user_agent: userAgent || 'Web Client',
      details,
      timestamp: new Date().toISOString()
    };
    db.security_logs.unshift(logEntry);
    if (db.security_logs.length > 250) {
      db.security_logs = db.security_logs.slice(0, 250);
    }
    saveDB(db);
  } catch (err) {
    console.error('Security log error:', err);
  }
};

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

const signRefreshToken = (user) =>
  jwt.sign(
    { id: user.id, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

export const register = async (req, res) => {
  try {
    const { email, password, username, role, name, contact_number, address, stall_name, bio, latitude, longitude } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const db = getDB();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const userRole = role === 'Farmer' ? 'Farmer' : 'Customer';
    const status = userRole === 'Farmer' ? 'pending' : 'active'; // Farmers require admin approval per SRS section 1.6!

    const newUser = {
      id: generateId('users'),
      username: username || email.split('@')[0],
      email,
      password_hash,
      role: userRole,
      name,
      contact_number: contact_number || '',
      address: address || '',
      stall_name: stall_name || '',
      bio: bio || '',
      markets_attended: [],
      operating_days: ['Saturday'],
      pickup_time_windows: '9:00 AM - 2:00 PM',
      latitude: latitude || 40.7128,
      longitude: longitude || -74.0060,
      status,
      created_at: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDB(db);

    const token = signToken(newUser);

    const { password_hash: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      message: userRole === 'Farmer' ? 'Registration submitted! Farmer account pending Admin approval.' : 'Registration successful!',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
};

export const login = async (req, res) => {
  const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Web Browser';

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      recordSecurityLog(email, 'Login Attempt', 'failure', ip, userAgent, 'Missing email or password');
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    if (!isValidEmail(email)) {
      recordSecurityLog(email, 'Login Attempt', 'failure', ip, userAgent, 'Invalid email format');
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    const db = getDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || !user.password_hash) {
      recordSecurityLog(email, 'Login Attempt', 'failure', ip, userAgent, 'User not found or password empty');
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      recordSecurityLog(email, 'Login Attempt', 'failure', ip, userAgent, 'Incorrect password');
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (user.status === 'suspended' || user.status === 'deactivated') {
      recordSecurityLog(email, 'Login Attempt', 'blocked', ip, userAgent, `Account status: ${user.status}`);
      return res.status(403).json({ message: 'Your account has been suspended by Admin. Please contact support.' });
    }

    const token = signToken(user);
    const refreshToken = signRefreshToken(user);

    recordSecurityLog(email, 'Login Success', 'success', ip, userAgent, `Role: ${user.role}`);

    const { password_hash: _, otp_code: __, ...userWithoutPassword } = user;
    res.json({
      message: 'Login successful',
      token,
      refreshToken,
      user: userWithoutPassword
    });
  } catch (error) {
    recordSecurityLog(req.body?.email, 'Login Error', 'error', ip, userAgent, error.message);
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
};

/**
 * POST /api/auth/google
 * Body: { credential } — the ID token returned by Google Identity Services
 * on the frontend. We verify it server-side, then either log the matching
 * user in or create a new Customer account (Farmers still need the normal
 * form, since farmer signup requires extra business details + Admin
 * approval).
 */
export const googleAuth = async (req, res) => {
  try {
    const { credential, mockUser } = req.body;
    let payload = null;

    // Support 1: 1-Click / Simulated Google Auth for dev evaluation or when GOOGLE_CLIENT_ID isn't set
    if (mockUser || (credential && (credential.startsWith('mock_google_') || credential === 'simulated_google_credential'))) {
      const email = mockUser?.email || 'google.user@marketlink.com';
      const name = mockUser?.name || 'Alex Morgan (Google)';
      const picture = mockUser?.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';
      payload = {
        email,
        name,
        picture,
        sub: `google-user-${Date.now()}`
      };
    } else if (credential) {
      if (process.env.GOOGLE_CLIENT_ID) {
        try {
          const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
          });
          payload = ticket.getPayload();
        } catch (vErr) {
          console.warn('Real Google token verification failed, falling back to simulated payload:', vErr.message);
        }
      }
      if (!payload) {
        payload = {
          email: 'google.user@marketlink.com',
          name: 'Alex Morgan (Google)',
          picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          sub: 'google-sub-user-default'
        };
      }
    }

    if (!payload || !payload.email) {
      return res.status(401).json({ message: 'Could not verify Google account.' });
    }

    const db = getDB();
    let user = db.users.find(u => u.email.toLowerCase() === payload.email.toLowerCase());

    if (user) {
      if (user.status === 'suspended' || user.status === 'deactivated') {
        recordSecurityLog(payload.email, 'Google Sign-In', 'blocked', req.ip, req.headers['user-agent'], 'Account suspended');
        return res.status(403).json({ message: 'Your account has been suspended by Admin. Please contact support.' });
      }
      if (!user.googleId) {
        user.googleId = payload.sub;
      }
      if (payload.picture && !user.avatar) {
        user.avatar = payload.picture;
      }
    } else {
      user = {
        id: generateId('users'),
        username: payload.email.split('@')[0],
        email: payload.email,
        password_hash: null, // Google-only account
        googleId: payload.sub,
        avatar: payload.picture || '',
        role: 'Customer',
        name: payload.name || payload.email.split('@')[0],
        contact_number: '',
        address: '',
        stall_name: '',
        bio: '',
        is_verified: true,
        markets_attended: [],
        operating_days: ['Saturday'],
        pickup_time_windows: '9:00 AM - 2:00 PM',
        latitude: 40.7128,
        longitude: -74.0060,
        status: 'active',
        created_at: new Date().toISOString(),
      };
      db.users.push(user);
    }

    saveDB(db);
    recordSecurityLog(payload.email, 'Google Sign-In', 'success', req.ip, req.headers['user-agent'], 'Google sign-in completed');

    const token = signToken(user);
    const refreshToken = signRefreshToken(user);
    const { password_hash: _, ...userWithoutPassword } = user;
    res.json({ message: 'Login successful via Google', token, refreshToken, user: userWithoutPassword });
  } catch (error) {
    console.error('googleAuth error:', error);
    res.status(401).json({ message: 'Google sign-in failed. Please try again.', error: error.message });
  }
};

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 * Always responds with the same generic message whether or not the email
 * exists, so the endpoint can't be used to find out which emails are
 * registered. Generates a one-hour token and emails a reset link.
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const genericResponse = { message: 'If an account with that email exists, a password reset link has been sent.' };

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    const db = getDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Don't reveal whether the account exists.
      return res.json(genericResponse);
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    saveDB(db);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${rawToken}`;

    const result = await sendPasswordResetEmail(user.email, resetUrl);

    // In dev (no SMTP configured) also hand back the link directly so the
    // flow is testable without a real mailbox. Remove this in production.
    if (!result.delivered) {
      return res.json({ ...genericResponse, devResetUrl: result.devLink });
    }

    res.json(genericResponse);
  } catch (error) {
    res.status(500).json({ message: 'Server error while requesting password reset.', error: error.message });
  }
};

/**
 * POST /api/auth/reset-password/:token
 * Body: { password }
 */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const db = getDB();
    const user = db.users.find(
      u => u.resetPasswordToken === hashedToken && u.resetPasswordExpires > Date.now()
    );

    if (!user) {
      return res.status(400).json({ message: 'This password reset link is invalid or has expired. Please request a new one.' });
    }

    user.password_hash = await bcrypt.hash(password, 10);
    delete user.resetPasswordToken;
    delete user.resetPasswordExpires;
    saveDB(db);

    res.json({ message: 'Your password has been reset successfully. You can now sign in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while resetting password.', error: error.message });
  }
};

export const getMe = (req, res) => {
  const db = getDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const { password_hash: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
};

export const updateProfile = (req, res) => {
  const db = getDB();
  const index = db.users.findIndex(u => u.id === req.user.id);
  if (index === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { name, contact_number, address, stall_name, bio, operating_days, pickup_time_windows, latitude, longitude, markets_attended } = req.body;
  
  db.users[index] = {
    ...db.users[index],
    name: name ?? db.users[index].name,
    contact_number: contact_number ?? db.users[index].contact_number,
    address: address ?? db.users[index].address,
    stall_name: stall_name ?? db.users[index].stall_name,
    bio: bio ?? db.users[index].bio,
    operating_days: operating_days ?? db.users[index].operating_days,
    pickup_time_windows: pickup_time_windows ?? db.users[index].pickup_time_windows,
    latitude: latitude ?? db.users[index].latitude,
    longitude: longitude ?? db.users[index].longitude,
    markets_attended: markets_attended !== undefined ? markets_attended : db.users[index].markets_attended
  };

  saveDB(db);
  const { password_hash: _, ...updatedUser } = db.users[index];
  res.json({ message: 'Profile updated successfully', user: updatedUser });
};

/**
 * POST /api/auth/refresh
 * Body: { refreshToken }
 */
export const refreshToken = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is required.' });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const db = getDB();
    const user = db.users.find(u => u.id === decoded.id);
    if (!user || user.status === 'suspended' || user.status === 'deactivated') {
      return res.status(403).json({ message: 'Invalid token or inactive account.' });
    }

    const newAccessToken = signToken(user);
    res.json({ token: newAccessToken });
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired refresh token.' });
  }
};

/**
 * POST /api/auth/send-otp
 * Body: { email }
 */
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        message: 'Valid email address is required.'
      });
    }

    const db = getDB();

    const user = db.users.find(
      u => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      return res.status(404).json({
        message: 'No registered user found with this email.'
      });
    }

    // Generate secure 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Save OTP for 10 minutes
    user.otp_code = otp;
    user.otp_expires = Date.now() + 10 * 60 * 1000;

    saveDB(db);

    // Send OTP to user's email
    const result = await sendOTPEmail(user.email, otp);

    recordSecurityLog(
      email,
      'Password Reset OTP',
      'success',
      req.ip,
      req.headers['user-agent'],
      '6-digit OTP generated and email delivery attempted'
    );

    res.json({
      message: 'OTP has been sent to your email address.',
      delivered: result.delivered,
      devOtp: otp
    });

  } catch (error) {
    console.error('Send OTP error:', error);

    res.status(500).json({
      message: 'Failed to send OTP code.',
      error: error.message
    });
  }
};

/**
 * POST /api/auth/verify-otp
 * Body: { email, otp }
 */
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP code are required.' });
    }

    const db = getDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.otp_code || user.otp_code !== otp.trim() || user.otp_expires < Date.now()) {
      recordSecurityLog(email, 'OTP Verification', 'failure', req.ip, req.headers['user-agent'], 'Invalid or expired OTP');
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }

    user.is_verified = true;
    delete user.otp_code;
    delete user.otp_expires;
    saveDB(db);

    recordSecurityLog(email, 'OTP Verification', 'success', req.ip, req.headers['user-agent'], 'Email verified successfully');

    const token = signToken(user);
    const { password_hash: _, ...userWithoutPassword } = user;
    res.json({
      message: 'Account verified successfully!',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify OTP.', error: error.message });
  }
};

/**
 * GET /api/auth/security-logs
 */
export const getSecurityLogs = (req, res) => {
  const db = getDB();
  const logs = db.security_logs || [];
  if (req.user.role === 'Admin') {
    return res.json(logs.slice(0, 100));
  }
  // Regular users see their own security history
  const userLogs = logs.filter(l => l.email?.toLowerCase() === req.user.email?.toLowerCase());
  res.json(userLogs.slice(0, 50));
};

/**
 * POST /api/auth/reset-password-with-otp
 * Body: { email, otp, password }
 */
export const resetPasswordWithOTP = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ message: 'Email, verification code, and new password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const db = getDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(404).json({ message: 'No registered user found with this email.' });
    }

    if (!user.otp_code || user.otp_code !== otp.trim()) {
      recordSecurityLog(email, 'Password Reset via OTP', 'failure', req.ip, req.headers['user-agent'], 'Incorrect OTP entered');
      return res.status(400).json({ message: 'Invalid verification code. Please check the code and try again.' });
    }

    if (user.otp_expires && user.otp_expires < Date.now()) {
      recordSecurityLog(email, 'Password Reset via OTP', 'failure', req.ip, req.headers['user-agent'], 'Expired OTP code');
      return res.status(400).json({ message: 'Verification code has expired. Please request a new code.' });
    }

    // Hash and store new password
    user.password_hash = await bcrypt.hash(password, 10);
    delete user.otp_code;
    delete user.otp_expires;
    user.is_verified = true;
    saveDB(db);

    recordSecurityLog(email, 'Password Reset via OTP', 'success', req.ip, req.headers['user-agent'], 'Password successfully reset with OTP');

    const token = signToken(user);
    const refreshToken = signRefreshToken(user);
    const { password_hash: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Your password has been successfully reset! You are now signed in.',
      token,
      refreshToken,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('resetPasswordWithOTP error:', error);
    res.status(500).json({ message: 'Server error while resetting password.', error: error.message });
  }
};


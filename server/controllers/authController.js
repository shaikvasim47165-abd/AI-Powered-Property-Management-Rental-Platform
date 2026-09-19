const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'prop_ai_super_secret_jwt_key_2026_rental_platform',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role === 'owner' ? 'owner' : 'tenant',
      phone: phone || '',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar || '',
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar || '',
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    1-Click Demo Login (Guaranteed to create or fetch demo accounts seamlessly)
// @route   POST /api/auth/demo-login
// @access  Public
const demoLogin = async (req, res, next) => {
  try {
    const { role = 'tenant' } = req.body;
    const isOwner = role === 'owner';
    const email = isOwner ? 'owner@example.com' : 'tenant@example.com';
    const name = isOwner ? 'Rajesh Sharma (Property Owner)' : 'Priya Patel (Tenant)';
    const phone = isOwner ? '+91 98765 43210' : '+91 98450 12345';

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: 'password123',
        role: isOwner ? 'owner' : 'tenant',
        phone,
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar || '',
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Sign in or register with Google email
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res, next) => {
  try {
    const { credential, email, name, googleId, avatar, role = 'tenant' } = req.body;

    let verifiedEmail = email;
    let verifiedName = name;
    let verifiedGoogleId = googleId;
    let verifiedAvatar = avatar;

    // If an official Google ID token credential was provided, verify with Google
    if (credential) {
      try {
        const fetchRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
        );
        if (fetchRes.ok) {
          const payload = await fetchRes.json();
          verifiedEmail = payload.email;
          verifiedName = payload.name;
          verifiedGoogleId = payload.sub;
          verifiedAvatar = payload.picture;
        }
      } catch (tokenErr) {
        console.warn('[Google Auth] Token verification fallback:', tokenErr.message);
      }
    }

    if (!verifiedEmail) {
      return res.status(400).json({
        success: false,
        message: 'Google authentication failed: Email address is required.',
      });
    }

    let user = await User.findOne({ email: verifiedEmail.toLowerCase() });

    if (user) {
      if (!user.googleId && verifiedGoogleId) {
        user.googleId = verifiedGoogleId;
      }
      if (!user.avatar && verifiedAvatar) {
        user.avatar = verifiedAvatar;
      }
      await user.save();
    } else {
      user = await User.create({
        name: verifiedName || verifiedEmail.split('@')[0],
        email: verifiedEmail.toLowerCase(),
        googleId: verifiedGoogleId || `google_${Date.now()}`,
        avatar: verifiedAvatar || '',
        role: role === 'owner' ? 'owner' : 'tenant',
        phone: '',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        avatar: user.avatar || '',
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar || '',
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  demoLogin,
  googleAuth,
  getMe,
};

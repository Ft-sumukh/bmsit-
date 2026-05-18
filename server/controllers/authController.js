const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper to generate access tokens (15m expiry)
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET || 'your_access_token_secret_here', {
    expiresIn: '15m'
  });
};

// Helper to generate refresh tokens (7d expiry)
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'your_refresh_token_secret_here', {
    expiresIn: '7d'
  });
};

// @desc    Register a new student user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, college, branch, semester } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      return next(new Error('Please fill in all required fields (name, email, password)'));
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      return next(new Error('A user with this email already exists'));
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      college: college || '',
      branch: branch || '',
      semester: semester || 1
    });

    if (user) {
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Store refresh token in HttpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        branch: user.branch,
        semester: user.semester,
        token: accessToken
      });
    } else {
      res.status(400);
      return next(new Error('Invalid user data provided'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      return next(new Error('Please enter email and password'));
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token in HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      college: user.college,
      branch: user.branch,
      semester: user.semester,
      token: accessToken
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = async (req, res, next) => {
  try {
    res.cookie('refreshToken', '', {
      httpOnly: true,
      expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile info
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshAccessToken = async (req, res, next) => {
  try {
    const cookies = req.cookies || {};
    const refreshToken = cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      res.status(401);
      return next(new Error('Refresh token not found, please authenticate'));
    }

    // Verify token
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your_refresh_token_secret_here', async (err, decoded) => {
      if (err) {
        res.status(403);
        return next(new Error('Invalid or expired refresh token'));
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        res.status(401);
        return next(new Error('User associated with this token not found'));
      }

      const accessToken = generateAccessToken(user._id);
      res.json({ token: accessToken });
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  refreshAccessToken
};

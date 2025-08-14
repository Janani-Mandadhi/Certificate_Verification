const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AptosAccount } = require('aptos');
const aptosService = require('../utils/aptos');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d',
  });
};

const register = async (req, res) => {
  try {
    const { username, email, password, role, organizationName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new Aptos account
    const aptosAccount = new AptosAccount();
    
    const user = new User({
      username,
      email,
      password,
      role: role || 'user',
      organizationName,
      aptosAddress: aptosAccount.address().hex(),
      aptosPrivateKey: aptosAccount.privateKey.hex(), // In production, encrypt this!
    });

    await user.save();

    // Fund the account on devnet (for testing)
    try {
      await aptosService.faucetClient.fundAccount(aptosAccount.address(), 100000000); // 1 APT
    } catch (error) {
      console.log('Could not fund account:', error.message);
    }

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        organizationName: user.organizationName,
        aptosAddress: user.aptosAddress
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        organizationName: user.organizationName,
        aptosAddress: user.aptosAddress
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -aptosPrivateKey');
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile
};
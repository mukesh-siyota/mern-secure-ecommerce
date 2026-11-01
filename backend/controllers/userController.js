import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & get token
// @route   POST /api/users/login
export const authUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const username = req.body.username ?? req.body.name;
    const user = await User.findOne({ email });

    const usernameMatches = !username
      || (typeof username === 'string'
        && user?.name.toLowerCase() === username.trim().toLowerCase());

    if (user && usernameMatches && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) { next(error); }
};

// @desc    Register a new user
// @route   POST /api/users
export const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const name = req.body.username ?? req.body.name;
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({ name, email, password });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) { next(error); }
};

// @desc    Get user profile
// @route   GET /api/users/profile
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) { next(error); }
};

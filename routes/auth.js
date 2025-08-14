import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Dummy user for example — in real, use DB
const users = [
  { id: 1, username: 'testuser', passwordHash: bcrypt.hashSync('mypassword', 8) }
];

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ message: 'User not found' });

  const passwordIsValid = bcrypt.compareSync(password, user.passwordHash);
  if (!passwordIsValid) return res.status(401).json({ message: 'Invalid password' });

  // Generate JWT token (use your secret key)
  const token = jwt.sign({ id: user.id, username: user.username }, 'your_jwt_secret', { expiresIn: '1h' });

  res.json({ token, message: 'Login successful' });
});

export default router;

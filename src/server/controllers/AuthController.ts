import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';

export class AuthController {
  
  static async signup(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;
      
      if (!email || !password || !name) {
        return res.status(400).json({ error: 'All fields are required.' });
      }

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use.' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = new User({ email, passwordHash, name });
      await user.save();

      const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        token,
        user: { id: user._id, email: user.email, name: user.name }
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Server error during signup.' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

      res.status(200).json({
        token,
        user: { id: user._id, email: user.email, name: user.name }
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Server error during login.' });
    }
  }
}

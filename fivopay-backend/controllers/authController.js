import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user exists
    const userExist = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );

    const user = newUser.rows[0];
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during signup' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const userExist = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExist.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};

export const updateProfile = async (req, res) => {
  const { id, name, email, currentPassword, newPassword, settings } = req.body;
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect current password' });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      await query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, id]);
    }

    const updatedUser = await query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email',
      [name || user.name, email || user.email, id]
    );

    res.json({ success: true, message: 'Profile updated successfully', user: updatedUser.rows[0], settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
};

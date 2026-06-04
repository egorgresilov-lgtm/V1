const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const pool = require('../database/db');

class AuthService {
  async register(email, password, role = 'user') {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userRepository.create(email, passwordHash, role);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await this.saveRefreshToken(user.id, refreshToken);

    return {
      user: { id: user.id, email: user.email, role: user.role },
      accessToken,
      refreshToken
    };
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const userData = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(userData);
    const refreshToken = generateRefreshToken(userData);

    await this.saveRefreshToken(user.id, refreshToken);

    return {
      user: userData,
      accessToken,
      refreshToken
    };
  }

  async refreshTokens(refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new Error('Invalid refresh token');
    }

    const storedToken = await this.getRefreshToken(decoded.id, refreshToken);
    if (!storedToken) {
      throw new Error('Refresh token not found');
    }

    const user = await userRepository.findById(decoded.id);
    if (!user) {
      throw new Error('User not found');
    }

    const userData = { id: user.id, email: user.email, role: user.role };
    const newAccessToken = generateAccessToken(userData);
    const newRefreshToken = generateRefreshToken(userData);

    await this.deleteRefreshToken(refreshToken);
    await this.saveRefreshToken(user.id, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  async logout(refreshToken) {
    await this.deleteRefreshToken(refreshToken);
  }

  async saveRefreshToken(userId, token) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, token, expiresAt]
    );
  }

  async getRefreshToken(userId, token) {
    const result = await pool.query(
      'SELECT * FROM refresh_tokens WHERE user_id = $1 AND token = $2 AND expires_at > NOW()',
      [userId, token]
    );
    return result.rows[0];
  }

  async deleteRefreshToken(token) {
    await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
  }

  async cleanExpiredTokens() {
    await pool.query('DELETE FROM refresh_tokens WHERE expires_at < NOW()');
  }
}

module.exports = new AuthService();

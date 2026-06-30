import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { pool } from './db.js'; // Asegúrate de que db.js también exporte 'pool' con 'export const pool'
import dotenv from 'dotenv';

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

      if (userRes.rows.length > 0) {
        return done(null, userRes.rows[0]);
      } else {
        const newUser = await pool.query(
          'INSERT INTO users (email, full_name, role) VALUES ($1, $2, $3) RETURNING *',
          [email, profile.displayName, 'USER']
        );
        return done(null, newUser.rows[0]);
      }
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, user.rows[0]);
  } catch (err) {
    done(err, null);
  }
});
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'jntua_clms_super_secret_jwt_key_2024_anantapur';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

function signToken(user) {
  return jwt.sign(
    { id: user.id, member_id: user.member_id, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Login — supports Student (Gmail) and Librarian (acharan apilagunta / charan@143232)
 */
export async function login(req, res) {
  try {
    const { identifier, password, loginType } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both your ID/Gmail and password.' });
    }

    const trimmed = identifier.trim().toLowerCase();
    const cleanId = trimmed.replace(/\s+/g, ' ');

    // 1. Librarian Authentication Check
    const isLibrarianCandidate =
      loginType === 'librarian' ||
      cleanId === 'acharan apilagunta' ||
      cleanId === 'charan apilagunta' ||
      cleanId === 'acharan9867@gmail.com' ||
      cleanId === 'librarian-01' ||
      cleanId === 'admin@jntua.ac.in';

    if (isLibrarianCandidate) {
      const isLibrarianPass = password === 'charan@143232' || password === 'jntua@123';
      if (!isLibrarianPass) {
        return res.status(401).json({
          success: false,
          message: 'Invalid Librarian credentials. Access denied.'
        });
      }

      // Find or create/update Chief Librarian admin account
      let adminUser = await db.get("SELECT * FROM users WHERE role = 'admin' LIMIT 1");
      const adminHash = await bcrypt.hash('charan@143232', 10);

      if (!adminUser) {
        await db.run(
          `INSERT INTO users (member_id, name, email, password_hash, role, department, phone, max_books_allowed, status)
           VALUES ('LIBRARIAN-01', 'Acharan Apilagunta', 'acharan9867@gmail.com', ?, 'admin', 'Central Library', '+91 8554 272433', 10, 'active')`,
          [adminHash]
        );
        adminUser = await db.get("SELECT * FROM users WHERE role = 'admin' LIMIT 1");
      } else {
        await db.run(
          "UPDATE users SET name = 'Acharan Apilagunta', email = 'acharan9867@gmail.com', password_hash = ? WHERE id = ?",
          [adminHash, adminUser.id]
        );
        adminUser.name = 'Acharan Apilagunta';
        adminUser.email = 'acharan9867@gmail.com';
      }

      const token = signToken(adminUser);
      const { password_hash, ...safeUser } = adminUser;

      return res.json({
        success: true,
        message: `Welcome, Chief Librarian ${adminUser.name}!`,
        token,
        user: safeUser
      });
    }

    // 2. Student Authentication Check
    const isGmail = trimmed.endsWith('@gmail.com');
    if (loginType === 'student' && !isGmail) {
      return res.status(400).json({
        success: false,
        message: 'Students must provide a valid Gmail address ending with @gmail.com'
      });
    }

    // 3. Find existing user by member_id or email
    let user = await db.get(
      'SELECT * FROM users WHERE (LOWER(member_id) = ? OR LOWER(email) = ?) AND status = ?',
      [trimmed, trimmed, 'active']
    );

    // 4. Auto-register if Gmail and not in DB
    if (!user && (isGmail || trimmed.includes('@'))) {
      const passwordHash = await bcrypt.hash(password, 10);
      const localPart = trimmed.split('@')[0];
      const displayName = localPart.split(/[._\-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const memberId = 'GUEST-' + Date.now().toString().slice(-6);

      await db.run(
        `INSERT INTO users (member_id, name, email, password_hash, role, department, phone, max_books_allowed, status)
         VALUES (?, ?, ?, ?, 'student', 'Computer Science & Engineering', '', 3, 'active')`,
        [memberId, displayName, trimmed, passwordHash]
      );

      user = await db.get('SELECT * FROM users WHERE email = ?', [trimmed]);
      console.log(`Auto-registered new student Gmail user: ${trimmed} as ${memberId}`);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Check your Gmail or Roll Number.'
      });
    }

    // 5. Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      // For student Gmail users on first use or guest accounts, allow password update
      if (isGmail && user.member_id.startsWith('GUEST-')) {
        const newHash = await bcrypt.hash(password, 10);
        await db.run('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, user.id]);
        user = await db.get('SELECT * FROM users WHERE id = ?', [user.id]);
      } else {
        return res.status(401).json({ success: false, message: 'Incorrect password for this account.' });
      }
    }

    const token = signToken(user);
    const { password_hash, ...safeUser } = user;

    res.json({
      success: true,
      message: `Welcome, ${user.name}!`,
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during authentication.', error: err.message });
  }
}

/**
 * Get currently authenticated user profile
 */
export async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    const activeLoans = await db.get('SELECT COUNT(*) as count FROM transactions WHERE user_id = ? AND status = ?', [userId, 'issued']);
    const activeReservations = await db.get("SELECT COUNT(*) as count FROM reservations WHERE user_id = ? AND status IN ('pending', 'ready_for_pickup')", [userId]);
    const fineStats = await db.get('SELECT SUM(calculated_fine) as total_fines, SUM(total_paid) as total_paid FROM transactions WHERE user_id = ?', [userId]);

    res.json({
      success: true,
      user: req.user,
      stats: {
        currentBorrowed: activeLoans?.count || 0,
        activeReservations: activeReservations?.count || 0,
        totalFines: Number((fineStats?.total_fines || 0).toFixed(2)),
        totalPaid: Number((fineStats?.total_paid || 0).toFixed(2)),
        maxAllowed: req.user.max_books_allowed
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve user profile.', error: err.message });
  }
}

/**
 * Demo accounts for viva
 */
export async function getDemoAccounts(req, res) {
  try {
    const demoUsers = await db.query(
      "SELECT member_id, name, email, role, department, max_books_allowed FROM users WHERE status = 'active' ORDER BY role ASC, id ASC"
    );
    res.json({ success: true, defaultPassword: 'jntua@123', accounts: demoUsers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve demo accounts.', error: err.message });
  }
}

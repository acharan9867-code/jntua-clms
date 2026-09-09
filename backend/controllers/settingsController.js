import db from '../config/db.js';

/**
 * Get all library settings (timings, policies, university name)
 */
export async function getSettings(req, res) {
  try {
    const settingsRows = await db.query('SELECT * FROM library_settings');
    const settingsMap = {};
    for (const row of settingsRows) {
      settingsMap[row.key_name] = {
        value: row.value,
        description: row.description,
        updatedAt: row.updated_at
      };
    }

    res.json({
      success: true,
      settings: settingsMap
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve library settings.',
      error: err.message
    });
  }
}

/**
 * Update library setting (Admin only)
 */
export async function updateSetting(req, res) {
  try {
    const { key_name, value } = req.body;

    if (!key_name || value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'key_name and value are required.'
      });
    }

    const existing = await db.get('SELECT id FROM library_settings WHERE key_name = ?', [key_name]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Setting "${key_name}" not found.`
      });
    }

    await db.run(
      'UPDATE library_settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key_name = ?',
      [value, key_name]
    );

    res.json({
      success: true,
      message: `Setting "${key_name}" updated successfully.`
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update setting.',
      error: err.message
    });
  }
}

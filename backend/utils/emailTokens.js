const crypto = require('crypto');

/**
 * Generate a secure random token for email verification
 * @returns {string} - Hex token string
 */
const generateEmailVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate a secure random token for password reset
 * @returns {string} - Hex token string
 */
const generatePasswordResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

module.exports = {
    generateEmailVerificationToken,
    generatePasswordResetToken,
};

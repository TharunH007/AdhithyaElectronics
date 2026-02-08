const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
};

/**
 * Send email verification email
 * @param {object} user - User object with email and name
 * @param {string} token - Verification token
 */
const sendVerificationEmail = async (user, token) => {
    const transporter = createTransporter();
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Verify Your Email - Bombay Dyeing - NKM Trading Company',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to Bombay Dyeing - NKM Trading Company!</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${user.name},</h2>
                        <p>Thank you for registering with Bombay Dyeing - NKM Trading Company. Please verify your email address to activate your account.</p>
                        <p>Click the button below to verify your email:</p>
                        <a href="${verificationUrl}" class="button">Verify Email</a>
                        <p>Or copy and paste this link in your browser:</p>
                        <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
                        <p>This link will expire in 24 hours.</p>
                        <p>If you didn't create an account, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 Bombay Dyeing - NKM Trading Company. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Verification email sent to ${user.email}`);
        console.log(`Verification URL: ${verificationUrl}`);
    } catch (error) {
        console.error('❌ Error sending verification email:', error.message);
        console.log(`Verification URL (for testing): ${verificationUrl}`);
    }
};

/**
 * Send password reset email
 * @param {object} user - User object with email and name
 * @param {string} token - Reset token
 */
const sendPasswordResetEmail = async (user, token) => {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Password Reset Request - Bombay Dyeing - NKM Trading Company',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 12px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${user.name},</h2>
                        <p>We received a request to reset your password for your Bombay Dyeing - NKM Trading Company account.</p>
                        <p>Click the button below to reset your password:</p>
                        <a href="${resetUrl}" class="button">Reset Password</a>
                        <p>Or copy and paste this link in your browser:</p>
                        <p style="word-break: break-all; color: #f5576c;">${resetUrl}</p>
                        <p>This link will expire in 1 hour.</p>
                        <div class="warning">
                            <strong>⚠️ Security Notice:</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
                        </div>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 Bombay Dyeing - NKM Trading Company. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Password reset email sent to ${user.email}`);
        console.log(`Reset URL: ${resetUrl}`);
    } catch (error) {
        console.error('❌ Error sending password reset email:', error.message);
        console.log(`Reset URL (for testing): ${resetUrl}`);
    }
};

/**
 * Send order confirmation email
 * @param {object} order - Order object
 * @param {object} user - User object
 */
const sendOrderConfirmationEmail = async (order, user) => {
    const transporter = createTransporter();

    const itemsHtml = order.orderItems.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.qty}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
        </tr>
    `).join('');

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: `Order Confirmation #${order._id} - Bombay Dyeing - NKM Trading Company`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .order-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    table { width: 100%; border-collapse: collapse; }
                    .total-row { font-weight: bold; font-size: 18px; background: #f0f0f0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Order Confirmed!</h1>
                        <p>Order #${order._id}</p>
                    </div>
                    <div class="content">
                        <h2>Hi ${user.name},</h2>
                        <p>Thank you for your order! We've received it and will process it shortly.</p>
                        
                        <div class="order-details">
                            <h3>Order Details</h3>
                            <table>
                                <thead>
                                    <tr style="background: #f5f5f5;">
                                        <th style="padding: 10px; text-align: left;">Image</th>
                                        <th style="padding: 10px; text-align: left;">Product</th>
                                        <th style="padding: 10px; text-align: center;">Qty</th>
                                        <th style="padding: 10px; text-align: right;">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemsHtml}
                                    <tr class="total-row">
                                        <td colspan="3" style="padding: 15px; text-align: right;">Total:</td>
                                        <td style="padding: 15px; text-align: right;">₹${order.totalPrice.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="order-details">
                            <h3>Shipping Address</h3>
                            <p>
                                ${order.shippingAddress.address}<br>
                                ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br>
                                ${order.shippingAddress.country}
                            </p>
                        </div>

                        <div class="order-details">
                            <h3>Payment Method</h3>
                            <p>${order.paymentMethod}</p>
                            <p>Status: ${order.isPaid ? '✅ Paid' : '⏳ Pending'}</p>
                        </div>

                        <p>We'll send you another email when your order ships.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 Bombay Dyeing - NKM Trading Company. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Order confirmation email sent to ${user.email} for order ${order._id}`);
    } catch (error) {
        console.error('❌ Error sending order confirmation email:', error.message);
    }
};

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendOrderConfirmationEmail,
};

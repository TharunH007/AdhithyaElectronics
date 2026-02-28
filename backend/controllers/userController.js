const User = require('../models/User');
const Order = require('../models/Order');
const generateToken = require('../utils/generateToken');
const { validatePassword } = require('../utils/passwordValidator');
const { generateEmailVerificationToken, generatePasswordResetToken } = require('../utils/emailTokens');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
    const email = req.body.email ? req.body.email.toLowerCase() : '';
    const { password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        // Check if email is verified
        if (!user.isEmailVerified) {
            return res.status(401).json({
                message: 'Please verify your email address before logging in. Check your inbox for the verification link.'
            });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isAdmin: user.isAdmin,
            isEmailVerified: user.isEmailVerified,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    const name = req.body.name;
    const email = req.body.email ? req.body.email.toLowerCase() : '';
    const password = req.body.password;
    const phone = req.body.phone;

    if (!phone) {
        return res.status(400).json({ message: 'Phone number is required' });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        return res.status(400).json({
            message: 'Password does not meet requirements',
            errors: passwordValidation.errors
        });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        if (userExists.isEmailVerified) {
            return res.status(400).json({ message: 'User already exists' });
        } else {
            // Update token for existing unverified user instead of blocking
            const verificationToken = generateEmailVerificationToken();
            const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

            userExists.name = name;
            userExists.password = password;
            userExists.phone = phone;
            userExists.emailVerificationToken = verificationToken;
            userExists.emailVerificationExpires = verificationExpires;
            await userExists.save();

            await sendVerificationEmail(userExists, verificationToken);
            return res.status(200).json({
                message: 'Account exists but unverified. A new verification email has been sent.',
                email: userExists.email,
            });
        }
    }

    // Generate verification token
    const verificationToken = generateEmailVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
        name,
        email,
        password,
        phone,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
        isEmailVerified: false,
    });

    if (user) {
        // Send verification email
        await sendVerificationEmail(user, verificationToken);

        res.status(201).json({
            message: 'Registration successful! Please check your email to verify your account.',
            email: user.email,
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Verify email with token
// @route   GET /api/users/verify-email/:token
// @access  Public
const verifyEmail = async (req, res) => {
    const { token } = req.params;
    console.log('--- Verification Attempt ---');
    console.log('Token from URL:', token);

    // First, find the user by token alone to see if the token exists
    const userByToken = await User.findOne({ emailVerificationToken: token });

    if (!userByToken) {
        console.log('❌ Token Not Found in DB');
        return res.status(400).json({ message: 'Invalid or expired verification token (Token not found)' });
    }

    console.log('✅ Token Found for User:', userByToken.email);
    console.log('Token Expiration in DB:', userByToken.emailVerificationExpires);
    console.log('Current Time:', new Date());

    if (userByToken.emailVerificationExpires < new Date()) {
        console.log('❌ Token Expired');
        return res.status(400).json({ message: 'Invalid or expired verification token (Token expired)' });
    }

    userByToken.isEmailVerified = true;
    userByToken.emailVerificationToken = undefined;
    userByToken.emailVerificationExpires = undefined;
    await userByToken.save();

    console.log('✅ Email Verified Successfully for:', userByToken.email);

    res.json({
        message: 'Email verified successfully! You can now log in.',
        _id: userByToken._id,
        name: userByToken.name,
        email: userByToken.email,
        phone: userByToken.phone,
        isAdmin: userByToken.isAdmin,
        isEmailVerified: userByToken.isEmailVerified,
        token: generateToken(userByToken._id),
    });
};

// @desc    Request password reset
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const email = req.body.email ? req.body.email.toLowerCase() : '';

    const user = await User.findOne({ email });

    if (!user) {
        // Don't reveal if user exists or not for security
        return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // Generate reset token
    const resetToken = generatePasswordResetToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // Send reset email
    await sendPasswordResetEmail(user, resetToken);

    res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
};

// @desc    Reset password with token
// @route   POST /api/users/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        return res.status(400).json({
            message: 'Password does not meet requirements',
            errors: passwordValidation.errors
        });
    }

    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful! You can now log in with your new password.' });
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email ? req.body.email.toLowerCase() : user.email;
        user.phone = req.body.phone || user.phone;

        if (req.body.password) {
            // Validate password strength
            const passwordValidation = validatePassword(req.body.password);
            if (!passwordValidation.isValid) {
                return res.status(400).json({
                    message: 'Password does not meet requirements',
                    errors: passwordValidation.errors
                });
            }
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            isAdmin: updatedUser.isAdmin,
            isEmailVerified: updatedUser.isEmailVerified,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Get all customers (non-admin users)
// @route   GET /api/users/customers
// @access  Private/Admin
const getCustomers = async (req, res) => {
    const customers = await User.find({ isAdmin: false }).select('-password');

    // Get order statistics for each customer
    const customersWithStats = await Promise.all(
        customers.map(async (customer) => {
            const orders = await Order.find({ user: customer._id });
            const totalOrders = orders.length;
            const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);

            return {
                _id: customer._id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                isEmailVerified: customer.isEmailVerified,
                createdAt: customer.createdAt,
                totalOrders,
                totalSpent,
            };
        })
    );

    res.json(customersWithStats);
};

// @desc    Get customer by ID with details
// @route   GET /api/users/customers/:id
// @access  Private/Admin
const getCustomerById = async (req, res) => {
    const customer = await User.findById(req.params.id).select('-password');

    if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
    }

    if (customer.isAdmin) {
        return res.status(400).json({ message: 'Cannot view admin user as customer' });
    }

    // Get customer's orders
    const orders = await Order.find({ user: customer._id }).sort({ createdAt: -1 });
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    res.json({
        customer: {
            _id: customer._id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            isEmailVerified: customer.isEmailVerified,
            createdAt: customer.createdAt,
        },
        stats: {
            totalOrders,
            totalSpent,
        },
        orders,
    });
};

module.exports = {
    authUser,
    registerUser,
    verifyEmail,
    forgotPassword,
    resetPassword,
    updateUserProfile,
    getCustomers,
    getCustomerById,
};

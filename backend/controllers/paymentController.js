const Razorpay = require('razorpay');
const crypto = require('crypto');

const createPaymentOrder = async (req, res) => {
    const { amount } = req.body;

    const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
        amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
        currency: 'INR',
        receipt: `receipt_order_${Date.now()}`,
    };

    try {
        const order = await instance.orders.create(options);
        res.json(order);
    } catch (error) {
        res.status(500).send(error);
    }
};

const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        res.json({
            message: 'Payment verified successfully',
            success: true,
        });
    } else {
        res.status(400).json({
            message: 'Invalid signature',
            success: false,
        });
    }
};

const getRazorpayKey = (req, res) => {
    res.send({ keyId: process.env.RAZORPAY_KEY_ID });
};

module.exports = { createPaymentOrder, verifyPayment, getRazorpayKey };

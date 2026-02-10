const axios = require('axios');

const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;
const SHIPROCKET_TOKEN_FROM_ENV = process.env.SHIPROCKET_TOKEN;

let cachedToken = SHIPROCKET_TOKEN_FROM_ENV || null;
let tokenExpiry = null;

const getAuthToken = async () => {
    // Return cached token if still valid (Standard Shiprocket token is valid for 10 days)
    if (cachedToken && (!tokenExpiry || tokenExpiry > Date.now())) {
        return cachedToken;
    }

    try {
        const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
            email: SHIPROCKET_EMAIL,
            password: SHIPROCKET_PASSWORD,
        });

        if (response.data && response.data.token) {
            cachedToken = response.data.token;
            // Set expiry to 9.5 days to be safe
            tokenExpiry = Date.now() + 9.5 * 24 * 60 * 60 * 1000;
            return cachedToken;
        }
        throw new Error('Failed to get Shiprocket token');
    } catch (error) {
        console.error('Shiprocket Login Error:', error.response ? error.response.data : error.message);
        throw error;
    }
};

const shiprocketRequest = async (method, url, data = null, params = null) => {
    const token = await getAuthToken();
    try {
        const response = await axios({
            method,
            url: `https://apiv2.shiprocket.in/v1/external${url}`,
            data,
            params,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error(`Shiprocket API Error (${url}):`, error.response ? error.response.data : error.message);
        throw error;
    }
};

/**
 * Calculate shipping charges
 */
const getShippingRates = async (pickupPincode, deliveryPincode, weight, length, width, height, cod = 0) => {
    return await shiprocketRequest('get', '/courier/serviceability/', null, {
        pickup_postcode: pickupPincode,
        delivery_postcode: deliveryPincode,
        weight,
        cod,
        length,
        width,
        height,
    });
};

/**
 * Create an order in Shiprocket
 */
const createShiprocketOrder = async (orderItems, shippingAddress, orderId, orderDate, totalPrice) => {
    const data = {
        order_id: orderId,
        order_date: orderDate,
        pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
        billing_customer_name: shippingAddress.name || 'Customer',
        billing_last_name: '',
        billing_address: shippingAddress.address,
        billing_city: shippingAddress.city,
        billing_pincode: shippingAddress.postalCode,
        billing_state: shippingAddress.state || 'State', // State might be needed
        billing_country: shippingAddress.country || 'India',
        billing_email: shippingAddress.email || 'customer@example.com',
        billing_phone: shippingAddress.phone || '',
        shipping_is_billing: true,
        order_items: orderItems.map(item => ({
            name: item.name,
            sku: item.product.toString(),
            units: item.qty,
            selling_price: item.price,
            discount: 0,
            tax: 0,
            hsn: 0,
        })),
        payment_method: 'Prepaid', // Default to prepaid
        sub_total: totalPrice,
        length: 10, // Default or calculated
        width: 10,
        height: 10,
        weight: 0.5,
    };

    return await shiprocketRequest('post', '/orders/create/adhoc', data);
};

/**
 * Generate AWB for a shipment
 */
const generateAWB = async (shipmentId) => {
    return await shiprocketRequest('post', '/courier/assign/awb', { shipment_id: shipmentId });
};

/**
 * Track shipment by AWB
 */
const trackShipment = async (awbCode) => {
    return await shiprocketRequest('get', `/courier/track/awb/${awbCode}`);
};

/**
 * Create Return Order
 */
const createReturnOrder = async (orderData) => {
    // Structure similar to createOrder but for /orders/create/return
    return await shiprocketRequest('post', '/orders/create/return', orderData);
};

module.exports = {
    getShippingRates,
    createShiprocketOrder,
    generateAWB,
    trackShipment,
    createReturnOrder,
};

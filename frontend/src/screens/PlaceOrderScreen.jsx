import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';

const PlaceOrderScreen = () => {
    const navigate = useNavigate();
    const { cartItems, shippingAddress, clearCart } = useCartStore();
    const { userInfo } = useAuthStore();
    const [error, setError] = useState(null);

    // Calculate prices
    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const shippingPrice = itemsPrice > 500 ? 0 : 50;
    const taxPrice = Number((0.18 * itemsPrice).toFixed(2));
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    useEffect(() => {
        if (!shippingAddress.address) {
            navigate('/shipping');
        }
    }, [shippingAddress, navigate]);

    const loadRazorpayConfig = async () => {
        const { data } = await api.get('/api/payment/key');
        return data.keyId;
    };

    const handlePaymentSuccess = async (response, orderId) => {
        try {
            // Verify Signature in Backend
            await api.post('/api/payment/verify', response);

            // Update Order Status
            await api.put(`/api/orders/${orderId}/pay`, {
                id: response.razorpay_payment_id,
                status: 'COMPLETED',
                update_time: String(Date.now()),
                email_address: userInfo.email,
            });

            clearCart();
            navigate(`/order/${orderId}`);
        } catch (err) {
            setError('Payment Verification Failed');
        }
    };

    const placeOrderHandler = async () => {
        try {
            // 1. Create Order in DB
            const { data: order } = await api.post('/api/orders', {
                orderItems: cartItems,
                shippingAddress,
                paymentMethod: 'Razorpay',
                itemsPrice,
                shippingPrice,
                taxPrice,
                totalPrice,
            });

            // 2. Load Script
            const res = await new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => resolve(true);
                script.onerror = () => resolve(false);
                document.body.appendChild(script);
            });

            if (!res) {
                setError('Razorpay SDK failed to load. Are you online?');
                return;
            }

            // 3. Create Razorpay Order
            const keyId = await loadRazorpayConfig();
            const { data: razorpayOrder } = await api.post('/api/payment/order', { amount: totalPrice });

            // 4. Open Options
            const options = {
                key: keyId,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: 'Adhithya Electronics',
                description: 'Payment for Order ' + order._id,
                order_id: razorpayOrder.id,
                handler: function (response) {
                    handlePaymentSuccess(response, order._id);
                },
                prefill: {
                    name: userInfo.name,
                    email: userInfo.email,
                },
                theme: {
                    color: '#4F46E5',
                },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (err) {
            setError(err.response && err.response.data.message ? err.response.data.message : err.message);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
                <h1 className="text-2xl font-bold mb-4">Place Order</h1>
                {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}

                <div className="bg-white p-4 rounded shadow-sm">
                    <h2 className="text-xl font-bold mb-2">Shipping</h2>
                    <p className="text-gray-700">
                        {shippingAddress.address}, {shippingAddress.city},{' '}
                        {shippingAddress.postalCode}, {shippingAddress.country}
                    </p>
                </div>

                <div className="bg-white p-4 rounded shadow-sm">
                    <h2 className="text-xl font-bold mb-2">Order Items</h2>
                    {cartItems.length === 0 ? (
                        <p>Cart is empty</p>
                    ) : (
                        <div className="space-y-4 mt-2">
                            {cartItems.map((item, index) => (
                                <div key={index} className="flex justify-between items-center border-b pb-2 last:border-0">
                                    <div className="flex items-center space-x-4">
                                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                                        <Link to={`/product/${item.product}`} className="text-indigo-600">{item.name}</Link>
                                    </div>
                                    <div>
                                        {item.qty} x ₹{item.price} = ₹{item.qty * item.price}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="md:col-span-1">
                <div className="bg-white p-6 rounded shadow-sm border">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2">Order Summary</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Items</span>
                            <span>₹{itemsPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>₹{shippingPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tax</span>
                            <span>₹{taxPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                            <span>Total</span>
                            <span>₹{totalPrice.toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        className="w-full bg-indigo-600 text-white py-3 rounded font-bold hover:bg-indigo-700 transition mt-6"
                        disabled={cartItems.length === 0}
                        onClick={placeOrderHandler}
                    >
                        Place Order & Pay
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlaceOrderScreen;

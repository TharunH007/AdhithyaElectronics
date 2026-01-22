import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Message from '../../components/Message';
import Loader from '../../components/Loader';

const OrderListScreen = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await api.get('/api/orders'); // Requires Admin Token
                setOrders(data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    return (
        <div className="container mx-auto mt-8">
            <h1 className="text-2xl font-bold mb-4">Orders</h1>
            {loading ? (
                <Loader />
            ) : error ? (
                <Message variant="danger">{error}</Message>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr className="bg-gray-100 border-b text-sm">
                                <th className="py-3 px-4 text-left font-bold text-gray-700">Order ID</th>
                                <th className="py-3 px-4 text-left font-bold text-gray-700">Customer</th>
                                <th className="py-3 px-4 text-left font-bold text-gray-700">Phone / Email</th>
                                <th className="py-3 px-4 text-left font-bold text-gray-700">Total Amount</th>
                                <th className="py-3 px-4 text-left font-bold text-gray-700">Payment Status</th>
                                <th className="py-3 px-4 text-left font-bold text-gray-700">Order Status</th>
                                <th className="py-3 px-4 text-left font-bold text-gray-700">Date</th>
                                <th className="py-3 px-4 text-left font-bold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id} className="border-b hover:bg-gray-50 text-sm">
                                    <td className="py-3 px-4 font-mono text-xs">{order._id}</td>
                                    <td className="py-3 px-4 font-medium">{order.user ? order.user.name : 'Deleted User'}</td>
                                    <td className="py-3 px-4 text-gray-600">{order.user ? order.user.email : 'N/A'}</td>
                                    <td className="py-3 px-4 font-bold tracking-tight">₹{order.totalPrice.toLocaleString('en-IN')}</td>
                                    <td className="py-3 px-4">
                                        {order.isPaid ? (
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold ring-1 ring-green-200">
                                                Paid
                                            </span>
                                        ) : (
                                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold ring-1 ring-red-200">
                                                Failed / Unpaid
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ring-1 ${order.status === 'Delivered'
                                                ? 'bg-blue-100 text-blue-800 ring-blue-200'
                                                : order.isPaid ? 'bg-yellow-100 text-yellow-800 ring-yellow-200' : 'bg-gray-100 text-gray-800 ring-gray-200'
                                            }`}>
                                            {order.status || (order.isDelivered ? 'Delivered' : 'Pending')}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-gray-600">{order.createdAt.substring(0, 10)}</td>
                                    <td className="py-3 px-4">
                                        <Link to={`/order/${order._id}`} className="inline-flex items-center px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                                            View / Update
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default OrderListScreen;

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';
import { ArrowLeft, Mail, Phone, Calendar, Package, DollarSign, MapPin } from 'lucide-react';
import Loader from '../../components/Loader';

const CustomerDetailScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userInfo } = useAuthStore();
    const [customerData, setCustomerData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userInfo || !userInfo.isAdmin) {
            navigate('/login');
        } else {
            fetchCustomerDetails();
        }
    }, [userInfo, navigate, id]);

    const fetchCustomerDetails = async () => {
        try {
            const { data } = await api.get(`/api/users/customers/${id}`);
            setCustomerData(data);
        } catch (error) {
            console.error('Failed to fetch customer details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !customerData) {
        return <Loader />;
    }

    const { customer, stats, orders } = customerData;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    to="/admin/customers"
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Customer Details</h1>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Customer Information</h2>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Name</p>
                            <p className="font-semibold text-gray-900">{customer.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium text-gray-900">{customer.email}</p>
                            </div>
                        </div>
                        {customer.phone && (
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-medium text-gray-900">{customer.phone}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-500">Joined</p>
                                <p className="font-medium text-gray-900">
                                    {new Date(customer.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Email Status</p>
                            {customer.isEmailVerified ? (
                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                    Verified
                                </span>
                            ) : (
                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                    Pending Verification
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-indigo-100 rounded-lg">
                                <Package className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <DollarSign className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Spent</p>
                                <p className="text-2xl font-bold text-gray-900">₹{stats.totalSpent.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Order History</h2>
                {orders.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No orders yet</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm font-mono text-gray-600">
                                            {order._id.slice(-8)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                            ₹{order.totalPrice.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {order.isPaid ? (
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                    Paid
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <Link
                                                to={`/order/${order._id}`}
                                                className="text-indigo-600 hover:text-indigo-700 font-medium"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerDetailScreen;

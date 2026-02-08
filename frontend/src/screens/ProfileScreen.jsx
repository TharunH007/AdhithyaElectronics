import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, ShoppingBag, MapPin, Info, HelpCircle, FileText, ShieldCheck, XCircle, LogOut, ChevronRight } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../utils/api';
import Message from '../components/Message';
import Loader from '../components/Loader';

const ProfileScreen = () => {
    const navigate = useNavigate();
    const { userInfo, logout, setUserInfo } = useAuthStore();

    const [name, setName] = useState(userInfo?.name || '');
    const [email, setEmail] = useState(userInfo?.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [addressForm, setAddressForm] = useState({ name: '', address: '', city: '', postalCode: '', country: 'India' });
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    const [activeTab, setActiveTab] = useState('profile'); // profile, orders, address, info

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
        } else {
            if (!userInfo.isAdmin) {
                fetchAddresses();
                fetchOrders();
            }
        }
    }, [navigate, userInfo]);

    const fetchAddresses = async () => {
        setLoadingAddresses(true);
        try {
            const { data } = await api.get('/api/addresses');
            setAddresses(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingAddresses(false);
        }
    };

    const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
            const { data } = await api.get('/api/orders/myorders');
            setOrders(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingOrders(false);
        }
    };

    const addAddressHandler = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/addresses', addressForm);
            setAddressForm({ name: '', address: '', city: '', postalCode: '', country: 'India' });
            setShowAddressForm(false);
            fetchAddresses();
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const deleteAddressHandler = async (id) => {
        if (window.confirm('Delete this address?')) {
            try {
                await api.delete(`/api/addresses/${id}`);
                fetchAddresses();
            } catch (err) {
                alert(err.response?.data?.message || err.message);
            }
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
        } else {
            setLoading(true);
            try {
                const { data } = await api.put('/api/users/profile', {
                    _id: userInfo._id,
                    name,
                    email,
                    password,
                });
                setUserInfo(data);
                setSuccess(true);
                setMessage(null);
                setLoading(false);
            } catch (err) {
                setMessage(err.response?.data?.message || err.message);
                setLoading(false);
            }
        }
    };

    const menuItems = [
        { id: 'profile', label: 'My Profile', icon: <User size={20} />, color: 'text-amber-600' },
        ...(!userInfo?.isAdmin ? [
            { id: 'orders', label: 'Online Order History', icon: <ShoppingBag size={20} />, color: 'text-amber-700' },
            { id: 'address', label: 'Online Saved Address', icon: <MapPin size={20} />, color: 'text-amber-800' },
        ] : []),
        { id: 'about', label: 'About Us', icon: <Info size={20} />, color: 'text-amber-600' },
        { id: 'faq', label: 'FAQ\'s', icon: <HelpCircle size={20} />, color: 'text-amber-600' },
        { id: 'terms', label: 'Terms and Conditions', icon: <FileText size={20} />, color: 'text-amber-700' },
        { id: 'privacy', label: 'Privacy Policy', icon: <ShieldCheck size={20} />, color: 'text-amber-800' },
        { id: 'cancellation', label: 'Cancellation Policy', icon: <XCircle size={20} />, color: 'text-red-500' },
        { id: 'logout', label: 'Logout', icon: <LogOut size={20} />, color: 'text-gray-600', action: logout },
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Menu */}
                <div className="w-full md:w-80 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 bg-amber-50/30 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">Account</h2>
                            <p className="text-sm text-gray-500 mt-1">{userInfo?.email}</p>
                        </div>
                        <nav className="p-2">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => item.action ? item.action() : setActiveTab(item.id)}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all group ${activeTab === item.id
                                        ? 'bg-amber-50 text-indigo-700'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`${activeTab === item.id ? 'text-indigo-600' : item.color}`}>
                                            {item.icon}
                                        </span>
                                        <span className="font-medium">{item.label}</span>
                                    </div>
                                    <ChevronRight size={16} className={`text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ${activeTab === item.id ? 'opacity-100' : ''}`} />
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-grow">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 min-h-[500px]">
                        {activeTab === 'profile' && (
                            <div className="max-w-md">
                                <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>
                                {message && <Message variant="danger">{message}</Message>}
                                {success && <Message variant="success">Profile Updated Successfully</Message>}
                                {loading && <Loader />}
                                <form onSubmit={submitHandler} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                                        <input
                                            type="password"
                                            placeholder="Leave blank to keep current"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm New Password</label>
                                        <input
                                            type="password"
                                            placeholder="Leave blank to keep current"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                                    >
                                        Update Account
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800 mb-6">Order History</h1>
                                {loadingOrders ? (
                                    <div className="text-center py-8">Loading orders...</div>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500 italic mb-4">No orders found.</p>
                                        <button
                                            onClick={() => navigate('/')}
                                            className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-2 mx-auto"
                                        >
                                            Browse Products <ChevronRight size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div
                                                key={order._id}
                                                className="border border-gray-200 rounded-lg p-4 hover:border-indigo-200 transition"
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <p className="text-sm text-gray-500">Order ID</p>
                                                        <p className="font-mono text-sm font-semibold text-gray-900">
                                                            {order._id}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-500">Total</p>
                                                        <p className="text-lg font-bold text-gray-900">
                                                            ₹{order.totalPrice.toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex gap-4 text-sm">
                                                        <div>
                                                            <span className="text-gray-500">Date: </span>
                                                            <span className="font-medium text-gray-900">
                                                                {new Date(order.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            {order.isPaid ? (
                                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                                    Paid
                                                                </span>
                                                            ) : (
                                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                                    Pending
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Link
                                                        to={`/order/${order._id}`}
                                                        className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center gap-1"
                                                    >
                                                        View Details <ChevronRight size={16} />
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'address' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h1 className="text-2xl font-bold text-gray-800">Saved Addresses</h1>
                                    <button
                                        onClick={() => setShowAddressForm(!showAddressForm)}
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all"
                                    >
                                        {showAddressForm ? 'Cancel' : 'Add New Address'}
                                    </button>
                                </div>

                                {showAddressForm && (
                                    <form onSubmit={addAddressHandler} className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={addressForm.name}
                                                    onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Street Address</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={addressForm.address}
                                                    onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">City</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={addressForm.city}
                                                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Postal Code (Chennai only)</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={addressForm.postalCode}
                                                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition-all"
                                        >
                                            Save Address
                                        </button>
                                    </form>
                                )}

                                {loadingAddresses ? <Loader /> : (
                                    <div className="space-y-4">
                                        {addresses.length === 0 ? (
                                            <div className="p-12 border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400">
                                                <MapPin size={32} className="mb-2" />
                                                <p>No addresses saved yet.</p>
                                            </div>
                                        ) : (
                                            addresses.map((addr) => (
                                                <div key={addr._id} className="flex justify-between items-start p-4 border border-gray-100 rounded-xl bg-white shadow-sm hover:border-indigo-100 transition-all">
                                                    <div>
                                                        <p className="font-bold text-gray-900">{addr.name}</p>
                                                        <p className="text-sm text-gray-600 mt-1">{addr.address}, {addr.city}</p>
                                                        <p className="text-sm text-gray-600">{addr.postalCode}, {addr.country}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => deleteAddressHandler(addr._id)}
                                                        className="text-red-500 hover:text-red-700 p-2"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {['about', 'faq', 'terms', 'privacy', 'cancellation'].includes(activeTab) && (
                            <div className="prose max-w-none text-gray-600">
                                <h1 className="text-2xl font-bold text-gray-800 mb-6 capitalize">
                                    {activeTab.replace(/([A-Z])/g, ' $1')}
                                </h1>
                                <p>This information is currently being updated. Please check back later for full details regarding our policies and company information.</p>
                                <p>For urgent inquiries, please contact our support team at support@nkmtrading.com.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileScreen;

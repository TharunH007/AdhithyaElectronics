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
    const [addressForm, setAddressForm] = useState({ name: '', address: '', city: '', state: '', postalCode: '', phone: '', country: 'India' });
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
            setAddressForm({ name: '', address: '', city: '', state: '', postalCode: '', phone: '', country: 'India' });
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
            { id: 'orders', label: 'My Orders', icon: <ShoppingBag size={20} />, color: 'text-amber-700' },
            { id: 'address', label: 'Saved Addresses', icon: <MapPin size={20} />, color: 'text-amber-800' },
        ] : []),
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
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">State</label>
                                                <select
                                                    required
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    value={addressForm.state}
                                                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                                >
                                                    <option value="">Select State</option>
                                                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                                                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                                                    <option value="Assam">Assam</option>
                                                    <option value="Bihar">Bihar</option>
                                                    <option value="Chhattisgarh">Chhattisgarh</option>
                                                    <option value="Goa">Goa</option>
                                                    <option value="Gujarat">Gujarat</option>
                                                    <option value="Haryana">Haryana</option>
                                                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                                                    <option value="Jharkhand">Jharkhand</option>
                                                    <option value="Karnataka">Karnataka</option>
                                                    <option value="Kerala">Kerala</option>
                                                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                                                    <option value="Maharashtra">Maharashtra</option>
                                                    <option value="Manipur">Manipur</option>
                                                    <option value="Meghalaya">Meghalaya</option>
                                                    <option value="Mizoram">Mizoram</option>
                                                    <option value="Nagaland">Nagaland</option>
                                                    <option value="Odisha">Odisha</option>
                                                    <option value="Punjab">Punjab</option>
                                                    <option value="Rajasthan">Rajasthan</option>
                                                    <option value="Sikkim">Sikkim</option>
                                                    <option value="Tamil Nadu">Tamil Nadu</option>
                                                    <option value="Telangana">Telangana</option>
                                                    <option value="Tripura">Tripura</option>
                                                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                                                    <option value="Uttarakhand">Uttarakhand</option>
                                                    <option value="West Bengal">West Bengal</option>
                                                    <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                                                    <option value="Chandigarh">Chandigarh</option>
                                                    <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                                                    <option value="Delhi">Delhi</option>
                                                    <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                                                    <option value="Ladakh">Ladakh</option>
                                                    <option value="Lakshadweep">Lakshadweep</option>
                                                    <option value="Puducherry">Puducherry</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Postal Code</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={addressForm.postalCode}
                                                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mobile Number</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={addressForm.phone}
                                                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition-all font-sans"
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
                                                        <p className="text-xs text-indigo-600 font-bold mt-1">{addr.phone}</p>
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileScreen;

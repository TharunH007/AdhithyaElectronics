import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';
import { ShieldCheck, Lock, Mail, ChevronRight, AlertCircle } from 'lucide-react';
import Loader from '../../components/Loader';

const AdminLoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { userInfo, setUserInfo } = useAuthStore();

    useEffect(() => {
        if (userInfo && userInfo.isAdmin) {
            navigate('/admin/dashboard');
        }
    }, [navigate, userInfo]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.post('/api/users/login', {
                email: email.toLowerCase(),
                password
            });

            if (!data.isAdmin) {
                setError('Access Denied: This portal is for administrators only.');
                setLoading(false);
                return;
            }

            setUserInfo(data);

            // Fetch Cart from DB (standard procedure)
            try {
                const { data: cartData } = await api.get('/api/cart');
                if (cartData && cartData.cartItems) {
                    const useCartStore = (await import('../../store/cartStore')).default;
                    useCartStore.getState().setCart(cartData.cartItems);
                }
            } catch (err) {
                console.error('Failed to fetch cart from DB', err);
            }

            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response && err.response.data.message ? err.response.data.message : err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100 mb-4">
                        <ShieldCheck className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Portal</h1>
                    <p className="text-gray-500 mt-2 font-medium">Secure access for Adithya Electronics Management</p>
                </div>

                {/* Login Card */}
                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 relative overflow-hidden">
                    {/* Decorative Background Element */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl mb-6 flex items-start gap-3 animate-shake">
                            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                            <p className="text-sm font-bold">{error}</p>
                        </div>
                    )}

                    <form onSubmit={submitHandler} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Admin Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-300"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@adithya.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-300"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-[0.98] disabled:opacity-50 mt-4"
                        >
                            {loading ? <Loader size="sm" /> : (
                                <>
                                    Secure Login <ChevronRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Links */}
                <div className="mt-8 text-center space-y-4">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                        Authorized Personnel Only<br />
                        Unauthorized access attempts are monitored and recorded.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                        Return to Storefront
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginScreen;

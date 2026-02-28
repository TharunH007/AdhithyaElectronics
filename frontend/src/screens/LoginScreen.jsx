import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { search } = useLocation();
    const { userInfo, setUserInfo } = useAuthStore();

    const redirect = new URLSearchParams(search).get('redirect') || '/';

    useEffect(() => {
        if (userInfo) {
            navigate(redirect);
        }
    }, [navigate, userInfo, redirect]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.post('/api/users/login', { email, password });
            setUserInfo(data);

            // Fetch Cart from DB
            try {
                const { data: cartData } = await api.get('/api/cart');
                if (cartData && cartData.cartItems) {
                    const useCartStore = (await import('../store/cartStore')).default;
                    useCartStore.getState().setCart(cartData.cartItems);
                }
            } catch (err) {
                console.error('Failed to fetch cart from DB', err);
            }

            // If there's no specific redirect provided, go to home
            const target = redirect === '/' ? '/' : redirect;
            navigate(target);
        } catch (err) {
            setError(err.response && err.response.data.message ? err.response.data.message : err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded shadow-md mt-10">
            <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
            {loading && <div className="text-center mb-4">Loading...</div>}

            <form onSubmit={submitHandler}>
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Email Address</label>
                    <input
                        type="email"
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 font-bold mb-2">Password</label>
                    <input
                        type="password"
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2 rounded font-bold hover:bg-indigo-700 transition"
                >
                    Sign In
                </button>
            </form>

            <div className="mt-4 text-center">
                <Link to="/forgot-password" className="text-sm text-indigo-600 hover:underline">
                    Forgot Password?
                </Link>
            </div>

            <div className="mt-4 text-center">
                New Customer?{' '}
                <Link to={`/register?redirect=${redirect}`} className="text-indigo-600 hover:underline">
                    Register
                </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <Link to="/admin/login" className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                    Admin Portal
                </Link>
            </div>
        </div>
    );
};

export default LoginScreen;

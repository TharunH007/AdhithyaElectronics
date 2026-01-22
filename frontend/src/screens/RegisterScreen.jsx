import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import useAuthStore from '../store/authStore';
import { Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

const RegisterScreen = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState(null);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState([]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { search } = useLocation();
    const { userInfo } = useAuthStore();

    const redirect = new URLSearchParams(search).get('redirect') || '/';

    useEffect(() => {
        if (userInfo) {
            navigate(redirect);
        }
    }, [navigate, userInfo, redirect]);

    // Password strength indicator
    const getPasswordStrength = (pwd) => {
        let strength = 0;
        if (pwd.length >= 8) strength++;
        if (pwd.length >= 12) strength++;
        if (/[A-Z]/.test(pwd)) strength++;
        if (/[a-z]/.test(pwd)) strength++;
        if (/[0-9]/.test(pwd)) strength++;
        if (/[@$!%*?&]/.test(pwd)) strength++;

        if (strength <= 2) return { level: 'weak', color: 'bg-red-500', text: 'Weak', width: '33%' };
        if (strength <= 4) return { level: 'medium', color: 'bg-yellow-500', text: 'Medium', width: '66%' };
        return { level: 'strong', color: 'bg-green-500', text: 'Strong', width: '100%' };
    };

    const passwordStrength = password ? getPasswordStrength(password) : null;

    const submitHandler = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }
        setMessage(null);
        setLoading(true);
        setError(null);
        setValidationErrors([]);

        try {
            const { data } = await api.post('/api/users', { name, email, password });
            setSuccess(true);
            setMessage(data.message);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            if (err.response?.data?.errors) {
                setValidationErrors(err.response.data.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100 mt-10">
                <div className="text-center">
                    <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h1>
                    <p className="text-gray-600 mb-6">{message}</p>
                    <p className="text-sm text-gray-500 mb-6">
                        Please check your email inbox and click the verification link to activate your account.
                    </p>
                    <Link
                        to="/login"
                        className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100 mt-10">
            <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>

            {message && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{message}</div>}
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            {validationErrors.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4">
                    <p className="font-semibold mb-2">Password requirements:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                        {validationErrors.map((err, idx) => (
                            <li key={idx}>{err}</li>
                        ))}
                    </ul>
                </div>
            )}

            <form onSubmit={submitHandler} className="space-y-4">
                <div>
                    <label className="block text-gray-700 font-semibold mb-1">Full Name</label>
                    <input
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-semibold mb-1">Email Address</label>
                    <input
                        type="email"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-semibold mb-1">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition pr-10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {password && passwordStrength && (
                        <div className="mt-2">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${passwordStrength.color} transition-all`}
                                        style={{ width: passwordStrength.width }}
                                    />
                                </div>
                                <span className="text-xs font-semibold text-gray-600">
                                    {passwordStrength.text}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500">
                                Use 8+ characters with uppercase, lowercase, numbers, and symbols (@$!%*?&)
                            </p>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-gray-700 font-semibold mb-1">Confirm Password</label>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Creating Account...' : 'Register'}
                </button>
            </form>

            <div className="mt-6 text-center">
                Already have an account?{' '}
                <Link to={`/login?redirect=${redirect}`} className="text-indigo-600 hover:underline font-semibold">
                    Sign In
                </Link>
            </div>
        </div>
    );
};

export default RegisterScreen;

import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import useAuthStore from '../store/authStore';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const EmailVerificationScreen = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { setUserInfo } = useAuthStore();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    const calledRequest = useRef(false);

    useEffect(() => {
        const verifyEmail = async () => {
            if (calledRequest.current) return;
            calledRequest.current = true;

            try {
                const { data } = await api.get(`/api/users/verify-email/${token}`);
                setStatus('success');
                setMessage(data.message);

                // Auto-login the user
                setUserInfo(data);

                // Redirect to home after 3 seconds
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed');
            }
        };

        if (token) {
            verifyEmail();
        }
    }, [token, navigate, setUserInfo]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                {status === 'verifying' && (
                    <div className="text-center">
                        <Loader2 className="h-16 w-16 text-indigo-600 animate-spin mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Verifying Email...</h1>
                        <p className="text-gray-600">Please wait while we verify your email address.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="text-center">
                        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h1>
                        <p className="text-gray-600 mb-4">{message}</p>
                        <p className="text-sm text-gray-500">Redirecting you to home page...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="text-center">
                        <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h1>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <div className="space-y-3">
                            <Link
                                to="/register"
                                className="block w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition"
                            >
                                Register Again
                            </Link>
                            <Link
                                to="/login"
                                className="block w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 transition"
                            >
                                Go to Login
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmailVerificationScreen;

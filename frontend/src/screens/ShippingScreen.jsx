import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import api from '../utils/api';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { Info, MapPin, ChevronRight } from 'lucide-react';

const ShippingScreen = () => {
    const navigate = useNavigate();
    const { shippingAddress, saveShippingAddress } = useCartStore();

    const [address, setAddress] = useState(shippingAddress.address || '');
    const [city, setCity] = useState(shippingAddress.city || '');
    const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
    const [country, setCountry] = useState(shippingAddress.country || 'India');
    const [error, setError] = useState('');
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAddresses = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/api/addresses');
                setAddresses(data);
                setLoading(false);
            } catch (err) {
                setLoading(false);
            }
        };
        fetchAddresses();
    }, []);

    const selectAddressHandler = (addr) => {
        setAddress(addr.address);
        setCity(addr.city);
        setPostalCode(addr.postalCode);
        setCountry(addr.country);
    };

    const submitHandler = (e) => {
        e.preventDefault();
        if (!postalCode.startsWith('600') || postalCode.length !== 6) {
            setError('Currently, we only ship to Chennai (PIN codes starting with 600).');
            return;
        }
        saveShippingAddress({ address, city, postalCode, country });
        navigate('/placeorder');
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <h1 className="text-3xl font-bold mb-2 text-gray-900">Shipping</h1>
                <div className="flex items-center gap-2 mb-6 bg-indigo-50 p-3 rounded-lg text-indigo-700 text-sm">
                    <Info size={18} />
                    <p>We are currently only delivering within <strong>Chennai</strong>.</p>
                </div>

                {loading ? <Loader /> : addresses.length > 0 && (
                    <div className="mb-8">
                        <p className="text-sm font-bold text-gray-500 uppercase mb-3">Select Saved Address</p>
                        <div className="space-y-3">
                            {addresses.map((addr) => (
                                <button
                                    key={addr._id}
                                    type="button"
                                    onClick={() => selectAddressHandler(addr)}
                                    className="w-full text-left p-4 border border-gray-100 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/30 transition-all flex justify-between items-center group bg-gray-50/50"
                                >
                                    <div className="flex gap-3 items-center">
                                        <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            <MapPin size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{addr.name}</p>
                                            <p className="text-xs text-gray-500 truncate max-w-[200px]">{addr.address}, {addr.city}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-300 group-hover:text-indigo-500 transition-all" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {error && <Message variant="danger">{error}</Message>}

                <p className="text-sm font-bold text-gray-500 uppercase mb-3 text-center">--- OR ENTER NEW ---</p>

                <form onSubmit={submitHandler} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Street Address</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. 123 Anna Salai"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                        <input
                            type="text"
                            required
                            placeholder="Chennai"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Postal Code (Chennai only)</label>
                        <input
                            type="text"
                            required
                            placeholder="600xxx"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Country</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                            value={country}
                            readOnly
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-[0.98]"
                    >
                        Continue to Payment
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ShippingScreen;

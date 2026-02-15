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
    const [state, setState] = useState(shippingAddress.state || '');
    const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
    const [country, setCountry] = useState(shippingAddress.country || 'India');
    const [phone, setPhone] = useState(shippingAddress.phone || '');
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
        setState(addr.state || '');
        setPostalCode(addr.postalCode);
        setCountry(addr.country);
        setPhone(addr.phone || '');
    };

    const submitHandler = (e) => {
        e.preventDefault();
        if (postalCode.length < 6) {
            setError('Please enter a valid 6-digit postal code.');
            return;
        }
        if (phone.length < 10) {
            setError('Please enter a valid phone number.');
            return;
        }
        saveShippingAddress({ address, city, state, postalCode, country, phone });
        navigate('/placeorder');
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <h1 className="text-3xl font-bold mb-6 text-gray-900">Shipping</h1>

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
                                            <p className="text-xs text-gray-500 truncate max-w-[180px]">{addr.address}, {addr.city}</p>
                                            <p className="text-[10px] text-indigo-600 font-semibold">{addr.phone}</p>
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
                            placeholder="e.g. 123 Main St"
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
                            placeholder="City name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">State</label>
                        <select
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
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
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Postal Code</label>
                        <input
                            type="text"
                            required
                            placeholder="6-digit PIN"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile Number</label>
                        <input
                            type="text"
                            required
                            placeholder="10-digit mobile"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
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

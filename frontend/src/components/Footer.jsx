import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-100 py-12 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
                    <div>
                        <h3 className="text-lg font-black text-indigo-600 mb-4 uppercase tracking-tighter">Bombay Dyeing</h3>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
                            Partner with NKM Trading Company. Bringing premium home textiles and luxury comfort to every Indian household.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">Customer Service</h4>
                        <ul className="space-y-3">
                            <li><Link to="/about" className="text-gray-600 hover:text-indigo-600 transition text-sm font-medium">About Us</Link></li>
                            <li><Link to="/faq" className="text-gray-600 hover:text-indigo-600 transition text-sm font-medium">FAQ's</Link></li>
                            <li><Link to="/order-tracking" className="text-gray-600 hover:text-indigo-600 transition text-sm font-medium">Track Order</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">Legal & Policy</h4>
                        <ul className="space-y-3">
                            <li><Link to="/terms" className="text-gray-600 hover:text-indigo-600 transition text-sm font-medium">Terms and Conditions</Link></li>
                            <li><Link to="/return-policy" className="text-gray-600 hover:text-indigo-600 transition text-sm font-medium">Return Policy</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-50 mt-12 pt-8 text-center text-gray-400 text-xs font-medium uppercase tracking-widest">
                    <p>&copy; {new Date().getFullYear()} Bombay Dyeing - NKM Trading Company. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

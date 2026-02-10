import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { Package, Truck, Check, X, Eye } from 'lucide-react';

const ReturnListScreen = () => {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchReturns = async () => {
        try {
            const { data } = await api.get('/api/returns');
            setReturns(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReturns();
    }, []);

    const statusHandler = async (id, status) => {
        if (window.confirm(`Update status to ${status}?`)) {
            try {
                await api.put(`/api/returns/${id}/status`, { status });
                await fetchReturns();
            } catch (err) {
                alert(err.response?.data?.message || err.message);
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-700 ring-green-200';
            case 'Picked up': return 'bg-blue-100 text-blue-700 ring-blue-200';
            case 'Completed': return 'bg-gray-100 text-gray-700 ring-gray-200';
            case 'Rejected': return 'bg-red-100 text-red-700 ring-red-200';
            default: return 'bg-amber-100 text-amber-700 ring-amber-200';
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Return & Replacement Requests</h1>
                    <p className="text-gray-500 mt-1 uppercase text-xs font-bold tracking-widest">Manage customer returns</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                    <Package size={24} />
                </div>
            </div>

            {loading ? <Loader /> : error ? <Message variant="danger">{error}</Message> : (
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Request Info</th>
                                    <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Customer</th>
                                    <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Order Details</th>
                                    <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Reason</th>
                                    <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {returns.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-400 italic">No return requests found.</td>
                                    </tr>
                                ) : returns.map((ret) => (
                                    <tr key={ret._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <p className="font-bold text-gray-900 leading-tight">{ret.type}</p>
                                            <p className="text-[10px] font-mono text-gray-400 mt-1 uppercase tracking-tighter">REQ: {ret._id.substring(18)}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="font-bold text-gray-800">{ret.user?.name}</p>
                                            <p className="text-xs text-gray-500">{ret.user?.email}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-black text-indigo-600">₹{ret.order?.totalPrice?.toLocaleString('en-IN')}</p>
                                            <Link to={`/order/${ret.order?._id}`} className="text-[10px] font-mono text-gray-400 hover:text-indigo-600 uppercase">View Order</Link>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm text-gray-600 max-w-[200px] truncate" title={ret.reason}>{ret.reason}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ring-1 ${getStatusColor(ret.status)}`}>
                                                {ret.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {ret.status === 'Requested' && (
                                                    <>
                                                        <button onClick={() => statusHandler(ret._id, 'Approved')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors" title="Approve">
                                                            <Check size={16} />
                                                        </button>
                                                        <button onClick={() => statusHandler(ret._id, 'Rejected')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Reject">
                                                            <X size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                {ret.status === 'Approved' && (
                                                    <button onClick={() => statusHandler(ret._id, 'Picked up')} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Mark as Picked Up">
                                                        <Truck size={16} />
                                                    </button>
                                                )}
                                                {ret.status === 'Picked up' && (
                                                    <button onClick={() => statusHandler(ret._id, 'Completed')} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors" title="Mark as Completed">
                                                        <Check size={16} />
                                                    </button>
                                                )}
                                                <Link to={`/order/${ret.order?._id}`} className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                                                    <Eye size={16} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReturnListScreen;

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
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
            case 'Approved': return 'bg-emerald-100 text-emerald-700 ring-emerald-200';
            case 'Picked up': return 'bg-sky-100 text-sky-700 ring-sky-200';
            case 'Completed': return 'bg-slate-100 text-slate-700 ring-slate-200';
            case 'Rejected': return 'bg-rose-100 text-rose-700 ring-rose-200';
            default: return 'bg-amber-100 text-amber-700 ring-amber-200';
        }
    };

    const StatusBadge = ({ status }) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase ring-1 ring-inset ${getStatusColor(status)}`}>
            {status}
        </span>
    );

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Return Requests</h1>
                    <p className="text-gray-500 mt-1 uppercase text-xs font-bold tracking-widest">Manage customer returns</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                    <Package size={24} />
                </div>
            </div>

            {loading ? <Loader /> : error ? <Message variant="danger">{error}</Message> : (
                <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-100 border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Request</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Customer</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Order</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {returns.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center">
                                            <Package size={48} className="mx-auto text-gray-200 mb-4" />
                                            <p className="text-gray-400 font-medium italic">No return requests found.</p>
                                        </td>
                                    </tr>
                                ) : returns.map((ret) => (
                                    <tr key={ret._id} className="hover:bg-gray-50/50 transition-all duration-300 group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-2xl ${ret.type === 'Return' ? 'bg-rose-50 text-rose-500' : 'bg-sky-50 text-sky-500'}`}>
                                                    <Package size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 leading-none">{ret.type}</p>
                                                    <p className="text-[10px] font-mono text-gray-400 mt-2 uppercase tracking-tighter">#{ret._id.substring(18)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="font-bold text-gray-800 leading-none">{ret.user?.name}</p>
                                            <p className="text-xs text-gray-500 mt-1.5">{ret.user?.email}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-black text-indigo-600">₹{ret.order?.totalPrice?.toLocaleString('en-IN')}</p>
                                            <p className="text-[10px] text-gray-400 mt-1">ITEMS: {ret.order?.orderItems?.length || 0}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <StatusBadge status={ret.status} />
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => { setSelectedRequest(ret); setIsModalOpen(true); }}
                                                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
                                            >
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Detailed View Modal */}
            {isModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-2xl bg-rose-50 text-rose-500`}>
                                    <Package size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Return Request</h2>
                                    <p className="text-xs font-mono text-gray-400 uppercase tracking-widest mt-0.5">ID: {selectedRequest._id}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full text-gray-400 transition-colors shadow-sm active:scale-90">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 overflow-y-auto space-y-8">
                            {/* Status Section */}
                            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Status</p>
                                    <StatusBadge status={selectedRequest.status} />
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Requested On</p>
                                    <p className="text-sm font-bold text-gray-700">{new Date(selectedRequest.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Customer Info */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                                        Customer Details
                                    </h3>
                                    <div className="space-y-1">
                                        <p className="text-lg font-black text-gray-900">{selectedRequest.user?.name}</p>
                                        <p className="text-sm font-medium text-gray-500">{selectedRequest.user?.email}</p>
                                        <p className="text-sm font-bold text-indigo-600 mt-2">{selectedRequest.user?.phone || 'No phone provided'}</p>
                                    </div>
                                </div>

                                {/* Order Info */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                                        Order Summary
                                    </h3>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-gray-900">Total: ₹{selectedRequest.order?.totalPrice?.toLocaleString('en-IN')}</p>
                                        <Link to={`/order/${selectedRequest.order?._id}`} className="text-xs font-mono text-gray-400 hover:text-indigo-600 underline underline-offset-4 decoration-2">
                                            View Full Order Detail
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Reason */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                                    Reason for {selectedRequest.type}
                                </h3>
                                <div className="p-5 bg-white border border-gray-100 rounded-3xl text-sm text-gray-600 leading-relaxed font-medium">
                                    "{selectedRequest.reason}"
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                                    Items in Order
                                </h3>
                                <div className="space-y-3">
                                    {selectedRequest.order?.orderItems?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-4 bg-gray-50/50 border border-gray-100 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-xl shadow-sm border border-white" />
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{item.name}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Qty: {item.qty}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-black text-gray-900">₹{item.price?.toLocaleString('en-IN')}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer / Actions */}
                        <div className="p-8 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-3">
                            <div className="flex-1 flex gap-3">
                                {selectedRequest.status === 'Requested' && (
                                    <>
                                        <button
                                            onClick={() => statusHandler(selectedRequest._id, 'Approved')}
                                            className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2 active:scale-95"
                                        >
                                            <Check size={16} /> Approve & Initiate
                                        </button>
                                        <button
                                            onClick={() => statusHandler(selectedRequest._id, 'Rejected')}
                                            className="px-6 py-3 bg-white text-rose-600 border border-rose-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center gap-2 active:scale-95"
                                        >
                                            <X size={16} /> Reject
                                        </button>
                                    </>
                                )}
                                {selectedRequest.status === 'Approved' && (
                                    <button
                                        onClick={() => statusHandler(selectedRequest._id, 'Picked up')}
                                        className="px-6 py-3 bg-sky-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-sky-700 transition-all shadow-lg shadow-sky-100 flex items-center gap-2 active:scale-95"
                                    >
                                        <Truck size={16} /> Mark as Picked Up
                                    </button>
                                )}
                                {selectedRequest.status === 'Picked up' && (
                                    <button
                                        onClick={() => statusHandler(selectedRequest._id, 'Completed')}
                                        className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 active:scale-95"
                                    >
                                        <Check size={16} /> Mark as Completed
                                    </button>
                                )}
                                {selectedRequest.status === 'Completed' && (
                                    <div className="flex items-center gap-2 px-6 py-3 bg-white text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest border border-gray-100">
                                        <Check size={16} /> Processing Finished
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-3 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-gray-600 active:scale-95"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReturnListScreen;

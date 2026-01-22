import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';
import { Users, Package, TrendingUp, DollarSign, BarChart3, Calendar } from 'lucide-react';
import Loader from '../../components/Loader';

const DashboardScreen = () => {
    const navigate = useNavigate();
    const { userInfo } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [dateRange, setDateRange] = useState('7days');

    useEffect(() => {
        if (!userInfo || !userInfo.isAdmin) {
            navigate('/login');
        } else {
            fetchDashboardStats();
        }
    }, [userInfo, navigate, dateRange]);

    const fetchDashboardStats = async () => {
        setLoading(true);
        try {
            const end = new Date();
            let start = new Date();

            if (dateRange === '7days') {
                start.setDate(end.getDate() - 7);
            } else if (dateRange === '30days') {
                start.setDate(end.getDate() - 30);
            } else if (dateRange === '90days') {
                start.setDate(end.getDate() - 90);
            }

            const { data } = await api.get(`/api/admin/dashboard?startDate=${start.toISOString()}&endDate=${end.toISOString()}`);
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !stats) {
        return <Loader />;
    }

    const { metrics, topProducts, topCategories } = stats;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                    <p className="text-gray-500 mt-1">
                        Showing data for {dateRange === '7days' ? 'last 7 days' : dateRange === '30days' ? 'last 30 days' : 'last 90 days'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="outline-none text-sm font-medium"
                        >
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                            <option value="90days">Last 90 Days</option>
                        </select>
                    </div>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-red-700 transition flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <MetricCard
                    title="Revenue (Period)"
                    value={`₹${metrics.revenue.toFixed(0)}`}
                    change={`${metrics.periodGrowth >= 0 ? '+' : ''}${metrics.periodGrowth}%`}
                    positive={metrics.periodGrowth >= 0}
                />
                <MetricCard
                    title="Period Growth"
                    value={`${metrics.periodGrowth.toFixed(1)}%`}
                    change={`${metrics.periodGrowth >= 0 ? '+' : ''}${metrics.periodGrowth}%`}
                    positive={metrics.periodGrowth >= 0}
                />
                <MetricCard
                    title="Orders (Period)"
                    value={metrics.orders}
                    change={`${metrics.periodGrowth >= 0 ? '+' : ''}${metrics.periodGrowth}%`}
                    positive={metrics.periodGrowth >= 0}
                />
                <MetricCard
                    title="Avg. Order Value"
                    value={`₹${metrics.avgOrderValue.toFixed(0)}`}
                    change="0%"
                    positive={true}
                />
                <MetricCard
                    title="Conversion Rate"
                    value={`${metrics.conversionRate.toFixed(1)}%`}
                    change="0%"
                    positive={true}
                />
            </div>

            {/* Revenue Trends & Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trends */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-800">Revenue Trends</h2>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 text-sm font-medium bg-indigo-50 text-indigo-600 rounded">Daily</button>
                            <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded">Weekly</button>
                            <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded">Monthly</button>
                        </div>
                    </div>
                    <div className="h-64 flex items-center justify-center text-gray-400">
                        <p>Chart visualization would go here</p>
                    </div>
                </div>

                {/* Top Selling Products */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Top Selling Products</h2>
                    {topProducts.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">No data available</p>
                    ) : (
                        <div className="space-y-3">
                            {topProducts.map((product, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                                    <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-800 truncate">{product.name}</p>
                                        <p className="text-sm text-gray-500">{product.totalQty} sold</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-800">₹{product.totalRevenue.toFixed(0)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Top Categories */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Top Categories</h2>
                {topCategories.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No data available</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {topCategories.map((category, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-800 truncate">{category.name}</p>
                                    <p className="text-sm font-bold text-indigo-600">₹{category.revenue.toFixed(0)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="text-center py-4 text-gray-500 text-sm border-t">
                © 2026 Adhithya Electronics. All rights reserved.
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, change, positive }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
        <div className="flex items-center gap-1">
            <TrendingUp className={`h-4 w-4 ${positive ? 'text-green-600' : 'text-red-600'}`} />
            <span className={`text-sm font-semibold ${positive ? 'text-green-600' : 'text-red-600'}`}>
                {change}
            </span>
        </div>
    </div>
);

export default DashboardScreen;

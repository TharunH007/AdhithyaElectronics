const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Get dashboard analytics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Parse dates or use defaults (last 7 days)
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        // Get all orders for the period
        const periodOrders = await Order.find({
            createdAt: { $gte: start, $lte: end },
            isPaid: true,
        });

        // Get all orders (total)
        const allOrders = await Order.find({ isPaid: true });

        // Calculate revenue for period
        const periodRevenue = periodOrders.reduce((sum, order) => sum + order.totalPrice, 0);

        // Calculate total revenue
        const totalRevenue = allOrders.reduce((sum, order) => sum + order.totalPrice, 0);

        // Calculate previous period for growth comparison
        const periodLength = end - start;
        const previousStart = new Date(start - periodLength);
        const previousEnd = start;

        const previousPeriodOrders = await Order.find({
            createdAt: { $gte: previousStart, $lt: previousEnd },
            isPaid: true,
        });

        const previousRevenue = previousPeriodOrders.reduce((sum, order) => sum + order.totalPrice, 0);

        // Calculate period growth percentage
        const periodGrowth = previousRevenue === 0
            ? 100
            : ((periodRevenue - previousRevenue) / previousRevenue) * 100;

        // Orders count
        const periodOrdersCount = periodOrders.length;
        const totalOrdersCount = allOrders.length;

        // Average order value
        const avgOrderValue = periodOrdersCount > 0 ? periodRevenue / periodOrdersCount : 0;

        // Conversion rate (orders / users)
        const totalUsers = await User.countDocuments({ isAdmin: false });
        const conversionRate = totalUsers > 0 ? (totalOrdersCount / totalUsers) * 100 : 0;

        // Revenue trends - group by day
        const revenueTrends = {};
        periodOrders.forEach(order => {
            const date = order.createdAt.toISOString().split('T')[0];
            if (!revenueTrends[date]) {
                revenueTrends[date] = 0;
            }
            revenueTrends[date] += order.totalPrice;
        });

        const trendData = Object.keys(revenueTrends).sort().map(date => ({
            date,
            revenue: revenueTrends[date],
        }));

        // Top selling products
        const productSales = {};
        allOrders.forEach(order => {
            order.orderItems.forEach(item => {
                const productId = item.product.toString();
                if (!productSales[productId]) {
                    productSales[productId] = {
                        name: item.name,
                        image: item.image,
                        totalQty: 0,
                        totalRevenue: 0,
                    };
                }
                productSales[productId].totalQty += item.qty;
                productSales[productId].totalRevenue += item.price * item.qty;
            });
        });

        const topProducts = Object.entries(productSales)
            .map(([id, data]) => ({ productId: id, ...data }))
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 5);

        // Top categories by revenue
        const categorySales = {};

        // Get all products with their categories
        const products = await Product.find().populate('category');
        const productCategoryMap = {};
        products.forEach(product => {
            if (product.category) {
                productCategoryMap[product._id.toString()] = product.category.name;
            }
        });

        allOrders.forEach(order => {
            order.orderItems.forEach(item => {
                const categoryName = productCategoryMap[item.product.toString()] || 'Uncategorized';
                if (!categorySales[categoryName]) {
                    categorySales[categoryName] = 0;
                }
                categorySales[categoryName] += item.price * item.qty;
            });
        });

        const topCategories = Object.entries(categorySales)
            .map(([name, revenue]) => ({ name, revenue }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        res.json({
            period: {
                start,
                end,
            },
            metrics: {
                revenue: periodRevenue,
                totalRevenue,
                periodGrowth: parseFloat(periodGrowth.toFixed(2)),
                orders: periodOrdersCount,
                totalOrders: totalOrdersCount,
                avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
                conversionRate: parseFloat(conversionRate.toFixed(2)),
            },
            revenueTrends: trendData,
            topProducts,
            topCategories,
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: 'Error fetching dashboard statistics' });
    }
};

module.exports = {
    getDashboardStats,
};

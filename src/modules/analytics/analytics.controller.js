const { Op, fn, col, literal } = require('sequelize');
const Order = require('../orders/order.model');
const OrderItem = require('../orders/orderItem.model');
const Product = require('../products/product.model');
const Store = require('../stores/store.model');
const User = require('../users/user.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const sequelize = require('../../config/database');

// ==========================================
// تحليلات المتجر (Store Analytics)
// ==========================================

// @desc    ملخص تحليلات المتجر
// @route   GET /api/v1/analytics/store/summary
// @access  Private (Store Owner)
exports.getStoreSummary = asyncHandler(async (req, res, next) => {
    const store = await Store.findOne({ where: { ownerId: req.user.id } });
    if (!store) {
        return next(new ApiError(404, 'لم يتم العثور على متجر لك'));
    }

    // 1. إجمالي المبيعات (الطلبات المكتملة)
    const totalSalesResult = await Order.findOne({
        where: { storeId: store.id, status: 'delivered' },
        attributes: [[fn('SUM', col('total_amount')), 'totalSales']],
        raw: true
    });
    const totalSales = totalSalesResult.totalSales || 0;

    // 2. إجمالي الطلبات المكتملة
    const totalOrders = await Order.count({
        where: { storeId: store.id, status: 'delivered' }
    });

    // 3. عدد العملاء الفريدين
    const uniqueCustomers = await Order.count({
        where: { storeId: store.id },
        distinct: true,
        col: 'user_id'
    });

    // 4. إجمالي المنتجات
    const totalProducts = await Product.count({
        where: { storeId: store.id }
    });

    res.status(200).json(new ApiResponse(200, {
        totalSales,
        totalOrders,
        uniqueCustomers,
        totalProducts
    }, 'تم جلب ملخص المتجر بنجاح'));
});

// @desc    أكثر المنتجات مبيعاً للمتجر
// @route   GET /api/v1/analytics/store/top-products
// @access  Private (Store Owner)
exports.getStoreTopProducts = asyncHandler(async (req, res, next) => {
    const store = await Store.findOne({ where: { ownerId: req.user.id } });
    if (!store) {
        return next(new ApiError(404, 'لم يتم العثور على متجر لك'));
    }

    const topProducts = await OrderItem.findAll({
        attributes: [
            'productId',
            [fn('SUM', col('quantity')), 'totalQuantitySold'],
            [fn('SUM', col('total_price')), 'totalRevenue']
        ],
        include: [
            {
                model: Order,
                as: 'order',
                attributes: [],
                where: { storeId: store.id, status: 'delivered' }
            },
            {
                model: Product,
                as: 'product',
                attributes: ['name', 'images', 'price']
            }
        ],
        group: ['productId', 'product.id'],
        order: [[literal('totalQuantitySold'), 'DESC']],
        limit: 5
    });

    res.status(200).json(new ApiResponse(200, topProducts, 'تم جلب أكثر المنتجات مبيعاً بنجاح'));
});

// ==========================================
// تحليلات المنصة (Admin Analytics)
// ==========================================

// @desc    ملخص تحليلات المنصة
// @route   GET /api/v1/analytics/admin/summary
// @access  Private (Admin)
exports.getAdminSummary = asyncHandler(async (req, res, next) => {
    // 1. إجمالي المبيعات على المنصة
    const totalSalesResult = await Order.findOne({
        where: { status: 'delivered' },
        attributes: [[fn('SUM', col('total_amount')), 'totalSales']],
        raw: true
    });
    const totalSales = totalSalesResult.totalSales || 0;

    // 2. إجمالي الطلبات
    const totalOrders = await Order.count({
        where: { status: 'delivered' }
    });

    // 3. عدد المتاجر النشطة
    const totalStores = await Store.count({
        where: { status: 'active' }
    });

    // 4. عدد المستخدمين (العملاء)
    const totalUsers = await User.count({
        where: { role: 'customer' }
    });

    res.status(200).json(new ApiResponse(200, {
        totalSales,
        totalOrders,
        totalStores,
        totalUsers
    }, 'تم جلب ملخص المنصة بنجاح'));
});

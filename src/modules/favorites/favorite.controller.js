const Favorite = require('./favorite.model');
const Product = require('../products/product.model');
const Store = require('../stores/store.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

// @desc    إضافة أو إزالة منتج من المفضلة (Toggle)
// @route   POST /api/v1/favorites/:productId
// @access  Private (Customer)
exports.toggleFavorite = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;
    const userId = req.user.id;

    const product = await Product.findByPk(productId);
    if (!product) {
        return next(new ApiError(404, 'المنتج غير موجود'));
    }

    const existingFavorite = await Favorite.findOne({
        where: { userId, productId }
    });

    if (existingFavorite) {
        // إزالة من المفضلة
        await existingFavorite.destroy();
        return res.status(200).json(new ApiResponse(200, { isFavorite: false }, 'تمت إزالة المنتج من المفضلة'));
    } else {
        // إضافة للمفضلة
        await Favorite.create({ userId, productId });
        return res.status(201).json(new ApiResponse(201, { isFavorite: true }, 'تمت إضافة المنتج للمفضلة'));
    }
});

// @desc    جلب المنتجات المفضلة للمستخدم
// @route   GET /api/v1/favorites
// @access  Private (Customer)
exports.getMyFavorites = asyncHandler(async (req, res, next) => {
    const favorites = await Favorite.findAll({
        where: { userId: req.user.id },
        include: [
            {
                model: Product,
                as: 'product',
                include: [
                    { model: Store, as: 'store', attributes: ['nameAr', 'nameEn'] }
                ]
            }
        ],
        order: [['createdAt', 'DESC']]
    });

    const products = favorites.map(fav => fav.product);

    res.status(200).json(new ApiResponse(200, products, 'تم جلب المفضلات بنجاح'));
});

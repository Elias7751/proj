const Cart = require('./cart.model');
const CartItem = require('./cartItem.model');
const Product = require('../products/product.model');
const ProductVariant = require('../products/variant.model');
const Store = require('../stores/store.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

// دالة مساعدة لحساب المجموع الفرعي للسلة
const calculateSubTotal = async (cartId) => {
    const items = await CartItem.findAll({ where: { cartId } });
    const subTotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    await Cart.update({ subTotal }, { where: { id: cartId } });
    return subTotal;
};

// @desc    إضافة منتج للسلة
// @route   POST /api/v1/cart
// @access  Private (Customer)
exports.addToCart = asyncHandler(async (req, res, next) => {
    const { productId, variantId, quantity } = req.body;
    const userId = req.user.id;

    const product = await Product.findByPk(productId);
    if (!product) {
        return next(new ApiError(404, 'المنتج غير موجود'));
    }

    let price = parseFloat(product.discountPrice || product.price);
    let stock = product.stock;

    // التحقق من الخصائص المتغيرة إذا تم تمريرها
    if (variantId) {
        const variant = await ProductVariant.findOne({ where: { id: variantId, productId } });
        if (!variant) {
            return next(new ApiError(404, 'الخصائص المحددة غير موجودة لهذا المنتج'));
        }
        price += parseFloat(variant.additionalPrice);
        stock = variant.stock;
    }

    if (stock < quantity) {
        return next(new ApiError(400, 'الكمية المطلوبة غير متوفرة في المخزون'));
    }

    // البحث عن سلة المستخدم الحالية
    let cart = await Cart.findOne({ where: { userId } });

    // إذا كان هناك سلة، يجب التأكد أن المنتج الجديد من نفس المتجر
    if (cart) {
        if (cart.storeId !== product.storeId) {
            return next(new ApiError(400, 'لا يمكن إضافة منتجات من متاجر مختلفة في نفس السلة. يرجى تفريغ السلة أولاً.'));
        }
    } else {
        // إنشاء سلة جديدة
        cart = await Cart.create({ userId, storeId: product.storeId });
    }

    // التحقق مما إذا كان المنتج موجوداً مسبقاً في السلة
    const existingItem = await CartItem.findOne({
        where: { cartId: cart.id, productId, variantId: variantId || null }
    });

    if (existingItem) {
        // تحديث الكمية
        const newQuantity = existingItem.quantity + (quantity || 1);
        if (stock < newQuantity) {
            return next(new ApiError(400, 'الكمية الإجمالية المطلوبة تتجاوز المخزون المتوفر'));
        }
        await existingItem.update({ quantity: newQuantity });
    } else {
        // إضافة منتج جديد للسلة
        await CartItem.create({
            cartId: cart.id,
            productId,
            variantId: variantId || null,
            quantity: quantity || 1,
            price
        });
    }

    await calculateSubTotal(cart.id);

    res.status(200).json(new ApiResponse(200, null, 'تم إضافة المنتج للسلة بنجاح'));
});

// @desc    عرض السلة
// @route   GET /api/v1/cart
// @access  Private (Customer)
exports.getCart = asyncHandler(async (req, res, next) => {
    const cart = await Cart.findOne({
        where: { userId: req.user.id },
        include: [
            { model: Store, as: 'store', attributes: ['nameAr', 'nameEn', 'slug'] },
            {
                model: CartItem,
                as: 'items',
                include: [
                    { model: Product, as: 'product', attributes: ['name', 'images'] },
                    { model: ProductVariant, as: 'variant', attributes: ['attributeName', 'attributeValue'] }
                ]
            }
        ]
    });

    if (!cart) {
        return res.status(200).json(new ApiResponse(200, { items: [], subTotal: 0 }, 'السلة فارغة'));
    }

    res.status(200).json(new ApiResponse(200, cart, 'تم جلب السلة بنجاح'));
});

// @desc    تفريغ السلة
// @route   DELETE /api/v1/cart
// @access  Private (Customer)
exports.clearCart = asyncHandler(async (req, res, next) => {
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (cart) {
        await cart.destroy(); // هذا سيحذف الـ CartItems أيضاً بسبب onDelete: 'CASCADE'
    }
    res.status(200).json(new ApiResponse(200, null, 'تم تفريغ السلة بنجاح'));
});

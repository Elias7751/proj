const Order = require('./order.model');
const OrderItem = require('./orderItem.model');
const Cart = require('./cart.model');
const CartItem = require('./cartItem.model');
const Product = require('../products/product.model');
const ProductVariant = require('../products/variant.model');
const Store = require('../stores/store.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

// @desc    إنشاء طلب جديد من السلة
// @route   POST /api/v1/orders
// @access  Private (Customer)
exports.createOrder = asyncHandler(async (req, res, next) => {
    const { deliveryAddress, paymentMethod, notes } = req.body;
    const userId = req.user.id;

    // جلب السلة
    const cart = await Cart.findOne({
        where: { userId },
        include: [
            {
                model: CartItem,
                as: 'items',
                include: [
                    { model: Product, as: 'product' },
                    { model: ProductVariant, as: 'variant' }
                ]
            }
        ]
    });

    if (!cart || !cart.items || cart.items.length === 0) {
        return next(new ApiError(400, 'السلة فارغة'));
    }

    // جلب المتجر لمعرفة رسوم التوصيل والحد الأدنى للطلب
    const store = await Store.findByPk(cart.storeId);

    const minOrderAmount = store.minOrderAmount ? parseFloat(store.minOrderAmount) : 0;
    if (parseFloat(cart.subTotal) < minOrderAmount) {
        return next(new ApiError(400, `الحد الأدنى للطلب من هذا المتجر هو ${minOrderAmount}`));
    }

    // حساب المجموع (مؤقتاً رسوم التوصيل 0 حتى نربطها بالمنطقة)
    const deliveryFee = 0.00; // يمكن تعديلها لاحقاً لجلبها من Area
    const totalAmount = parseFloat(cart.subTotal) + deliveryFee;

    // توليد رقم طلب فريد
    const orderNumber = `ORD-${Math.floor(Math.random() * 1000000000)}`;

    // إنشاء الطلب
    const order = await Order.create({
        orderNumber,
        userId,
        storeId: cart.storeId,
        subTotal: cart.subTotal,
        deliveryFee,
        totalAmount,
        deliveryAddress,
        paymentMethod: paymentMethod || 'cash_on_delivery',
        notes
    });

    // نقل المنتجات من السلة إلى الطلب
    const orderItemsData = cart.items.map(item => {
        let variantDetails = null;
        if (item.variant) {
            variantDetails = {
                attributeName: item.variant.attributeName,
                attributeValue: item.variant.attributeValue
            };
        }

        return {
            orderId: order.id,
            productId: item.productId,
            productName: item.product.name,
            variantDetails,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: parseFloat(item.price) * item.quantity
        };
    });

    await OrderItem.bulkCreate(orderItemsData);

    // تفريغ السلة بعد إتمام الطلب
    await cart.destroy();

    // توليد رابط واتساب
    const WhatsAppService = require('../../utils/whatsapp');
    const message = WhatsAppService.generateOrderMessage(order, store, req.user, orderItemsData);
    const whatsappLink = WhatsAppService.generateWhatsAppLink(store.whatsappNumber, message);

    // تحديث حالة الطلب إلى pending_whatsapp
    await order.update({ status: 'pending' }); // يمكن إضافة حالة pending_whatsapp لاحقاً

    // إرسال إشعار لصاحب المتجر
    const Notification = require('../notifications/notification.model');
    await Notification.create({
        userId: store.ownerId,
        title: 'طلب جديد',
        message: `لقد تلقيت طلباً جديداً برقم #${order.orderNumber} بقيمة ${order.totalAmount} ريال`,
        type: 'order',
        link: `/orders/${order.id}`
    });

    res.status(201).json(new ApiResponse(201, { order, whatsappLink }, 'تم إنشاء الطلب بنجاح'));
});

// @desc    إنشاء طلب تواصل (Lead) مباشر من صفحة المنتج
// @route   POST /api/v1/orders/lead
// @access  Private (Customer)
exports.createLead = asyncHandler(async (req, res, next) => {
    const { productId, quantity, variantDetails } = req.body;
    const userId = req.user.id;

    const product = await Product.findByPk(productId, {
        include: [{ model: Store, as: 'store' }]
    });

    if (!product) {
        return next(new ApiError(404, 'المنتج غير موجود'));
    }

    const store = product.store;
    if (!store) {
        return next(new ApiError(404, 'المتجر غير موجود'));
    }

    // حساب السعر
    let unitPrice = parseFloat(product.discountPrice || product.price);
    let additionalPrice = 0;

    if (variantDetails && variantDetails.attributeName && variantDetails.attributeValue) {
        const variant = await ProductVariant.findOne({
            where: {
                productId,
                attributeName: variantDetails.attributeName,
                attributeValue: variantDetails.attributeValue
            }
        });
        if (variant) {
            additionalPrice = parseFloat(variant.additionalPrice || 0);
        }
    }

    unitPrice += additionalPrice;
    const totalPrice = unitPrice * (quantity || 1);

    // توليد رقم طلب فريد
    const orderNumber = `LEAD-${Math.floor(Math.random() * 1000000000)}`;

    // إنشاء الطلب (Lead)
    const order = await Order.create({
        orderNumber,
        userId,
        storeId: store.id,
        subTotal: totalPrice,
        deliveryFee: 0,
        totalAmount: totalPrice,
        deliveryAddress: {}, // غير مطلوب في الـ Lead
        paymentMethod: 'cash_on_delivery',
        status: 'new'
    });

    // إضافة المنتج للطلب
    await OrderItem.create({
        orderId: order.id,
        productId: product.id,
        productName: product.name,
        variantDetails,
        quantity: quantity || 1,
        unitPrice,
        totalPrice
    });

    // إرسال إشعار للتاجر
    const Notification = require('../notifications/notification.model');
    await Notification.create({
        userId: store.ownerId,
        title: 'طلب تواصل جديد',
        message: `هناك عميل مهتم بالمنتج ${product.name} (رقم الطلب #${order.orderNumber})`,
        type: 'order',
        link: `/orders/${order.id}`
    });

    res.status(201).json(new ApiResponse(201, { order }, 'تم تسجيل طلب التواصل بنجاح'));
});

// @desc    جلب طلبات العميل
// @route   GET /api/v1/orders/my
// @access  Private (Customer)
exports.getMyOrders = asyncHandler(async (req, res, next) => {
    const orders = await Order.findAll({
        where: { userId: req.user.id },
        order: [['created_at', 'DESC']],
        include: [
            { model: Store, as: 'store', attributes: ['nameAr', 'nameEn', 'whatsappNumber'] },
            { model: OrderItem, as: 'items' }
        ]
    });

    res.status(200).json(new ApiResponse(200, orders, 'تم جلب الطلبات بنجاح'));
});

// @desc    جلب تفاصيل طلب معين
// @route   GET /api/v1/orders/:id
// @access  Private
exports.getOrderById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
        include: [
            { model: Store, as: 'store', attributes: ['nameAr', 'nameEn', 'whatsappNumber', 'ownerId'] },
            { model: require('../users/user.model'), as: 'user', attributes: ['fullName', 'phone'] },
            { model: OrderItem, as: 'items' },
            { model: require('../reviews/review.model'), as: 'reviews' }
        ]
    });

    if (!order) {
        return next(new ApiError(404, 'الطلب غير موجود'));
    }

    // التحقق من الصلاحية (العميل صاحب الطلب أو التاجر صاحب المتجر)
    if (order.userId !== req.user.id && order.store.ownerId !== req.user.id && req.user.role !== 'admin') {
        return next(new ApiError(403, 'غير مصرح لك بعرض هذا الطلب'));
    }

    res.status(200).json(new ApiResponse(200, order, 'تم جلب تفاصيل الطلب بنجاح'));
});

// @desc    تحديث حالة الطلب
// @route   PUT /api/v1/orders/:id/status
// @access  Private (Store Owner)
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(id, {
        include: [
            { model: Store, as: 'store' },
            { model: OrderItem, as: 'items' }
        ]
    });

    if (!order) {
        return next(new ApiError(404, 'الطلب غير موجود'));
    }

    // التحقق من الصلاحية
    if (order.store.ownerId !== req.user.id && req.user.role !== 'admin') {
        return next(new ApiError(403, 'غير مصرح لك بتحديث حالة هذا الطلب'));
    }

    const oldStatus = order.status;
    await order.update({ status });

    // إذا تم تغيير الحالة إلى "تم التوصيل" (delivered) ولم تكن كذلك من قبل
    if (status === 'delivered' && oldStatus !== 'delivered') {
        const Product = require('../products/product.model');
        const ProductVariant = require('../products/variant.model');

        for (const item of order.items) {
            // 1. زيادة المبيعات
            await Product.increment('salesCount', {
                by: item.quantity,
                where: { id: item.productId }
            });

            // 2. نقص المخزون الأساسي للمنتج
            await Product.decrement('stock', {
                by: item.quantity,
                where: { id: item.productId }
            });

            // 3. نقص مخزون الخاصية (Variant) إن وجدت
            if (item.variantDetails) {
                let details = item.variantDetails;
                if (typeof details === 'string') {
                    try { details = JSON.parse(details); } catch (e) { details = null; }
                }

                if (details && details.attributeName && details.attributeValue) {
                    const variant = await ProductVariant.findOne({
                        where: {
                            productId: item.productId,
                            attributeName: details.attributeName,
                            attributeValue: details.attributeValue
                        }
                    });
                    if (variant) {
                        await variant.decrement('stock', { by: item.quantity });
                    }
                }
            }
        }
    }

    res.status(200).json(new ApiResponse(200, order, 'تم تحديث حالة الطلب بنجاح'));
});

// @desc    الحصول على رابط واتساب لطلب
// @route   GET /api/v1/orders/:id/whatsapp-link
// @access  Private (Customer)
exports.getWhatsAppLink = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
        include: [
            { model: Store, as: 'store' },
            { model: OrderItem, as: 'items' }
        ]
    });

    if (!order) {
        return next(new ApiError(404, 'الطلب غير موجود'));
    }

    if (order.userId !== req.user.id) {
        return next(new ApiError(403, 'غير مصرح لك'));
    }

    const WhatsAppService = require('../../utils/whatsapp');
    const message = WhatsAppService.generateOrderMessage(order, order.store, req.user, order.items);
    const whatsappLink = WhatsAppService.generateWhatsAppLink(order.store.whatsappNumber, message);

    res.status(200).json(new ApiResponse(200, { whatsappLink }, 'تم توليد الرابط بنجاح'));
});

// @desc    جلب طلبات المتجر الخاص بالتاجر المسجل
// @route   GET /api/v1/orders/store
// @access  Private (Store Owner)
exports.getStoreOrders = asyncHandler(async (req, res, next) => {
    const store = await Store.findOne({ where: { ownerId: req.user.id } });
    if (!store) {
        return next(new ApiError(404, 'لم يتم العثور على متجر مرتبط بحسابك'));
    }

    const orders = await Order.findAll({
        where: { storeId: store.id },
        order: [['created_at', 'DESC']],
        include: [
            { model: require('../users/user.model'), as: 'user', attributes: ['fullName', 'phone'] }
        ]
    });

    res.status(200).json(new ApiResponse(200, orders, 'تم جلب طلبات المتجر بنجاح'));
});

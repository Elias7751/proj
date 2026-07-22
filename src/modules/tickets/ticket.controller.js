const { Ticket, TicketMessage } = require('./ticket.model');
const User = require('../users/user.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

// @desc    إنشاء تذكرة جديدة
// @route   POST /api/v1/tickets
// @access  Private
exports.createTicket = asyncHandler(async (req, res, next) => {
    const { subject, message, priority } = req.body;

    if (!subject || !message) {
        return next(new ApiError(400, 'يرجى توفير عنوان ورسالة للتذكرة'));
    }

    const ticket = await Ticket.create({
        userId: req.user.id,
        subject,
        priority: priority || 'medium'
    });

    await TicketMessage.create({
        ticketId: ticket.id,
        senderId: req.user.id,
        message,
        isAdmin: req.user.role === 'admin'
    });

    res.status(201).json(new ApiResponse(201, ticket, 'تم إنشاء التذكرة بنجاح'));
});

// @desc    جلب تذاكر المستخدم الحالي
// @route   GET /api/v1/tickets/my
// @access  Private
exports.getMyTickets = asyncHandler(async (req, res, next) => {
    const tickets = await Ticket.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']],
        include: [{
            model: TicketMessage,
            as: 'messages',
            limit: 1,
            order: [['createdAt', 'DESC']]
        }]
    });

    res.status(200).json(new ApiResponse(200, tickets, 'تم جلب التذاكر بنجاح'));
});

// @desc    جلب جميع التذاكر (للإدارة)
// @route   GET /api/v1/tickets
// @access  Private/Admin
exports.getAllTickets = asyncHandler(async (req, res, next) => {
    const { status } = req.query;
    const whereClause = {};
    if (status) whereClause.status = status;

    const tickets = await Ticket.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'fullName', 'email', 'phone', 'role']
        }]
    });

    res.status(200).json(new ApiResponse(200, tickets, 'تم جلب جميع التذاكر بنجاح'));
});

// @desc    جلب تفاصيل تذكرة معينة مع الرسائل
// @route   GET /api/v1/tickets/:id
// @access  Private
exports.getTicketById = asyncHandler(async (req, res, next) => {
    const ticket = await Ticket.findByPk(req.params.id, {
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'fullName', 'role']
            },
            {
                model: TicketMessage,
                as: 'messages',
                include: [{
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'fullName', 'role']
                }],
                order: [['createdAt', 'ASC']]
            }
        ]
    });

    if (!ticket) {
        return next(new ApiError(404, 'التذكرة غير موجودة'));
    }

    // التحقق من الصلاحية
    if (ticket.userId !== req.user.id && req.user.role !== 'admin') {
        return next(new ApiError(403, 'غير مصرح لك بعرض هذه التذكرة'));
    }

    res.status(200).json(new ApiResponse(200, ticket, 'تم جلب تفاصيل التذكرة بنجاح'));
});

// @desc    إضافة رد على تذكرة
// @route   POST /api/v1/tickets/:id/messages
// @access  Private
exports.replyToTicket = asyncHandler(async (req, res, next) => {
    const { message } = req.body;

    if (!message) {
        return next(new ApiError(400, 'يرجى كتابة نص الرسالة'));
    }

    const ticket = await Ticket.findByPk(req.params.id);

    if (!ticket) {
        return next(new ApiError(404, 'التذكرة غير موجودة'));
    }

    if (ticket.userId !== req.user.id && req.user.role !== 'admin') {
        return next(new ApiError(403, 'غير مصرح لك بالرد على هذه التذكرة'));
    }

    const ticketMessage = await TicketMessage.create({
        ticketId: ticket.id,
        senderId: req.user.id,
        message,
        isAdmin: req.user.role === 'admin'
    });

    // تحديث حالة التذكرة إذا كان الرد من الإدارة
    if (req.user.role === 'admin' && ticket.status === 'open') {
        await ticket.update({ status: 'in_progress' });
    }

    res.status(201).json(new ApiResponse(201, ticketMessage, 'تمت إضافة الرد بنجاح'));
});

// @desc    تحديث حالة التذكرة (للإدارة)
// @route   PUT /api/v1/tickets/:id/status
// @access  Private/Admin
exports.updateTicketStatus = asyncHandler(async (req, res, next) => {
    const { status } = req.body;

    if (!status) {
        return next(new ApiError(400, 'يرجى تحديد الحالة الجديدة'));
    }

    const ticket = await Ticket.findByPk(req.params.id);

    if (!ticket) {
        return next(new ApiError(404, 'التذكرة غير موجودة'));
    }

    await ticket.update({ status });

    res.status(200).json(new ApiResponse(200, ticket, 'تم تحديث حالة التذكرة بنجاح'));
});

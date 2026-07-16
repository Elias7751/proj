const { Ticket, TicketReply } = require('./ticket.model');
const FAQ = require('./faq.model');
const User = require('../users/user.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

// ==========================================
// التذاكر (Tickets)
// ==========================================

// @desc    إنشاء تذكرة دعم
// @route   POST /api/v1/support/tickets
// @access  Private
exports.createTicket = asyncHandler(async (req, res, next) => {
    const { title, description, priority } = req.body;

    const ticket = await Ticket.create({
        userId: req.user.id,
        title,
        description,
        priority
    });

    res.status(201).json(new ApiResponse(201, ticket, 'تم إنشاء التذكرة بنجاح'));
});

// @desc    جلب تذاكري
// @route   GET /api/v1/support/tickets
// @access  Private
exports.getMyTickets = asyncHandler(async (req, res, next) => {
    const tickets = await Ticket.findAll({
        where: { userId: req.user.id },
        order: [['created_at', 'DESC']]
    });

    res.status(200).json(new ApiResponse(200, tickets, 'تم جلب التذاكر بنجاح'));
});

// @desc    جلب تفاصيل التذكرة مع الردود
// @route   GET /api/v1/support/tickets/:id
// @access  Private
exports.getTicketDetails = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const ticket = await Ticket.findOne({
        where: { id },
        include: [
            {
                model: TicketReply,
                as: 'replies',
                include: [{ model: User, as: 'user', attributes: ['fullName', 'role'] }]
            }
        ],
        order: [[{ model: TicketReply, as: 'replies' }, 'created_at', 'ASC']]
    });

    if (!ticket) {
        return next(new ApiError(404, 'التذكرة غير موجودة'));
    }

    // التحقق من الصلاحية (صاحب التذكرة أو أدمن)
    if (ticket.userId !== req.user.id && req.user.role !== 'admin') {
        return next(new ApiError(403, 'غير مصرح لك بعرض هذه التذكرة'));
    }

    res.status(200).json(new ApiResponse(200, ticket, 'تم جلب تفاصيل التذكرة بنجاح'));
});

// @desc    إضافة رد على التذكرة
// @route   POST /api/v1/support/tickets/:id/reply
// @access  Private
exports.replyToTicket = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { message } = req.body;

    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
        return next(new ApiError(404, 'التذكرة غير موجودة'));
    }

    if (ticket.userId !== req.user.id && req.user.role !== 'admin') {
        return next(new ApiError(403, 'غير مصرح لك بالرد على هذه التذكرة'));
    }

    const reply = await TicketReply.create({
        ticketId: id,
        userId: req.user.id,
        message
    });

    // تحديث حالة التذكرة إذا كان الرد من الأدمن
    if (req.user.role === 'admin' && ticket.status === 'open') {
        await ticket.update({ status: 'in_progress' });
    }

    res.status(201).json(new ApiResponse(201, reply, 'تم إضافة الرد بنجاح'));
});

// ==========================================
// الأسئلة الشائعة (FAQ)
// ==========================================

// @desc    جلب الأسئلة الشائعة
// @route   GET /api/v1/faq
// @access  Public
exports.getFAQs = asyncHandler(async (req, res, next) => {
    const faqs = await FAQ.findAll({ where: { isActive: true } });
    res.status(200).json(new ApiResponse(200, faqs, 'تم جلب الأسئلة الشائعة بنجاح'));
});

// @desc    إضافة سؤال شائع
// @route   POST /api/v1/faq
// @access  Private (Admin)
exports.createFAQ = asyncHandler(async (req, res, next) => {
    const faq = await FAQ.create(req.body);
    res.status(201).json(new ApiResponse(201, faq, 'تم إضافة السؤال بنجاح'));
});

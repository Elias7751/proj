const fs = require('fs');
const code = `
// @desc    جلب جميع التذاكر (للإدارة)
// @route   GET /api/v1/support/tickets/all
// @access  Private (Admin)
exports.getAllTickets = asyncHandler(async (req, res, next) => {
    const tickets = await Ticket.findAll({
        include: [{ model: User, as: 'user', attributes: ['fullName', 'email', 'phone', 'role'] }],
        order: [['created_at', 'DESC']]
    });

    res.status(200).json(new ApiResponse(200, tickets, 'تم جلب جميع التذاكر بنجاح'));
});

// @desc    تحديث حالة التذكرة
// @route   PUT /api/v1/support/tickets/:id/status
// @access  Private (Admin)
exports.updateTicketStatus = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
        return next(new ApiError(404, 'التذكرة غير موجودة'));
    }

    await ticket.update({ status });

    res.status(200).json(new ApiResponse(200, ticket, 'تم تحديث حالة التذكرة بنجاح'));
});
`;
fs.appendFileSync('src/modules/support/support.controller.js', code);
console.log('Appended successfully');

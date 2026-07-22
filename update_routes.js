const fs = require('fs');
let code = fs.readFileSync('src/modules/support/support.routes.js', 'utf8');

code = code.replace(
    'createFAQ\n} = require(',
    'createFAQ,\n    getAllTickets,\n    updateTicketStatus\n} = require('
);

code = code.replace(
    "router.route('/tickets')\n    .post(protect, createTicket)\n    .get(protect, getMyTickets);",
    "router.route('/tickets')\n    .post(protect, createTicket)\n    .get(protect, getMyTickets);\n\nrouter.route('/tickets/all')\n    .get(protect, authorize('admin'), getAllTickets);\n\nrouter.route('/tickets/:id/status')\n    .put(protect, authorize('admin'), updateTicketStatus);"
);

fs.writeFileSync('src/modules/support/support.routes.js', code);
console.log('Updated routes');

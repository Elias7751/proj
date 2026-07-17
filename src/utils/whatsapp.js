/**
 * خدمة توليد روابط ورسائل واتساب
 */

class WhatsAppService {
    /**
     * تنسيق رقم الهاتف ليناسب واتساب (إضافة كود اليمن إذا لم يكن موجوداً)
     * @param {string} phone 
     * @returns {string}
     */
    static formatPhoneNumber(phone) {
        if (!phone) return '';

        // إزالة أي مسافات أو رموز
        let cleaned = phone.replace(/\D/g, '');

        // إذا كان يبدأ بـ 0، نحذفه
        if (cleaned.startsWith('0')) {
            cleaned = cleaned.substring(1);
        }

        // إذا لم يكن يبدأ بـ 967، نضيفه
        if (!cleaned.startsWith('967')) {
            cleaned = `967${cleaned}`;
        }

        return cleaned;
    }

    /**
     * توليد رسالة الطلب المنسقة
     * @param {Object} order - كائن الطلب
     * @param {Object} store - كائن المتجر
     * @param {Object} user - كائن العميل
     * @param {Array} items - مصفوفة المنتجات
     * @returns {string}
     */
    static generateOrderMessage(order, store, user, items) {
        const date = new Date(order.createdAt).toLocaleString('ar-YE', {
            timeZone: 'Asia/Aden',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });

        let message = `🛒 *طلب جديد #${order.orderNumber}*\n`;
        message += `━━━━━━━━━━━━━━━━━━━\n\n`;

        message += `📦 *المنتجات:*\n`;
        items.forEach((item, index) => {
            let variantText = '';
            if (item.variantDetails) {
                const details = typeof item.variantDetails === 'string' ? JSON.parse(item.variantDetails) : item.variantDetails;
                variantText = ` (${details.attributeValue})`;
            }
            message += `${index + 1}. ${item.productName}${variantText} × ${item.quantity} — ${item.totalPrice} ر.ي\n`;
        });

        message += `\n━━━━━━━━━━━━━━━━━━━\n`;
        message += `💰 المجموع الفرعي: ${order.subTotal} ر.ي\n`;

        if (parseFloat(order.deliveryFee) > 0) {
            message += `🚚 رسوم التوصيل: ${order.deliveryFee} ر.ي\n`;
        }

        if (parseFloat(order.discount) > 0) {
            message += `🎫 الخصم: -${order.discount} ر.ي\n`;
        }

        message += `━━━━━━━━━━━━━━━━━━━\n`;
        message += `💵 *المجموع الكلي: ${order.totalAmount} ر.ي*\n\n`;

        message += `📍 *عنوان التوصيل:*\n`;
        const address = typeof order.deliveryAddress === 'string' ? JSON.parse(order.deliveryAddress) : order.deliveryAddress;
        message += `${address.city || ''} - ${address.area || ''} - ${address.street || ''}\n`;
        if (address.details) {
            message += `${address.details}\n`;
        }
        if (address.googleMapsLink) {
            message += `🗺️ رابط الموقع: ${address.googleMapsLink}\n`;
        }
        message += `\n`;

        message += `👤 *بيانات العميل:*\n`;
        message += `الاسم: ${user.fullName}\n`;
        message += `الهاتف: ${user.phone}\n\n`;

        if (order.notes) {
            message += `📝 *ملاحظات:*\n`;
            message += `${order.notes}\n\n`;
        }

        message += `🕐 وقت الطلب: ${date}`;

        return message;
    }

    /**
     * توليد رابط واتساب
     * @param {string} phone - رقم هاتف المتجر
     * @param {string} message - الرسالة المنسقة
     * @returns {string}
     */
    static generateWhatsAppLink(phone, message) {
        const formattedPhone = this.formatPhoneNumber(phone);
        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    }
}

module.exports = WhatsAppService;

const { transporter, isConfigured } = require('../config/nodemailer');
require('dotenv').config();

const SENDER_EMAIL = process.env.GMAIL_USER || 'no-reply@rigamart.com';
const SENDER_NAME = 'Rigamart India';

/**
 * Responsive Base HTML Email Shell with Rigamart Brand Header and Footer
 */
const buildEmailTemplate = (contentHtml, headerTitle = 'Rigamart Notification') => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headerTitle}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
      color: #1f2937;
      line-height: 1.5;
    }
    .wrapper {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .header {
      background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
      padding: 24px;
      text-align: center;
      color: #ffffff;
    }
    .logo {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 1px;
      margin: 0;
    }
    .tagline {
      font-size: 12px;
      opacity: 0.9;
      margin-top: 4px;
    }
    .content {
      padding: 32px 24px;
    }
    .footer {
      background-color: #f9fafb;
      padding: 20px 24px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    .btn {
      display: inline-block;
      padding: 12px 28px;
      background-color: #1d4ed8;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
      margin: 20px 0;
      text-align: center;
    }
    .item-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .item-table th {
      background-color: #f9fafb;
      padding: 10px 12px;
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
      color: #4b5563;
      border-bottom: 2px solid #e5e7eb;
    }
    .item-table td {
      padding: 12px;
      border-bottom: 1px solid #f3f4f6;
      font-size: 14px;
    }
    .summary-table {
      width: 100%;
      margin-top: 10px;
    }
    .summary-table td {
      padding: 6px 12px;
      font-size: 14px;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-success { background-color: #d1fae5; color: #065f46; }
    .badge-info { background-color: #dbeafe; color: #1e40af; }
    .badge-warning { background-color: #fef3c7; color: #92400e; }
    .badge-danger { background-color: #fee2e2; color: #991b1b; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1 class="logo">RIGAMART</h1>
      <div class="tagline">India's Premier Multi-Vendor E-Commerce Platform</div>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p style="margin: 0 0 8px 0;">Need help with your order? Contact <a href="mailto:support@rigamart.com" style="color: #1d4ed8; text-decoration: none;">support@rigamart.com</a></p>
      <p style="margin: 0;">&copy; ${new Date().getFullYear()} Rigamart Online Services Pvt Ltd. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
};

/**
 * Generic Mail Sender Helper
 */
const sendMail = async ({ to, subject, html, text }) => {
  if (!isConfigured) {
    console.log(`[EMAIL FALLBACK] Mock email would be sent to: ${to}`);
    console.log(`[EMAIL FALLBACK] Subject: ${subject}`);
    return { success: true, messageId: 'console_fallback' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
      to,
      subject,
      text: text || subject,
      html
    });

    console.log(`📧 [EMAIL SENT] MessageId: ${info.messageId} | Recipient: ${to} | Subject: "${subject}"`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ [EMAIL ERROR] Failed to send email to ${to}:`, error.message);
    // Return error without throwing to keep parent transaction non-blocking
    return { success: false, error: error.message };
  }
};

/**
 * 1. Send Order Confirmation Email (Online or COD)
 */
const sendOrderConfirmationEmail = async (order, recipientEmail) => {
  const targetEmail = recipientEmail || (order.user && order.user.email);
  if (!targetEmail) return null;

  const addr = order.shippingAddress || {};
  const itemsHtml = (order.items || [])
    .map(
      (item) => `
      <tr>
        <td style="font-weight: 600;">${item.name}</td>
        <td style="color: #6b7280;">${item.size || 'Standard'} | ${item.color || 'Standard'}</td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: right; font-weight: 600;">Rs. ${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  const content = `
    <h2 style="color: #111827; margin-top: 0;">Order Confirmed! 🎉</h2>
    <p>Hi <strong>${addr.name || 'Shopper'}</strong>,</p>
    <p>Thank you for shopping on Rigamart. We have received your order <strong>#${order.orderNumber}</strong> and our sellers are preparing it for shipment.</p>
    
    <div style="background-color: #f9fafb; border-radius: 6px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0 0 6px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p style="margin: 0 0 6px 0;"><strong>Payment Method:</strong> ${order.paymentInfo?.method} (${order.paymentInfo?.status})</p>
      <p style="margin: 0;"><strong>Delivery To:</strong> ${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}</p>
    </div>

    <table class="item-table">
      <thead>
        <tr>
          <th>Item</th>
          <th>Variant</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <table class="summary-table">
      <tr>
        <td style="text-align: right; color: #4b5563;">Items Subtotal:</td>
        <td style="text-align: right; width: 120px; font-weight: 600;">Rs. ${Number(order.itemsPrice).toFixed(2)}</td>
      </tr>
      <tr>
        <td style="text-align: right; color: #4b5563;">Shipping Fee:</td>
        <td style="text-align: right; width: 120px; font-weight: 600;">${order.shippingPrice === 0 ? 'FREE' : 'Rs. ' + Number(order.shippingPrice).toFixed(2)}</td>
      </tr>
      <tr>
        <td style="text-align: right; font-size: 16px; font-weight: 700; color: #1d4ed8; padding-top: 10px;">Total Amount:</td>
        <td style="text-align: right; width: 120px; font-size: 16px; font-weight: 700; color: #1d4ed8; padding-top: 10px;">Rs. ${Number(order.totalAmount).toFixed(2)}</td>
      </tr>
    </table>

    <div style="text-align: center; margin-top: 30px;">
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/orders/${order._id}" class="btn">View Order Details</a>
    </div>
  `;

  const html = buildEmailTemplate(content, `Order Confirmed: #${order.orderNumber}`);
  return await sendMail({
    to: targetEmail,
    subject: `Order Confirmed: #${order.orderNumber} - Rigamart`,
    html
  });
};

/**
 * 2. Send Order Shipped Notification Email
 */
const sendOrderShippedEmail = async (order, recipientEmail, trackingInfo = {}) => {
  const targetEmail = recipientEmail || (order.user && order.user.email);
  if (!targetEmail) return null;

  const addr = order.shippingAddress || {};
  const courier = trackingInfo.courier || 'Express Logistics';
  const trackingNumber = trackingInfo.trackingNumber || `AWB-${order.orderNumber.slice(-8)}`;

  const content = `
    <h2 style="color: #111827; margin-top: 0;">Your Order is On Its Way! 🚚</h2>
    <p>Hi <strong>${addr.name || 'Shopper'}</strong>,</p>
    <p>Great news! Your package for order <strong>#${order.orderNumber}</strong> has been handed over to our courier partner and is en route to your address.</p>
    
    <div style="background-color: #eff6ff; border-left: 4px solid #1d4ed8; padding: 16px; margin: 20px 0; border-radius: 0 6px 6px 0;">
      <p style="margin: 0 0 8px 0;"><strong>Courier Partner:</strong> ${courier}</p>
      <p style="margin: 0 0 8px 0;"><strong>Tracking / AWB Number:</strong> <span style="font-family: monospace; font-size: 15px; font-weight: 700;">${trackingNumber}</span></p>
      <p style="margin: 0;"><strong>Destination:</strong> ${addr.city}, ${addr.state} - ${addr.pincode}</p>
    </div>

    <p style="font-size: 14px; color: #4b5563;">You will receive an SMS and WhatsApp update with the delivery agent's contact on the morning of delivery.</p>

    <div style="text-align: center; margin-top: 30px;">
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/orders/${order._id}" class="btn">Track Order Live</a>
    </div>
  `;

  const html = buildEmailTemplate(content, `Order Shipped: #${order.orderNumber}`);
  return await sendMail({
    to: targetEmail,
    subject: `Shipped! Order #${order.orderNumber} is on its way - Rigamart`,
    html
  });
};

/**
 * 3. Send Order Delivered Notification Email
 */
const sendOrderDeliveredEmail = async (order, recipientEmail) => {
  const targetEmail = recipientEmail || (order.user && order.user.email);
  if (!targetEmail) return null;

  const addr = order.shippingAddress || {};

  const content = `
    <h2 style="color: #065f46; margin-top: 0;">Package Delivered! 🎁</h2>
    <p>Hi <strong>${addr.name || 'Shopper'}</strong>,</p>
    <p>Your order <strong>#${order.orderNumber}</strong> was successfully delivered today.</p>
    
    <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0; color: #065f46; font-weight: 600;">
        🛡️ Returns Eligible: You can request a hassle-free return or replacement within 7 days from today.
      </p>
    </div>

    <p>We hope you love your purchase! Share your thoughts and photos with other buyers to earn Rigamart Coins.</p>

    <div style="text-align: center; margin-top: 30px;">
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/orders/${order._id}" class="btn">Write a Review</a>
    </div>
  `;

  const html = buildEmailTemplate(content, `Order Delivered: #${order.orderNumber}`);
  return await sendMail({
    to: targetEmail,
    subject: `Delivered: Order #${order.orderNumber} - Rigamart`,
    html
  });
};

/**
 * 4. Send Order Cancelled Email
 */
const sendOrderCancelledEmail = async (order, recipientEmail, reason = 'Cancelled per customer request') => {
  const targetEmail = recipientEmail || (order.user && order.user.email);
  if (!targetEmail) return null;

  const addr = order.shippingAddress || {};
  const isOnlinePayment = order.paymentInfo?.method === 'RAZORPAY';

  const content = `
    <h2 style="color: #991b1b; margin-top: 0;">Order Cancelled</h2>
    <p>Hi <strong>${addr.name || 'Shopper'}</strong>,</p>
    <p>Your order <strong>#${order.orderNumber}</strong> has been cancelled.</p>
    
    <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0; border-radius: 0 6px 6px 0;">
      <p style="margin: 0 0 8px 0;"><strong>Reason:</strong> ${reason}</p>
      <p style="margin: 0;"><strong>Refund Status:</strong> ${
        isOnlinePayment
          ? 'Refund initiated. Amount (Rs. ' + order.totalAmount.toFixed(2) + ') will reflect in your source account within 5-7 business days.'
          : 'Cash on Delivery: No amount was deducted.'
      }</p>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" class="btn" style="background-color: #4b5563;">Continue Shopping</a>
    </div>
  `;

  const html = buildEmailTemplate(content, `Order Cancelled: #${order.orderNumber}`);
  return await sendMail({
    to: targetEmail,
    subject: `Cancelled: Order #${order.orderNumber} - Rigamart`,
    html
  });
};

module.exports = {
  sendMail,
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  sendOrderCancelledEmail
};

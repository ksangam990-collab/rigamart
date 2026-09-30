const PDFDocument = require('pdfkit');

/**
 * Generate a professional tax invoice PDF and pipe to a writable stream (like Express res)
 * @param {object} order - Mongoose Order document
 * @param {object} writableStream - Express res or file write stream
 */
const generateInvoicePdf = (order, writableStream) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });

      doc.on('error', (err) => reject(err));
      writableStream.on('finish', () => resolve());

      doc.pipe(writableStream);

      // --- Header Section ---
      doc
        .fillColor('#1d4ed8')
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('RIGAMART', 50, 45)
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#6b7280')
        .text('Multi-Vendor E-Commerce Platform | Bill of Supply', 50, 72)
        .text('GSTIN: [REGISTERED-ON-DEPLOYMENT] | Tax Invoice', 50, 84);

      const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      };

      doc
        .fillColor('#111827')
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('TAX INVOICE', 400, 45, { align: 'right' })
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#4b5563')
        .text(`Invoice No: INV-${order.orderNumber}`, 400, 65, { align: 'right' })
        .text(`Order Date: ${formatDate(order.createdAt)}`, 400, 77, { align: 'right' })
        .text(`Status: ${order.status.toUpperCase()}`, 400, 89, { align: 'right' });

      // Horizontal Divider
      doc.moveTo(50, 110).lineTo(550, 110).strokeColor('#e5e7eb').lineWidth(1).stroke();

      // --- Billing & Shipping Details ---
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#111827')
        .text('Billed & Shipped To:', 50, 125);

      const addr = order.shippingAddress;
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#374151')
        .text(addr.name, 50, 140)
        .text(`Phone: +91-${addr.mobile}`, 50, 152)
        .text(`${addr.street}${addr.landmark ? ', ' + addr.landmark : ''}`, 50, 164)
        .text(`${addr.city}, ${addr.state} - ${addr.pincode}`, 50, 176);

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#111827')
        .text('Payment Information:', 350, 125);

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#374151')
        .text(`Payment Method: ${order.paymentInfo.method}`, 350, 140)
        .text(`Payment Status: ${order.paymentInfo.status}`, 350, 152)
        .text(
          `Transaction ID: ${order.paymentInfo.razorpayPaymentId || 'N/A (COD)'}`,
          350,
          164
        )
        .text(
          `Paid At: ${order.paymentInfo.paidAt ? formatDate(order.paymentInfo.paidAt) : 'Pending on Delivery'}`,
          350,
          176
        );

      doc.moveTo(50, 200).lineTo(550, 200).strokeColor('#e5e7eb').lineWidth(1).stroke();

      // --- Itemized Table Header ---
      const tableTop = 215;
      doc
        .rect(50, tableTop, 500, 22)
        .fillColor('#f3f4f6')
        .fill();

      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#1f2937')
        .text('Item Description', 60, tableTop + 6)
        .text('Variant / SKU', 240, tableTop + 6)
        .text('Qty', 380, tableTop + 6, { align: 'center', width: 40 })
        .text('Unit Price', 420, tableTop + 6, { align: 'right', width: 60 })
        .text('Total', 490, tableTop + 6, { align: 'right', width: 50 });

      // --- Table Rows ---
      let yPosition = tableTop + 28;

      order.items.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;

        doc
          .fontSize(9)
          .font('Helvetica')
          .fillColor('#111827')
          .text(item.name.slice(0, 32), 60, yPosition)
          .fillColor('#6b7280')
          .text(`${item.size} | ${item.color}`, 240, yPosition)
          .fillColor('#111827')
          .text(item.quantity.toString(), 380, yPosition, { align: 'center', width: 40 })
          .text(`Rs. ${item.price.toFixed(2)}`, 420, yPosition, { align: 'right', width: 60 })
          .text(`Rs. ${itemTotal.toFixed(2)}`, 490, yPosition, { align: 'right', width: 50 });

        yPosition += 22;

        // Draw light row separator
        doc.moveTo(50, yPosition - 4).lineTo(550, yPosition - 4).strokeColor('#f9fafb').stroke();
      });

      // --- Totals Section ---
      yPosition += 15;
      doc.moveTo(350, yPosition).lineTo(550, yPosition).strokeColor('#e5e7eb').stroke();
      yPosition += 10;

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#4b5563')
        .text('Items Subtotal:', 350, yPosition)
        .text(`Rs. ${order.itemsPrice.toFixed(2)}`, 450, yPosition, { align: 'right', width: 90 });

      yPosition += 16;
      doc
        .text('Shipping Fee:', 350, yPosition)
        .text(
          order.shippingPrice === 0 ? 'FREE' : `Rs. ${order.shippingPrice.toFixed(2)}`,
          450,
          yPosition,
          { align: 'right', width: 90 }
        );

      yPosition += 16;
      doc
        .text('Taxes (Inclusive GST):', 350, yPosition)
        .text(`Rs. ${order.taxPrice.toFixed(2)}`, 450, yPosition, { align: 'right', width: 90 });

      yPosition += 18;
      doc.rect(340, yPosition - 4, 210, 26).fillColor('#eff6ff').fill();

      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor('#1e40af')
        .text('Total Amount Paid:', 350, yPosition + 3)
        .text(`Rs. ${order.totalAmount.toFixed(2)}`, 450, yPosition + 3, { align: 'right', width: 90 });

      // --- Footer ---
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#9ca3af')
        .text(
          'This is a computer-generated tax invoice. No signature is required.',
          50,
          720,
          { align: 'center', width: 500 }
        )
        .text(
          'Thank you for shopping on Rigamart! Returns eligible within 7 days of delivery.',
          50,
          732,
          { align: 'center', width: 500 }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  generateInvoicePdf
};

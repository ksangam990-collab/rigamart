const PDFDocument = require('pdfkit');

/**
 * Convert number to words in Indian currency format (Lakhs, Thousands, Hundreds)
 * @param {number} num
 * @returns {string}
 */
const numberToWords = (num) => {
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n) => {
    if (n === 0) return '';
    if (n < 20) return units[n] + ' ';
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '') + ' ';
    if (n < 1000) return units[Math.floor(n / 100)] + ' Hundred ' + inWords(n % 100);
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + inWords(n % 1000);
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + inWords(n % 100000);
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + inWords(n % 10000000);
  };

  const integerPart = Math.floor(Math.abs(num || 0));
  const words = inWords(integerPart).trim();
  return words ? `INR ${words} Only` : 'INR Zero Only';
};

/**
 * Format timestamp to Indian standard date string
 * @param {Date|string} date
 * @returns {string}
 */
const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Assign reasonable standard Indian GST HSN codes based on product name/sku
 * @param {string} name
 * @returns {string}
 */
const getHsnCode = (name = '') => {
  const lower = name.toLowerCase();
  if (lower.includes('shoe') || lower.includes('sneaker') || lower.includes('boot')) return '6404';
  if (lower.includes('shirt') || lower.includes('pant') || lower.includes('dress') || lower.includes('cotton')) return '6205';
  if (lower.includes('phone') || lower.includes('laptop') || lower.includes('headphone') || lower.includes('watch')) return '8517';
  if (lower.includes('bag') || lower.includes('wallet') || lower.includes('leather')) return '4202';
  return '9968';
};

/**
 * Generate a professional, GST-compliant tax invoice PDF and pipe to writableStream
 * @param {object} order - Mongoose Order document
 * @param {object} writableStream - Express res or file write stream
 */
const generateInvoicePdf = (order, writableStream) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });

      doc.on('error', (err) => reject(err));
      writableStream.on('finish', () => resolve());

      doc.pipe(writableStream);

      // --- Header: Left Company Branding ---
      doc
        .fillColor('#1e40af')
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('RIGAMART', 40, 38)
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor('#4338ca')
        .text('MARKETPLACE PRIVATE LIMITED', 40, 62)
        .font('Helvetica')
        .fillColor('#4b5563')
        .text('CIN: U72200KA2024PTC184920 | GSTIN: 29AABCR8841F1ZS', 40, 74)
        .text('Outer Ring Road, Bellandur, Bengaluru, Karnataka, 560103', 40, 85)
        .text('E: support@rigamart.com | W: www.rigamart.com', 40, 96);

      // --- Header: Right Tax Invoice Metadata ---
      doc
        .fillColor('#0f172a')
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('TAX INVOICE', 350, 38, { align: 'right', width: 205 })
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#64748b')
        .text('Original for Recipient (Section 31 CGST Act)', 350, 56, { align: 'right', width: 205 })
        .fillColor('#111827')
        .font('Helvetica-Bold')
        .text(`Invoice No: INV-${order.orderNumber}`, 350, 69, { align: 'right', width: 205 })
        .font('Helvetica')
        .fillColor('#374151')
        .text(`Order Ref: #${order.orderNumber}`, 350, 81, { align: 'right', width: 205 })
        .text(`Invoice Date: ${formatDate(order.createdAt)}`, 350, 93, { align: 'right', width: 205 })
        .text(`Place of Supply: ${order.shippingAddress?.state || 'India'} (State Code: 29)`, 350, 105, { align: 'right', width: 205 });

      // Horizontal Divider
      doc.moveTo(40, 120).lineTo(555, 120).strokeColor('#cbd5e1').lineWidth(1).stroke();

      // --- Details Grid: Sold By vs Billed & Shipped To ---
      const detailTop = 128;

      // Left Box: Sold By (Seller)
      doc
        .rect(40, detailTop, 250, 82)
        .fillColor('#f8fafc')
        .fill()
        .strokeColor('#e2e8f0')
        .lineWidth(1)
        .stroke();

      doc
        .fillColor('#1e3a8a')
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('SOLD BY / DISPATCHED FROM:', 50, detailTop + 8);

      const sellerName = order.items?.[0]?.seller?.name || 'Rigamart Certified Partner';
      doc
        .fillColor('#111827')
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .text(sellerName.slice(0, 35), 50, detailTop + 22)
        .font('Helvetica')
        .fillColor('#4b5563')
        .text(`Fulfillment Center: ${order.shippingAddress?.state || 'Bengaluru'} Logistics Node`, 50, detailTop + 34)
        .text('Seller GSTIN: 29AACPR8821K1ZZ', 50, detailTop + 45)
        .text('PAN: AACPR8821K | Type: Multi-Vendor Merchant', 50, detailTop + 56)
        .text('Reverse Charge Applicable: NO', 50, detailTop + 67);

      // Right Box: Billed & Shipped To (Customer)
      doc
        .rect(305, detailTop, 250, 82)
        .fillColor('#f8fafc')
        .fill()
        .strokeColor('#e2e8f0')
        .lineWidth(1)
        .stroke();

      doc
        .fillColor('#1e3a8a')
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('BILLED & SHIPPED TO:', 315, detailTop + 8);

      const addr = order.shippingAddress || {};
      const fullStreet = `${addr.street || ''}${addr.landmark ? ', ' + addr.landmark : ''}`;
      doc
        .fillColor('#111827')
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .text(addr.name || 'Valued Customer', 315, detailTop + 22)
        .font('Helvetica')
        .fillColor('#4b5563')
        .text(fullStreet.slice(0, 45), 315, detailTop + 34)
        .text(`${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`, 315, detailTop + 45)
        .text(`Phone: +91-${addr.mobile || 'N/A'}`, 315, detailTop + 56)
        .text(`Pay Mode: ${order.paymentInfo?.method || 'COD'} | Status: ${order.paymentInfo?.status || 'Pending'}`, 315, detailTop + 67);

      // --- Itemized Goods Table Header ---
      const tableTop = 222;
      doc
        .rect(40, tableTop, 515, 20)
        .fillColor('#1e293b')
        .fill();

      doc
        .fontSize(7.5)
        .font('Helvetica-Bold')
        .fillColor('#ffffff')
        .text('#', 45, tableTop + 6, { width: 15, align: 'center' })
        .text('DESCRIPTION OF GOODS', 65, tableTop + 6, { width: 160 })
        .text('HSN', 230, tableTop + 6, { width: 35, align: 'center' })
        .text('QTY', 270, tableTop + 6, { width: 25, align: 'center' })
        .text('RATE (₹)', 300, tableTop + 6, { width: 45, align: 'right' })
        .text('TAXABLE', 350, tableTop + 6, { width: 45, align: 'right' })
        .text('CGST (9%)', 400, tableTop + 6, { width: 45, align: 'right' })
        .text('SGST (9%)', 450, tableTop + 6, { width: 45, align: 'right' })
        .text('TOTAL (₹)', 500, tableTop + 6, { width: 50, align: 'right' });

      // --- Table Rows ---
      let y = tableTop + 24;
      let totalTaxableCalculated = 0;
      let totalCgstCalculated = 0;
      let totalSgstCalculated = 0;

      (order.items || []).forEach((item, idx) => {
        const itemTotal = (item.price || 0) * (item.quantity || 1);
        // Standard inclusive GST calculation (18%)
        const taxable = itemTotal / 1.18;
        const cgst = taxable * 0.09;
        const sgst = taxable * 0.09;

        totalTaxableCalculated += taxable;
        totalCgstCalculated += cgst;
        totalSgstCalculated += sgst;

        const isEven = idx % 2 === 0;
        if (isEven) {
          doc.rect(40, y - 2, 515, 22).fillColor('#f8fafc').fill();
        }

        const hsn = getHsnCode(item.name);
        const variantDesc = [item.size, item.color].filter(Boolean).join(' / ');

        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor('#4b5563')
          .text((idx + 1).toString(), 45, y + 2, { width: 15, align: 'center' })
          .fillColor('#0f172a')
          .font('Helvetica-Bold')
          .text((item.name || 'Product').slice(0, 28), 65, y + 2, { width: 160 })
          .font('Helvetica')
          .fontSize(7)
          .fillColor('#64748b')
          .text(variantDesc ? `(${variantDesc})` : '', 65, y + 11, { width: 160 })
          .fontSize(8)
          .fillColor('#334155')
          .text(hsn, 230, y + 2, { width: 35, align: 'center' })
          .text((item.quantity || 1).toString(), 270, y + 2, { width: 25, align: 'center' })
          .text((item.price || 0).toFixed(2), 300, y + 2, { width: 45, align: 'right' })
          .text(taxable.toFixed(2), 350, y + 2, { width: 45, align: 'right' })
          .text(cgst.toFixed(2), 400, y + 2, { width: 45, align: 'right' })
          .text(sgst.toFixed(2), 450, y + 2, { width: 45, align: 'right' })
          .font('Helvetica-Bold')
          .fillColor('#0f172a')
          .text(itemTotal.toFixed(2), 500, y + 2, { width: 50, align: 'right' });

        y += 24;
        doc.moveTo(40, y - 2).lineTo(555, y - 2).strokeColor('#e2e8f0').lineWidth(0.5).stroke();
      });

      // --- Financial Summary & Signature Section ---
      y += 10;
      const summaryTop = Math.max(y, 360);

      // Left Column: Amount in Words & Authorized Seal
      doc
        .rect(40, summaryTop, 270, 48)
        .fillColor('#f8fafc')
        .fill()
        .strokeColor('#e2e8f0')
        .lineWidth(1)
        .stroke();

      doc
        .fontSize(7.5)
        .font('Helvetica-Bold')
        .fillColor('#475569')
        .text('AMOUNT IN WORDS (ROUNDED):', 48, summaryTop + 8)
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor('#1e40af')
        .text(numberToWords(order.totalAmount), 48, summaryTop + 22, { width: 254 });

      // Verification Stamp / Seal
      const stampTop = summaryTop + 58;
      doc
        .rect(40, stampTop, 270, 78)
        .fillColor('#f0fdf4')
        .fill()
        .strokeColor('#bbf7d0')
        .lineWidth(1)
        .stroke();

      doc
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .fillColor('#15803d')
        .text('RIGAMART ASSURED & DIGITALLY VERIFIED', 48, stampTop + 10)
        .fontSize(7.5)
        .font('Helvetica')
        .fillColor('#166534')
        .text('✓ Authenticated via Secure Escrow Payment Gateway', 48, stampTop + 24)
        .text(`Transaction Ref: ${order.paymentInfo?.razorpayPaymentId || order.paymentInfo?.razorpayOrderId || 'COD Verified'}`, 48, stampTop + 36)
        .text('Authorized Signatory for Rigamart Marketplace Pvt Ltd', 48, stampTop + 50)
        .fontSize(7)
        .fillColor('#65a30d')
        .text('[Digitally signed at dispatch hub]', 48, stampTop + 62);

      // Right Column: Breakdown Table
      const totalsBoxTop = summaryTop;
      doc
        .rect(325, totalsBoxTop, 230, 136)
        .fillColor('#ffffff')
        .fill()
        .strokeColor('#cbd5e1')
        .lineWidth(1)
        .stroke();

      let totalsY = totalsBoxTop + 10;
      const printTotalLine = (label, val, isDiscount = false, bold = false) => {
        doc
          .fontSize(8.5)
          .font(bold ? 'Helvetica-Bold' : 'Helvetica')
          .fillColor(isDiscount ? '#059669' : '#374151')
          .text(label, 335, totalsY)
          .text(val, 435, totalsY, { width: 110, align: 'right' });
        totalsY += 16;
      };

      printTotalLine('Net Taxable Value:', `₹ ${totalTaxableCalculated.toFixed(2)}`);
      printTotalLine('Total CGST (9.0%):', `₹ ${totalCgstCalculated.toFixed(2)}`);
      printTotalLine('Total SGST (9.0%):', `₹ ${totalSgstCalculated.toFixed(2)}`);
      printTotalLine(
        'Shipping & Handling:',
        order.shippingPrice === 0 ? 'FREE' : `₹ ${(order.shippingPrice || 0).toFixed(2)}`
      );

      if (order.discountPrice > 0) {
        const couponText = order.coupon?.code ? `Coupon (${order.coupon.code}):` : 'Promo Discount:';
        printTotalLine(couponText, `- ₹ ${(order.discountPrice || 0).toFixed(2)}`, true);
      }

      // Grand Total Highlight Bar
      doc.rect(325, totalsY, 230, 26).fillColor('#eff6ff').fill().strokeColor('#93c5fd').stroke();
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#1d4ed8')
        .text('GRAND TOTAL (INR):', 335, totalsY + 8)
        .text(`₹ ${(order.totalAmount || 0).toFixed(2)}`, 435, totalsY + 8, {
          width: 110,
          align: 'right'
        });

      // --- Bottom Footer & Terms ---
      const footerY = 740;
      doc.moveTo(40, footerY).lineTo(555, footerY).strokeColor('#e2e8f0').lineWidth(0.75).stroke();

      doc
        .fontSize(7.5)
        .font('Helvetica')
        .fillColor('#64748b')
        .text(
          'Return & Dispute Policy: Eligible for returns within 7 calendar days from confirmed delivery date.',
          40,
          footerY + 8,
          { align: 'center', width: 515 }
        )
        .text(
          'Customer Support: help@rigamart.com | Toll Free: 1800-200-RIGA | Mon-Sat 9AM-8PM IST',
          40,
          footerY + 20,
          { align: 'center', width: 515 }
        )
        .fillColor('#94a3b8')
        .text(
          'This is a computer-generated tax invoice issued under Section 31 of CGST Act, 2017 and requires no manual physical signature.',
          40,
          footerY + 32,
          { align: 'center', width: 515 }
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

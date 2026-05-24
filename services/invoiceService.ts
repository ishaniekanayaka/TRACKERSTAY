// services/invoiceService.ts
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';
import { Booking } from '../types/booking';

// ── Helper: Calculate nights ──────────────────────────────────────────────────
const calculateNights = (checkIn: string, checkOut: string): number => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// ── Helper: Get room info string ──────────────────────────────────────────────
const getRoomInfo = (booking: Booking): string => {
  if (booking.booking_room_count && booking.booking_room_count.length > 0) {
    const roomNames = booking.booking_room_count
      .filter((room: any) => room.room_count > 0)
      .map((room: any) => {
        const roomType =
          room.room_categories?.custome_name ||
          room.room_categories?.category ||
          'Room';
        return `${room.room_count} ${roomType} Room`;
      });
    if (roomNames.length > 0) return roomNames.join(', ');
  }
  return `${booking.room_count || 1} Room${Number(booking.room_count) > 1 ? 's' : ''}`;
};

// ── Helper: Get paid amount ───────────────────────────────────────────────────
const getPaidAmount = (booking: Booking): number => {
  let paid = 0;
  if (booking.advance_payment && booking.advance_payment > 0) paid = booking.advance_payment;
  if (booking.card_payment && booking.card_payment > 0) paid += booking.card_payment;
  if (booking.cash_payment && booking.cash_payment > 0) paid += booking.cash_payment;
  if (booking.reservation) {
    const adv = parseFloat(booking.reservation.advance_payment || '0');
    if (adv > paid) paid = adv;
  }
  return paid;
};

// ── Generate Invoice HTML ─────────────────────────────────────────────────────
const generateInvoiceHTML = (booking: Booking): string => {
  const nights = calculateNights(booking.checking_date, booking.checkout_date);
  const roomInfo = getRoomInfo(booking);
  const total = booking.total_amount || 0;
  const paid = getPaidAmount(booking);
  const due = total - paid;
  const guestName = `${booking.first_name} ${booking.last_name}`.trim();
  const today = new Date().toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // USD display
  const usdAmount = booking.usd_amount && parseFloat(booking.usd_amount) > 0
    ? parseFloat(booking.usd_amount).toFixed(2)
    : null;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Invoice #${booking.id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background: #ffffff;
      color: #1a1a2e;
      font-size: 13px;
    }
    .page {
      max-width: 680px;
      margin: 0 auto;
      padding: 40px 48px;
      background: #fff;
    }

    /* ── Header ── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 36px;
      padding-bottom: 24px;
      border-bottom: 2px solid #f0f0f0;
    }
    .hotel-info h1 {
      color: #C9A42E;
      font-size: 32px;
      font-weight: 900;
      letter-spacing: 4px;
      text-transform: uppercase;
      line-height: 1;
    }
    .hotel-info .tagline {
      color: #888;
      font-size: 11px;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .hotel-info .address {
      margin-top: 14px;
      color: #555;
      font-size: 12px;
      line-height: 1.7;
    }
    .hotel-info .address span {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .invoice-badge {
      text-align: right;
    }
    .invoice-badge .invoice-title {
      font-size: 28px;
      font-weight: 800;
      color: #C9A42E;
      letter-spacing: 3px;
      text-transform: uppercase;
    }
    .invoice-badge .invoice-id {
      font-size: 13px;
      color: #6B5B95;
      font-weight: 700;
      margin-top: 4px;
    }
    .invoice-badge .invoice-date {
      font-size: 12px;
      color: #888;
      margin-top: 3px;
    }

    /* ── Guest Card ── */
    .guest-section {
      background: linear-gradient(135deg, #6B5B95 0%, #7D6BA8 100%);
      border-radius: 14px;
      padding: 20px 24px;
      margin-bottom: 28px;
      color: #fff;
    }
    .guest-section .section-label {
      font-size: 10px;
      letter-spacing: 2px;
      text-transform: uppercase;
      opacity: 0.75;
      margin-bottom: 12px;
    }
    .guest-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px 24px;
    }
    .guest-field label {
      font-size: 10px;
      opacity: 0.7;
      text-transform: uppercase;
      letter-spacing: 1px;
      display: block;
      margin-bottom: 2px;
    }
    .guest-field span {
      font-size: 13px;
      font-weight: 600;
    }

    /* ── Stay Summary ── */
    .stay-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f8f6ff;
      border: 1.5px solid #ddd6fe;
      border-radius: 12px;
      padding: 18px 24px;
      margin-bottom: 28px;
    }
    .stay-date { text-align: center; flex: 1; }
    .stay-date .label {
      font-size: 10px;
      color: #6B5B95;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 5px;
    }
    .stay-date .date {
      font-size: 14px;
      font-weight: 700;
      color: #1a1a2e;
    }
    .stay-date .time {
      font-size: 11px;
      color: #888;
      margin-top: 2px;
    }
    .nights-bubble {
      background: #6B5B95;
      color: #fff;
      border-radius: 50%;
      width: 56px;
      height: 56px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 0 20px;
      flex-shrink: 0;
    }
    .nights-bubble .num { font-size: 20px; font-weight: 800; line-height: 1; }
    .nights-bubble .txt { font-size: 8px; letter-spacing: 1px; text-transform: uppercase; margin-top: 1px; }

    /* ── Room Bill Table ── */
    .section-title {
      font-size: 11px;
      font-weight: 700;
      color: #6B5B95;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    thead tr {
      background: linear-gradient(90deg, #6B5B95, #7D6BA8);
    }
    thead th {
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 10px 14px;
      text-align: left;
    }
    thead th:last-child { text-align: right; }
    tbody tr {
      border-bottom: 1px solid #f0f0f0;
    }
    tbody td {
      padding: 12px 14px;
      color: #333;
      font-size: 13px;
      vertical-align: top;
    }
    tbody td:last-child {
      text-align: right;
      font-weight: 700;
      color: #1a1a2e;
    }
    .td-sub {
      font-size: 11px;
      color: #888;
      margin-top: 3px;
    }

    /* ── Payment Summary ── */
    .payment-box {
      margin-left: auto;
      width: 280px;
      background: #f9fafb;
      border: 1.5px solid #e5e7eb;
      border-radius: 12px;
      padding: 18px 20px;
      margin-bottom: 28px;
    }
    .pay-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      font-size: 13px;
    }
    .pay-row .pay-label { color: #6b7280; font-weight: 600; }
    .pay-row .pay-val { font-weight: 700; color: #1a1a2e; }
    .pay-row.paid .pay-label,
    .pay-row.paid .pay-val { color: #10B981; }
    .pay-row.due {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 2px solid #e5e7eb;
    }
    .pay-row.due .pay-label,
    .pay-row.due .pay-val {
      color: #EF4444;
      font-size: 14px;
      font-weight: 800;
    }

    /* ── Footer ── */
    .footer {
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1.5px solid #f0f0f0;
      text-align: center;
      color: #aaa;
      font-size: 11px;
      line-height: 1.8;
    }
    .footer strong { color: #C9A42E; }
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="hotel-info">
      <h1>RAVAN</h1>
      <div class="tagline">Tangalle</div>
      <div class="address">
        <span>📍 No 50, Parakrama Road, Tangalle, Sri Lanka</span>
        <span>📞 070 652 2566</span>
      </div>
    </div>
    <div class="invoice-badge">
      <div class="invoice-title">Invoice</div>
      <div class="invoice-id">Invoice Id : ${booking.id}</div>
      <div class="invoice-date">Date : ${today}</div>
    </div>
  </div>

  <!-- Guest Info -->
  <div class="guest-section">
    <div class="section-label">Guest Information</div>
    <div class="guest-grid">
      <div class="guest-field">
        <label>Name</label>
        <span>${guestName}</span>
      </div>
      <div class="guest-field">
        <label>Booking Method</label>
        <span>${booking.booking_method || 'Direct'}</span>
      </div>
      ${booking.email ? `
      <div class="guest-field">
        <label>Email</label>
        <span>${booking.email}</span>
      </div>` : ''}
      ${booking.phone ? `
      <div class="guest-field">
        <label>Tel</label>
        <span>${booking.phone}</span>
      </div>` : ''}
      ${booking.passport ? `
      <div class="guest-field">
        <label>Passport</label>
        <span>${booking.passport}</span>
      </div>` : ''}
      ${booking.country ? `
      <div class="guest-field">
        <label>Country</label>
        <span>${booking.country}</span>
      </div>` : ''}
    </div>
  </div>

  <!-- Stay Dates -->
  <div class="stay-banner">
    <div class="stay-date">
      <div class="label">Check-in</div>
      <div class="date">${booking.checking_date}</div>
      <div class="time">${booking.checking_time || '14:00'}</div>
    </div>
    <div class="nights-bubble">
      <span class="num">${nights}</span>
      <span class="txt">Nights</span>
    </div>
    <div class="stay-date">
      <div class="label">Check-out</div>
      <div class="date">${booking.checkout_date}</div>
      <div class="time">${booking.checkout_time || '12:00'}</div>
    </div>
  </div>

  <!-- Room Bill Table -->
  <div class="section-title">Room Bill</div>
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Check-in Date</th>
        <th>Checkout Date</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          Room Details
          <div class="td-sub">${roomInfo} &nbsp;•&nbsp; ${nights} Night${nights !== 1 ? 's' : ''} &nbsp;•&nbsp; ${booking.breakfast || 'Room Only'}</div>
          <div class="td-sub">${Number(booking.adults) || 0} Adults, ${Number(booking.children) || 0} Children</div>
        </td>
        <td>${booking.checking_date}</td>
        <td>${booking.checkout_date}</td>
        <td>
          Rs. ${total.toFixed(2)}
          ${usdAmount ? `<div class="td-sub">($${usdAmount})</div>` : ''}
        </td>
      </tr>
    </tbody>
  </table>

  <!-- Payment Summary -->
  <div class="payment-box">
    <div class="pay-row">
      <span class="pay-label">Total Amount</span>
      <span class="pay-val">Rs. ${total.toFixed(2)}</span>
    </div>
    <div class="pay-row paid">
      <span class="pay-label">Advance Payment</span>
      <span class="pay-val">Rs. ${paid.toFixed(2)}</span>
    </div>
    <div class="pay-row due">
      <span class="pay-label">Due Payment</span>
      <span class="pay-val">Rs. ${due.toFixed(2)}</span>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <em>This invoice was generated electronically and does not require a signature or seal.</em><br/>
    <em>Payments made are non-refundable.</em><br/><br/>
    <strong>RAVAN Tangalle</strong> &nbsp;|&nbsp; No 50, Parakrama Road, Tangalle, Sri Lanka &nbsp;|&nbsp; 070 652 2566
  </div>

</div>
</body>
</html>
  `;
};

// ── Main Export: Print & Share Invoice ───────────────────────────────────────
const invoiceService = {
  /**
   * Generates a PDF invoice for the given booking and opens the share sheet.
   * On iOS/Android the user can save to Files, share via WhatsApp, email, etc.
   */
  printAndShareInvoice: async (booking: Booking): Promise<void> => {
    try {
      const html = generateInvoiceHTML(booking);

      // Generate PDF using expo-print
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      // Check if sharing is available
      const canShare = await Sharing.isAvailableAsync();

      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Invoice #${booking.id} - ${booking.first_name} ${booking.last_name}`,
          UTI: 'com.adobe.pdf', // iOS
        });
      } else {
        // Fallback: just open the print dialog
        await Print.printAsync({ uri });
      }
    } catch (error: any) {
      console.error('Invoice generation error:', error);
      Alert.alert(
        'Invoice Error',
        error?.message || 'Failed to generate invoice. Please try again.',
        [{ text: 'OK' }]
      );
    }
  },
};

export default invoiceService;
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Animated,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import api from '../../config/apiConfig';

// ─── Types ────────────────────────────────────────────────────────────────────
interface InvoicePayment {
  id: number;
  created_at: string;
  amount: string;
  pay_for: string | null;
  payment_method: string;
}

interface InvoiceData {
  hotel_invoice: {
    id: number;
    reservation_id: string;
    customer_fname: string;
    customer_lname: string;
    address: string;
    emaill: string;
    teliphone: string;
    whatsapp: string;
    status: string;
    advance_payment: string;
    room_payment: string;
    room_chargers: string;
    room_chargers_service_cj: string;
    total_discount: number;
    total_refund: number;
    reservation: {
      check_in_date: string;
      check_out_date: string;
      breakfast: string;
      booking: {
        checking_date: string;
        checkout_date: string;
        adults: string;
        children: string;
        room_count: string;
        breakfast: string;
        booking_method: string;
        total_amount: number;
        advance_payment: number;
      };
    };
    discounts: any[];
    refunds: any[];
  };
  invoices: any[];
  hotel_invoice_payments: InvoicePayment[];
  unpaid_extra_services: any[];
}

interface InvoiceModalProps {
  visible: boolean;
  bookingId: number | null;
  onClose: () => void;
}

// ─── Helper ───────────────────────────────────────────────────────────────────
const fmt = (n: string | number) =>
  parseFloat(String(n || 0)).toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtDate = (iso: string) => {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
};

// ─── Generate HTML for Print / PDF ───────────────────────────────────────────
const generateInvoiceHTML = (data: InvoiceData): string => {
  const inv = data.hotel_invoice;
  const res = inv.reservation;
  const bk  = res?.booking;
  const payments = data.hotel_invoice_payments;

  const totalBill    = parseFloat(inv.room_chargers || '0');
  const totalPaid    = payments.reduce((s, p) => s + parseFloat(p.amount || '0'), 0);
  const totalDiscount= inv.total_discount || 0;
  const totalRefund  = inv.total_refund || 0;
  const balance      = totalBill - totalPaid - totalDiscount + totalRefund;

  const paymentRows = payments.map(p => `
    <tr>
      <td>${fmtDate(p.created_at)}</td>
      <td>Payment</td>
      <td>-</td>
      <td>${fmt(p.amount)}</td>
      <td>${p.payment_method || '-'}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color:#1a1a2e; background:#fff; padding:32px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:32px; }
  .hotel-name { font-size:28px; font-weight:800; color:#6B5B95; letter-spacing:-0.5px; }
  .hotel-sub  { font-size:13px; color:#888; margin-top:4px; }
  .invoice-meta { text-align:right; }
  .invoice-meta h2 { font-size:22px; font-weight:700; color:#1a1a2e; }
  .invoice-meta p  { font-size:13px; color:#555; margin-top:2px; }
  .divider { border:none; border-top:2px solid #f0ecff; margin:24px 0; }
  .two-col { display:flex; gap:40px; margin-bottom:24px; }
  .col h3  { font-size:11px; font-weight:700; color:#6B5B95; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px; }
  .col p   { font-size:13px; color:#333; margin-bottom:4px; }
  .col strong { color:#1a1a2e; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  th { background:#6B5B95; color:#fff; padding:10px 12px; text-align:left; font-weight:600; font-size:12px; }
  td { padding:10px 12px; border-bottom:1px solid #f0f0f0; }
  tr:last-child td { border-bottom:none; }
  tr.subtotal td { background:#faf9ff; font-weight:700; }
  tr.total td   { background:#6B5B95; color:#fff; font-weight:700; font-size:14px; }
  .balance-row { margin-top:16px; background:#fff3f3; border:2px solid #ffcdd2; border-radius:8px; padding:14px 16px; display:flex; justify-content:space-between; align-items:center; }
  .balance-row.paid { background:#f0fff4; border-color:#c8e6c9; }
  .balance-label { font-size:14px; font-weight:700; color:#c62828; }
  .balance-label.paid { color:#2e7d32; }
  .balance-value { font-size:18px; font-weight:800; color:#c62828; }
  .balance-value.paid { color:#2e7d32; }
  .footer { margin-top:40px; text-align:center; font-size:11px; color:#aaa; }
  .status-badge { display:inline-block; padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; }
  .status-pending { background:#fff8e1; color:#f57f17; border:1px solid #ffe082; }
  .status-paid    { background:#e8f5e9; color:#2e7d32; border:1px solid #a5d6a7; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="hotel-name">Hotel Invoice</div>
      <div class="hotel-sub">Ravan Hotel Management System</div>
    </div>
    <div class="invoice-meta">
      <h2>INV #${inv.reservation_id}</h2>
      <p>Date: ${fmtDate(new Date().toISOString())}</p>
      <p>Status: <span class="status-badge ${inv.status?.toLowerCase() === 'paid' ? 'status-paid' : 'status-pending'}">${inv.status}</span></p>
    </div>
  </div>
  <hr class="divider"/>
  <div class="two-col">
    <div class="col">
      <h3>Guest Details</h3>
      <p><strong>${inv.customer_fname} ${inv.customer_lname}</strong></p>
      <p>${inv.address || '-'}</p>
      <p>${inv.teliphone || '-'}</p>
      <p>${inv.emaill !== 'null@gmail.com' ? inv.emaill : '-'}</p>
    </div>
    <div class="col">
      <h3>Stay Details</h3>
      <p>Check-in: <strong>${fmtDate(res?.check_in_date)}</strong></p>
      <p>Check-out: <strong>${fmtDate(res?.check_out_date)}</strong></p>
      <p>Adults: <strong>${bk?.adults || '-'}</strong> &nbsp; Children: <strong>${bk?.children || '0'}</strong></p>
      <p>Rooms: <strong>${bk?.room_count || '-'}</strong></p>
      <p>Meal Plan: <strong>${res?.breakfast || bk?.breakfast || '-'}</strong></p>
      <p>Booking via: <strong>${bk?.booking_method || '-'}</strong></p>
    </div>
  </div>
  <hr class="divider"/>
  <h3 style="font-size:13px;font-weight:700;color:#6B5B95;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Room &amp; Food Bills</h3>
  <table>
    <thead>
      <tr><th>Date</th><th>Description</th><th>Bill</th><th>Payment</th><th>Remark</th></tr>
    </thead>
    <tbody>
      <tr>
        <td>${fmtDate(res?.check_in_date)}</td>
        <td>Room Chargers</td>
        <td>LKR ${fmt(inv.room_chargers)}</td>
        <td>-</td>
        <td>-</td>
      </tr>
      ${paymentRows}
      ${totalDiscount > 0 ? `<tr><td colspan="2">Discount</td><td>-</td><td>LKR ${fmt(totalDiscount)}</td><td>Applied</td></tr>` : ''}
      <tr class="subtotal">
        <td colspan="2">Subtotal</td>
        <td>LKR ${fmt(totalBill)}</td>
        <td>LKR ${fmt(totalPaid)}</td>
        <td></td>
      </tr>
      <tr class="total">
        <td colspan="2">Total</td>
        <td>LKR ${fmt(totalBill)}</td>
        <td>LKR ${fmt(totalPaid)}</td>
        <td></td>
      </tr>
    </tbody>
  </table>
  <div style="margin-top:16px;">
    <div class="balance-row ${balance <= 0 ? 'paid' : ''}">
      <span class="balance-label ${balance <= 0 ? 'paid' : ''}">${balance <= 0 ? 'Fully Paid' : 'Balance Due'}</span>
      <span class="balance-value ${balance <= 0 ? 'paid' : ''}">LKR ${fmt(Math.abs(balance))}</span>
    </div>
  </div>
  <div class="footer">
    <p>Thank you for staying with us. We hope to see you again!</p>
    <p style="margin-top:6px;">Generated by Ravan Hotel Management System</p>
  </div>
</body>
</html>`;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const InvoiceModal: React.FC<InvoiceModalProps> = ({ visible, bookingId, onClose }) => {
  const [loading, setLoading]           = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [invoiceData, setInvoiceData]   = useState<InvoiceData | null>(null);
  const [error, setError]               = useState<string | null>(null);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  // Animate in/out
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(fadeAnim,  { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  // Load invoice when modal opens
  useEffect(() => {
    if (visible && bookingId) {
      loadInvoice();
    } else {
      setInvoiceData(null);
      setError(null);
    }
  }, [visible, bookingId]);

  const loadInvoice = async () => {
    if (!bookingId) return;
    setLoading(true);
    setError(null);
    try {
      // Step 1: Get hotel_invoice_id via the dashboard endpoint
      const dashResponse = await api.get('/hotel_invoice/get_daily_booking_details_for_dashbord', {
        params: { booking_id: bookingId.toString() },
      });

      if (!dashResponse.data?.success) {
        throw new Error('Failed to load invoice data');
      }

      // If pdf_base64 returned (old flow), keep it for reference but we use structured data
      const invoiceId: number | undefined =
        dashResponse.data?.data?.hotel_invoice?.id ||
        dashResponse.data?.invoice_id;

      if (!invoiceId) {
        // The dashboard endpoint already returned the full structured data
        if (dashResponse.data?.data) {
          setInvoiceData(dashResponse.data.data);
        } else {
          throw new Error('Invoice ID not found in response');
        }
        return;
      }

      // Step 2: Fetch full invoice details by invoice ID
      const detailsResponse = await api.get('/hotel_invoice/details', {
        params: { id: invoiceId },
      });

      if (detailsResponse.data?.success && detailsResponse.data?.data) {
        setInvoiceData(detailsResponse.data.data);
      } else {
        throw new Error('Failed to load invoice details');
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to load invoice. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    if (!invoiceData) return;
    setPrintLoading(true);
    try {
      const html = generateInvoiceHTML(invoiceData);
      const { uri } = await Print.printToFileAsync({ html, base64: false });

      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (isSharingAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Invoice PDF',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('PDF Saved', `Invoice saved to: ${uri}`);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to generate PDF. Please try again.');
    } finally {
      setPrintLoading(false);
    }
  };

  const translateY = slideAnim.interpolate({ inputRange: [0, 1], outputRange: [700, 0] });

  if (!visible) return null;

  const inv      = invoiceData?.hotel_invoice;
  const res      = inv?.reservation;
  const bk       = res?.booking;
  const payments = invoiceData?.hotel_invoice_payments || [];

  const totalBill     = parseFloat(inv?.room_chargers || '0');
  const totalPaid     = payments.reduce((s, p) => s + parseFloat(p.amount || '0'), 0);
  const totalDiscount = inv?.total_discount || 0;
  const balance       = totalBill - totalPaid - totalDiscount;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
          {/* ── Header ── */}
          <LinearGradient colors={['#6B5B95', '#4A3F6B']} style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Invoice</Text>
              {inv && (
                <Text style={styles.headerSub}>Reservation #{inv.reservation_id}</Text>
              )}
            </View>
            <View style={styles.headerRight}>
              {inv && (
                <View style={[styles.statusBadge, inv.status?.toLowerCase() === 'paid' ? styles.statusPaid : styles.statusPending]}>
                  <Text style={[styles.statusText, inv.status?.toLowerCase() === 'paid' ? styles.statusPaidText : styles.statusPendingText]}>
                    {inv.status}
                  </Text>
                </View>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close-circle" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* ── Body ── */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6B5B95" />
              <Text style={styles.loadingText}>Loading invoice...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
              <Text style={styles.errorTitle}>Failed to Load Invoice</Text>
              <Text style={styles.errorSub}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={loadInvoice}>
                <Ionicons name="refresh-outline" size={16} color="#fff" />
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : invoiceData ? (
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
              <View style={styles.content}>

                {/* ── Guest + Stay Info ── */}
                <View style={styles.twoCol}>
                  <View style={styles.infoCard}>
                    <Text style={styles.sectionLabel}>GUEST</Text>
                    <Text style={styles.guestName}>{inv?.customer_fname} {inv?.customer_lname}</Text>
                    <Text style={styles.infoLine}>{inv?.teliphone}</Text>
                    {inv?.emaill !== 'null@gmail.com' && (
                      <Text style={styles.infoLine}>{inv?.emaill}</Text>
                    )}
                    <Text style={styles.infoLine}>{inv?.address}</Text>
                  </View>
                  <View style={styles.infoCard}>
                    <Text style={styles.sectionLabel}>STAY</Text>
                    <View style={styles.stayRow}>
                      <Text style={styles.stayLabel}>Check-in</Text>
                      <Text style={styles.stayValue}>{fmtDate(res?.check_in_date)}</Text>
                    </View>
                    <View style={styles.stayRow}>
                      <Text style={styles.stayLabel}>Check-out</Text>
                      <Text style={styles.stayValue}>{fmtDate(res?.check_out_date)}</Text>
                    </View>
                    <View style={styles.stayRow}>
                      <Text style={styles.stayLabel}>Guests</Text>
                      <Text style={styles.stayValue}>{bk?.adults}A / {bk?.children}C</Text>
                    </View>
                    <View style={styles.stayRow}>
                      <Text style={styles.stayLabel}>Meal</Text>
                      <Text style={styles.stayValue}>{res?.breakfast || bk?.breakfast || '-'}</Text>
                    </View>
                  </View>
                </View>

                {/* ── Room & Food Bills ── */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Room &amp; Food Bills</Text>
                  {/* Header row */}
                  <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 1.5 }]}>Date</Text>
                    <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 2 }]}>Description</Text>
                    <Text style={[styles.tableCell, styles.tableHeaderText, styles.textRight, { flex: 1.5 }]}>Amount</Text>
                    <Text style={[styles.tableCell, styles.tableHeaderText, styles.textRight, { flex: 1.5 }]}>Payment</Text>
                  </View>
                  {/* Room charge row */}
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 1.5 }]}>{fmtDate(res?.check_in_date)}</Text>
                    <Text style={[styles.tableCell, { flex: 2 }]}>Room Chargers</Text>
                    <Text style={[styles.tableCell, styles.textRight, { flex: 1.5 }]}>LKR {fmt(inv?.room_chargers || 0)}</Text>
                    <Text style={[styles.tableCell, styles.textRight, { flex: 1.5 }]}>-</Text>
                  </View>
                  {/* Payment rows */}
                  {payments.map((p) => (
                    <View key={p.id} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { flex: 1.5 }]}>{fmtDate(p.created_at)}</Text>
                      <Text style={[styles.tableCell, { flex: 2 }]}>Payment</Text>
                      <Text style={[styles.tableCell, styles.textRight, { flex: 1.5 }]}>-</Text>
                      <Text style={[styles.tableCell, styles.textRight, styles.paidText, { flex: 1.5 }]}>LKR {fmt(p.amount)}</Text>
                    </View>
                  ))}
                  {totalDiscount > 0 && (
                    <View style={styles.tableRow}>
                      <Text style={[styles.tableCell, { flex: 1.5 }]}>-</Text>
                      <Text style={[styles.tableCell, { flex: 2 }]}>Discount</Text>
                      <Text style={[styles.tableCell, styles.textRight, { flex: 1.5 }]}>-</Text>
                      <Text style={[styles.tableCell, styles.textRight, styles.paidText, { flex: 1.5 }]}>LKR {fmt(totalDiscount)}</Text>
                    </View>
                  )}
                  {/* Subtotal */}
                  <View style={[styles.tableRow, styles.subtotalRow]}>
                    <Text style={[styles.tableCell, styles.subtotalText, { flex: 3.5 }]}>Subtotal</Text>
                    <Text style={[styles.tableCell, styles.subtotalText, styles.textRight, { flex: 1.5 }]}>LKR {fmt(totalBill)}</Text>
                    <Text style={[styles.tableCell, styles.subtotalText, styles.textRight, { flex: 1.5 }]}>LKR {fmt(totalPaid)}</Text>
                  </View>
                  {/* Total */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={[styles.tableCell, styles.totalText, { flex: 3.5 }]}>Total</Text>
                    <Text style={[styles.tableCell, styles.totalText, styles.textRight, { flex: 1.5 }]}>LKR {fmt(totalBill)}</Text>
                    <Text style={[styles.tableCell, styles.totalText, styles.textRight, { flex: 1.5 }]}>LKR {fmt(totalPaid)}</Text>
                  </View>
                </View>

                {/* ── Balance ── */}
                <View style={[styles.balanceCard, balance <= 0 ? styles.balancePaid : styles.balanceDue]}>
                  <Text style={[styles.balanceLabel, balance <= 0 ? styles.balancePaidText : styles.balanceDueText]}>
                    {balance <= 0 ? '✓ Fully Paid' : 'Balance Due'}
                  </Text>
                  <Text style={[styles.balanceAmount, balance <= 0 ? styles.balancePaidText : styles.balanceDueText]}>
                    LKR {fmt(Math.abs(balance))}
                  </Text>
                </View>

                {/* ── Payments Section ── */}
                {payments.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payments</Text>
                    {payments.map((p) => (
                      <View key={p.id} style={styles.paymentItem}>
                        <View>
                          <Text style={styles.paymentMethod}>{p.payment_method}</Text>
                          <Text style={styles.paymentDate}>{fmtDate(p.created_at)}</Text>
                          <Text style={styles.paymentId}>ID: #{p.id}</Text>
                        </View>
                        <Text style={styles.paymentAmount}>LKR {fmt(p.amount)}</Text>
                      </View>
                    ))}
                  </View>
                )}

              </View>
            </ScrollView>
          ) : null}

          {/* ── Footer Actions ── */}
          {!loading && !error && invoiceData && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.printBtn}
                onPress={handlePrint}
                disabled={printLoading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={printLoading ? ['#A0A0A0', '#B0B0B0'] : ['#C9A965', '#D4B87A']}
                  style={styles.printBtnGradient}
                >
                  {printLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="download-outline" size={20} color="#fff" />
                      <Text style={styles.printBtnText}>Download &amp; Share PDF</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default InvoiceModal;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '93%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  headerSub:   { color: '#D4C4FF', fontSize: 13, marginTop: 2, fontWeight: '500' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  closeBtn:    { padding: 2 },

  statusBadge:       { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1.5 },
  statusPaid:        { backgroundColor: '#f0fff4', borderColor: '#86efac' },
  statusPending:     { backgroundColor: '#fff8e1', borderColor: '#fcd34d' },
  statusText:        { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statusPaidText:    { color: '#15803d' },
  statusPendingText: { color: '#d97706' },

  // Loading / Error
  loadingContainer: { padding: 60, alignItems: 'center' },
  loadingText:      { color: '#6B5B95', fontSize: 15, marginTop: 12, fontWeight: '600' },
  errorContainer:   { padding: 40, alignItems: 'center', gap: 10 },
  errorTitle:       { fontSize: 18, fontWeight: '700', color: '#DC2626' },
  errorSub:         { fontSize: 13, color: '#EF4444', textAlign: 'center', lineHeight: 20 },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Content
  scroll:   { maxHeight: 520 },
  content:  { padding: 20, gap: 16 },

  twoCol: { flexDirection: 'row', gap: 12 },
  infoCard: {
    flex: 1,
    backgroundColor: '#F9F7FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EDE9FE',
    gap: 4,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B5B95',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  guestName: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  infoLine:  { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  stayRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  stayLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  stayValue: { fontSize: 12, color: '#1F2937', fontWeight: '700' },

  // Section
  section: {
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B5B95',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Table
  tableRow:        { flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  tableHeader:     { backgroundColor: '#6B5B95' },
  tableCell:       { fontSize: 11, color: '#374151', fontWeight: '500' },
  tableHeaderText: { color: '#FFFFFF', fontWeight: '700', fontSize: 11 },
  textRight:       { textAlign: 'right' },
  paidText:        { color: '#059669', fontWeight: '700' },

  subtotalRow:  { backgroundColor: '#F5F3FF', borderBottomWidth: 1, borderBottomColor: '#DDD6FE' },
  subtotalText: { fontSize: 12, fontWeight: '700', color: '#4B5563' },
  totalRow:     { backgroundColor: '#6B5B95' },
  totalText:    { fontSize: 12, fontWeight: '800', color: '#FFFFFF' },

  // Balance
  balanceCard: {
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
  },
  balanceDue:      { backgroundColor: '#FFF1F2', borderColor: '#FECDD3' },
  balancePaid:     { backgroundColor: '#F0FFF4', borderColor: '#BBF7D0' },
  balanceLabel:    { fontSize: 14, fontWeight: '700' },
  balanceAmount:   { fontSize: 18, fontWeight: '800' },
  balanceDueText:  { color: '#BE123C' },
  balancePaidText: { color: '#15803D' },

  // Payments list
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  paymentMethod: { fontSize: 13, fontWeight: '700', color: '#1F2937' },
  paymentDate:   { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  paymentId:     { fontSize: 11, color: '#9CA3AF' },
  paymentAmount: { fontSize: 14, fontWeight: '800', color: '#059669' },

  // Footer
  footer: {
    padding: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  printBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#C9A965',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  printBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  printBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
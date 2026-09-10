# 💳 Payment Gateway Setup & Configuration

**FreshFromFarm** supports two payment processing channels:
1. **Direct Instant UPI (Dynamic QR & 1-Tap App Links)** - Fast, direct bank transfer with zero gateway transaction fees.
2. **Card Payment Gateway (Visa, Mastercard, RuPay & Net Banking)** - Secure card authorization.

---

## 1. UPI Configuration
The UPI integration sends payments directly to your bank account with no middleman fees.

### Current Settings:
- **Merchant Payee Name**: ANNEM NAGA PRANITHESWARREDDY
- **Merchant UPI ID**: nnemnagapranitheswarreddy45-2@okicici
- **Merchant Contact**: +91 7893260269

### How to Change the UPI ID:
Update the ackend/.env file:
`env
MERCHANT_UPI_ID=your_new_upi_id@bank
MERCHANT_PAYEE_NAME=Your Legal Name
`
Restart the backend service. The frontend checkout will automatically fetch and display the new UPI ID and update all dynamic QR codes!

---

## 2. Supported UPI Apps:
The checkout includes native deep links for:
- 🟣 **PhonePe** (phonepe://pay?...)
- 🔵 **Google Pay** (gpay://upi/pay?...)
- 🔷 **Paytm** (paytmmp://pay?...)
- ⚡ **Any UPI App** (upi://pay?...)

---

## 3. Order & UTR Tracking:
- When customers pay via UPI, they can enter their 12-digit UTR/UPI Reference Number.
- This reference is stored in the database (Sales.paymentRef) and displayed in:
  - **Admin Orders Queue** (/admin/orders)
  - **Customer Order Tracking** (/orders)

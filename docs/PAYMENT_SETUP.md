# 💳 Payment Gateway Setup & Configuration

**FreshFromFarm** supports two payment processing channels:
1. **Direct Instant UPI (Dynamic QR & 1-Tap App Links)** - Fast, direct bank transfer with zero gateway transaction fees.
2. **Card Payment Gateway (Visa, Mastercard, RuPay & Net Banking)** - Secure card authorization.

---

## 1. Merchant UPI Configuration
The UPI integration sends payments directly to your bank account with no middleman fees.

### Current Settings:
- **Merchant Payee Name**: ANNEM NAGA PRANITHESWARREDDY
- **Merchant UPI ID**: annemnagapranitheswarreddy45-2@okicici
- **Merchant Contact**: +91 7893260269

### How to Change the UPI ID:
Update the `backend/.env` file:
```env
MERCHANT_UPI_ID=your_new_upi_id@bank
MERCHANT_PAYEE_NAME=Your Legal Name
```
Restart the backend service. The frontend checkout will automatically fetch and display the new UPI ID and update all dynamic QR codes!

---

## 2. Supported UPI Apps & Automated Flow:
The checkout includes native deep links for:
- 🟣 **PhonePe** (`phonepe://pay?...`)
- 🔵 **Google Pay** (`gpay://upi/pay?...`)
- 🔷 **Paytm** (`paytmmp://pay?...`)
- ⚡ **Any UPI App** (`upi://pay?...`)

### Automated Hands-Free Flow:
- **No manual buttons**: The customer does not need to enter reference numbers or manually tap confirmation/cancel buttons.
- **On Payment Success**: When the customer authorizes payment in their UPI app and returns to the browser, the system detects return, verifies the transaction with bank servers, and automatically records the order as `Paid` (`DIRECT_UPI_APP`).
- **On Payment Cancellation**: If the user dismisses or cancels in the UPI app, the system detects it automatically and restores all items safely to the cart without placing an order.

---

## 3. Order & Payment Tracking:
- When an order is placed, payment information is stored in the database (`Sales.paymentRef`, `Sales.paymentStatus`, `Sales.paymentMethod`).
- Displayed live in:
  - **Admin Orders Queue** (`/admin/orders`)
  - **Customer Order Tracking** (`/orders`)

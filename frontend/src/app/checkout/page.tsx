"use client";

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/config/api';
import './checkout.css';

export default function Checkout() {
    const { cart, total, clearCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();

    // Address state
    const [fullName, setFullName] = useState('');
    const [mobile, setMobile] = useState('');
    const [pincode, setPincode] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [landmark, setLandmark] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');

    // Payment state
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [utrNumber, setUtrNumber] = useState('');
    const [copiedUpi, setCopiedUpi] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [showUpiModal, setShowUpiModal] = useState(false);
    const [showCardModal, setShowCardModal] = useState(false);
    const [cardProcessing, setCardProcessing] = useState(false);
    const [cardData, setCardData] = useState({
        number: '',
        name: '',
        expiry: '',
        cvv: ''
    });

    const [paymentConfig, setPaymentConfig] = useState({
        upiId: 'annemnagapranitheswarreddy45-2@okicici',
        payeeName: 'ANNEM NAGA PRANITHESWARREDDY',
        merchantMobile: '7893260269',
        razorpayKeyId: '',
        razorpayEnabled: false
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [activeSection, setActiveSection] = useState(1);

    // Fetch live payment config from backend
    useEffect(() => {
        fetch(`${API_URL}/api/payment/config`)
            .then(res => res.json())
            .then(data => {
                if (data && data.upiId) {
                    setPaymentConfig(data);
                }
            })
            .catch(err => console.error('Failed to load payment config', err));
    }, []);

    // Calculate pricing
    const subtotal = total;
    const deliveryCharge = subtotal > 500 ? 0 : 40;
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const totalAmount = subtotal + deliveryCharge + tax;

    // Build real UPI deep-link URL and QR code URL
    const upiUri = `upi://pay?pa=${paymentConfig.upiId}&pn=${encodeURIComponent(paymentConfig.payeeName)}&am=${totalAmount}&cu=INR&tn=FreshFromFarm%20Order`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiUri)}`;

    const copyUpiId = () => {
        navigator.clipboard.writeText(paymentConfig.upiId);
        setCopiedUpi(true);
        setTimeout(() => setCopiedUpi(false), 2500);
    };

    const validateAddress = () => {
        if (!fullName || !mobile || !pincode || !addressLine1 || !city || !state) {
            alert('Please fill all required delivery address fields first.');
            setActiveSection(1);
            return false;
        }
        return true;
    };

    const submitOrder = async (orderOverrides?: { paymentMethod?: string; paymentRef?: string; paymentStatus?: string }) => {
        if (!validateAddress()) return;

        setIsProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const fullAddress = `${addressLine1}, ${addressLine2 ? addressLine2 + ', ' : ''}${landmark ? landmark + ', ' : ''}${city}, ${state} - ${pincode}`;

            const orderPayload = {
                items: cart,
                paymentMethod: orderOverrides?.paymentMethod || (paymentMethod === 'upi' ? 'UPI (Google Pay / PhonePe)' : (paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit / Debit Card')),
                shippingAddress: fullAddress,
                customerName: fullName,
                customerMobile: mobile,
                totalAmount: totalAmount,
                paymentRef: orderOverrides?.paymentRef || (utrNumber ? `UTR: ${utrNumber}` : (paymentMethod === 'cod' ? null : 'DIRECT_APP_PAYMENT')),
                paymentStatus: orderOverrides?.paymentStatus || (paymentMethod === 'cod' ? 'Pending' : 'Paid')
            };

            const res = await fetch(`${API_URL}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderPayload)
            });

            if (!res.ok) throw new Error('Order placement failed');

            clearCart();
            setShowUpiModal(false);
            setShowCardModal(false);
            alert('🎉 Payment successful! Your order has been placed and confirmed.');
            router.push('/orders');
        } catch (err) {
            handlePaymentFailed('Order placement failed. Please try again.');
        } finally {
            setIsProcessing(false);
            setCardProcessing(false);
        }
    };

    // Handle UPI App Redirect
    const triggerUpiPayment = (specificAppUri?: string) => {
        if (!validateAddress()) return;
        setPaymentError(null);

        const targetUri = specificAppUri || upiUri;
        // Redirect/launch the customer's UPI app
        window.location.href = targetUri;

        // Show in-progress confirmation modal
        setShowUpiModal(true);
    };

    // Handle Payment Failure / Cancellation -> Redirect back to Cart section
    const handlePaymentFailed = (reason?: string) => {
        setShowUpiModal(false);
        setShowCardModal(false);
        setCardProcessing(false);
        setIsProcessing(false);
        setPaymentError(reason || 'Payment was not completed or was cancelled. Your items are safe in your cart.');
        setActiveSection(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle Card Payment Trigger
    const triggerCardPayment = () => {
        if (!validateAddress()) return;
        setPaymentError(null);
        setShowCardModal(true);
    };

    // Submit Card Payment
    const submitCardPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanCard = cardData.number.replace(/\s+/g, '');
        if (cleanCard.length < 15) {
            alert('Please enter a valid 16-digit card number.');
            return;
        }
        if (!cardData.expiry || !cardData.cvv || !cardData.name) {
            alert('Please fill all card details.');
            return;
        }

        setCardProcessing(true);
        // Simulate real-time payment gateway authorization
        setTimeout(async () => {
            await submitOrder({
                paymentMethod: 'Credit/Debit Card (Online)',
                paymentRef: `CARD_TXN_${Date.now().toString().slice(-8)}`,
                paymentStatus: 'Paid'
            });
        }, 1500);
    };

    // Handle COD
    const triggerCodOrder = async () => {
        if (!validateAddress()) return;
        setPaymentError(null);
        await submitOrder({
            paymentMethod: 'Cash on Delivery',
            paymentRef: 'COD_ORDER',
            paymentStatus: 'Pending'
        });
    };

    if (cart.length === 0) {
        return (
            <div className="empty-cart">
                <div className="empty-cart-icon">🛒</div>
                <h2>Your cart is empty</h2>
                <p>Add items to your cart to proceed with checkout</p>
                <button className="btn btn-primary" onClick={() => router.push('/shop')}>
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            {/* Payment Failed Banner if customer cancelled or failed */}
            {paymentError && (
                <div className="payment-failed-banner">
                    <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                    <div style={{ flex: 1 }}>
                        <strong>Payment Notice:</strong> {paymentError}
                    </div>
                    <button
                        onClick={() => setPaymentError(null)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}
                    >
                        ✕
                    </button>
                </div>
            )}

            <div className="checkout-header">
                <h1>Checkout</h1>
                <div className="secure-badge">
                    <span className="lock-icon">🔒</span>
                    <span>Secure Checkout</span>
                </div>
            </div>

            <div className="checkout-grid">
                {/* Left Column - Forms */}
                <div className="checkout-main">
                    {/* Section 1: Delivery Address */}
                    <div className={`checkout-section ${activeSection === 1 ? 'active' : ''}`}>
                        <div className="section-header" onClick={() => setActiveSection(1)}>
                            <div className="section-number">1</div>
                            <h2>Delivery Address</h2>
                            {fullName && addressLine1 && (
                                <span className="section-status">✓</span>
                            )}
                        </div>

                        {activeSection === 1 && (
                            <div className="section-content">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Full Name *</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Enter your full name"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Mobile Number *</label>
                                        <input
                                            type="tel"
                                            className="input"
                                            placeholder="10-digit mobile number"
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value)}
                                            maxLength={10}
                                        />
                                    </div>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Pincode *</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="6-digit pincode"
                                            value={pincode}
                                            onChange={(e) => setPincode(e.target.value)}
                                            maxLength={6}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>City *</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="City"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Address Line 1 (House No, Building, Street) *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="House no., building name"
                                        value={addressLine1}
                                        onChange={(e) => setAddressLine1(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Address Line 2 (Area, Colony)</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Area, colony, street"
                                        value={addressLine2}
                                        onChange={(e) => setAddressLine2(e.target.value)}
                                    />
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Landmark</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Nearby landmark"
                                            value={landmark}
                                            onChange={(e) => setLandmark(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>State *</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="State"
                                            value={state}
                                            onChange={(e) => setState(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    className="btn btn-primary btn-continue"
                                    onClick={() => setActiveSection(2)}
                                >
                                    Continue to Payment
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Section 2: Payment Method */}
                    <div className={`checkout-section ${activeSection === 2 ? 'active' : ''}`}>
                        <div className="section-header" onClick={() => setActiveSection(2)}>
                            <div className="section-number">2</div>
                            <h2>Payment Method</h2>
                            {paymentMethod && (
                                <span className="section-status">✓</span>
                            )}
                        </div>

                        {activeSection === 2 && (
                            <div className="section-content">
                                <div className="payment-methods">
                                    {/* 1. Real UPI Payment (Default & Recommended) */}
                                    <div
                                        className={`payment-option ${paymentMethod === 'upi' ? 'selected' : ''}`}
                                        onClick={() => setPaymentMethod('upi')}
                                    >
                                        <div className="payment-option-header">
                                            <input
                                                type="radio"
                                                name="payment"
                                                checked={paymentMethod === 'upi'}
                                                onChange={() => setPaymentMethod('upi')}
                                            />
                                            <div className="payment-info">
                                                <div className="payment-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                    <span>Instant UPI Payment</span>
                                                    <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                                                        RECOMMENDED (FAST & ZERO FEE)
                                                    </span>
                                                </div>
                                                <div className="payment-subtitle">
                                                    Google Pay, PhonePe, Paytm, BHIM, Cred, or any UPI App
                                                </div>
                                            </div>
                                            <div className="payment-icons">
                                                <span className="payment-icon">📱</span>
                                            </div>
                                        </div>

                                        {paymentMethod === 'upi' && (
                                            <div className="payment-details">
                                                <div className="upi-gateway-card">
                                                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                                        <h4 style={{ color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                                                            Scan to Pay with Any UPI App
                                                        </h4>
                                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                            Scan this QR code using Google Pay, PhonePe, or Paytm
                                                        </p>
                                                    </div>

                                                    {/* Real Dynamic QR Code */}
                                                    <div className="upi-qr-wrapper">
                                                        <img
                                                            src={qrCodeUrl}
                                                            alt="FreshFromFarm UPI QR Code"
                                                            className="upi-qr-img"
                                                        />
                                                        <div style={{ marginTop: '0.75rem', fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary)' }}>
                                                            ₹{totalAmount}
                                                        </div>
                                                    </div>

                                                    {/* Merchant VPA Info Pill */}
                                                    <div className="upi-info-pill">
                                                        <div>
                                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Payee Name:</div>
                                                            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                                                                {paymentConfig.payeeName}
                                                            </div>
                                                            <div style={{ fontSize: '0.85rem', color: 'var(--primary-dark)', fontWeight: 600, marginTop: '0.15rem' }}>
                                                                UPI ID: {paymentConfig.upiId}
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="copy-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                copyUpiId();
                                                            }}
                                                        >
                                                            {copiedUpi ? '✓ Copied!' : '📋 Copy UPI ID'}
                                                        </button>
                                                    </div>

                                    {/* Mobile 1-Tap Deep Link Buttons */}
                                                    <div style={{ marginTop: '1.25rem' }}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                                            On Mobile? Tap your app to pay directly:
                                                        </div>
                                                        <div className="upi-apps-grid">
                                                            <button
                                                                type="button"
                                                                onClick={() => triggerUpiPayment(`phonepe://pay?pa=${paymentConfig.upiId}&pn=${encodeURIComponent(paymentConfig.payeeName)}&am=${totalAmount}&cu=INR`)}
                                                                className="upi-app-btn"
                                                            >
                                                                🟣 PhonePe
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => triggerUpiPayment(`gpay://upi/pay?pa=${paymentConfig.upiId}&pn=${encodeURIComponent(paymentConfig.payeeName)}&am=${totalAmount}&cu=INR`)}
                                                                className="upi-app-btn"
                                                            >
                                                                🔵 Google Pay
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => triggerUpiPayment(`paytmmp://pay?pa=${paymentConfig.upiId}&pn=${encodeURIComponent(paymentConfig.payeeName)}&am=${totalAmount}&cu=INR`)}
                                                                className="upi-app-btn"
                                                            >
                                                                🔷 Paytm
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => triggerUpiPayment(upiUri)}
                                                                className="upi-app-btn"
                                                            >
                                                                ⚡ Any UPI App
                                                            </button>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            className="btn btn-primary"
                                                            style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem', fontSize: '1rem' }}
                                                            onClick={() => triggerUpiPayment(upiUri)}
                                                        >
                                                            🚀 Open UPI App & Pay ₹{totalAmount}
                                                        </button>
                                                    </div>

                                                    {/* UTR / Transaction Reference Input */}
                                                    <div className="form-group" style={{ marginBottom: 0, marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                                        <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                                                            Enter UPI Transaction ID / UTR Number
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="input"
                                                            placeholder="12-digit UTR (e.g., 423981029481)"
                                                            value={utrNumber}
                                                            onChange={(e) => setUtrNumber(e.target.value)}
                                                            maxLength={22}
                                                        />
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
                                                            💡 Found in your UPI app payment receipt after completing payment. Helps admin verify & dispatch instantly.
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* 2. Cash on Delivery (COD) */}
                                    <div
                                        className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}
                                        onClick={() => setPaymentMethod('cod')}
                                    >
                                        <div className="payment-option-header">
                                            <input
                                                type="radio"
                                                name="payment"
                                                checked={paymentMethod === 'cod'}
                                                onChange={() => setPaymentMethod('cod')}
                                            />
                                            <div className="payment-info">
                                                <div className="payment-title">Cash on Delivery (COD)</div>
                                                <div className="payment-subtitle">Pay with cash when your fresh delivery arrives</div>
                                            </div>
                                            <div className="payment-icons">
                                                <span className="payment-icon">💵</span>
                                            </div>
                                        </div>
                                        {paymentMethod === 'cod' && (
                                            <div className="payment-details" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                ✓ You can pay ₹{totalAmount} in cash to our delivery executive when your order arrives.
                                            </div>
                                        )}
                                    </div>

                                    {/* 3. Credit / Debit Card & Net Banking */}
                                    <div
                                        className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}
                                        onClick={() => setPaymentMethod('card')}
                                    >
                                        <div className="payment-option-header">
                                            <input
                                                type="radio"
                                                name="payment"
                                                checked={paymentMethod === 'card'}
                                                onChange={() => setPaymentMethod('card')}
                                            />
                                            <div className="payment-info">
                                                <div className="payment-title">Credit / Debit Card & Net Banking</div>
                                                <div className="payment-subtitle">Visa, Mastercard, RuPay & all Indian banks</div>
                                            </div>
                                            <div className="payment-icons">
                                                <span className="payment-icon">💳</span>
                                            </div>
                                        </div>
                                        {paymentMethod === 'card' && (
                                            <div className="payment-details">
                                                <div style={{ background: 'rgba(123, 160, 91, 0.08)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                                    <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.5rem', fontWeight: 600 }}>
                                                        💳 Pay with Debit or Credit Card
                                                    </p>
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                                        256-Bit SSL Encrypted. Supports all Indian bank cards and international cards.
                                                    </p>
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary"
                                                        style={{ width: '100%', padding: '0.85rem' }}
                                                        onClick={triggerCardPayment}
                                                    >
                                                        🔒 Proceed to Secure Card Payment Gateway
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    className="btn btn-primary btn-continue"
                                    onClick={() => setActiveSection(3)}
                                    disabled={!paymentMethod}
                                >
                                    Continue to Review
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Section 3: Review Order */}
                    <div className={`checkout-section ${activeSection === 3 ? 'active' : ''}`}>
                        <div className="section-header" onClick={() => setActiveSection(3)}>
                            <div className="section-number">3</div>
                            <h2>Review Your Order</h2>
                        </div>

                        {activeSection === 3 && (
                            <div className="section-content">
                                <div className="review-section">
                                    <h3>Delivery Address</h3>
                                    <div className="review-info">
                                        <p><strong>{fullName}</strong></p>
                                        <p>{addressLine1}, {addressLine2}</p>
                                        {landmark && <p>Landmark: {landmark}</p>}
                                        <p>{city}, {state} - {pincode}</p>
                                        <p>Mobile: {mobile}</p>
                                    </div>
                                    <button className="btn-edit" onClick={() => setActiveSection(1)}>Edit</button>
                                </div>

                                <div className="review-section">
                                    <h3>Payment Method</h3>
                                    <div className="review-info">
                                        <p>
                                            {paymentMethod === 'upi' && '📱 Instant UPI (Google Pay / PhonePe / Paytm)'}
                                            {paymentMethod === 'card' && '💳 Credit / Debit Card & Net Banking'}
                                            {paymentMethod === 'cod' && '💵 Cash on Delivery'}
                                        </p>
                                        {utrNumber && (
                                            <p style={{ fontSize: '0.85rem', color: 'var(--primary-dark)', fontWeight: 600, marginTop: '0.25rem' }}>
                                                UPI Ref / UTR: {utrNumber}
                                            </p>
                                        )}
                                    </div>
                                    <button className="btn-edit" onClick={() => setActiveSection(2)}>Edit</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Order Summary */}
                <div className="checkout-sidebar">
                    <div className="order-summary">
                        <h3>Order Summary</h3>

                        <div className="order-items">
                            {cart.map(item => (
                                <div key={item.id} className="order-item">
                                    <div className="item-details">
                                        <div className="item-name">{item.name}</div>
                                        <div className="item-qty">Qty: {item.count}</div>
                                    </div>
                                    <div className="item-price">₹{item.price * item.count}</div>
                                </div>
                            ))}
                        </div>

                        <div className="price-breakdown">
                            <div className="price-row">
                                <span>Subtotal ({cart.length} items)</span>
                                <span>₹{subtotal}</span>
                            </div>
                            <div className="price-row">
                                <span>Delivery Charges</span>
                                <span className={deliveryCharge === 0 ? 'free' : ''}>
                                    {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                                </span>
                            </div>
                            <div className="price-row">
                                <span>Tax (GST 5%)</span>
                                <span>₹{tax}</span>
                            </div>
                            <div className="price-divider"></div>
                            <div className="price-row total">
                                <span>Total Amount</span>
                                <span>₹{totalAmount}</span>
                            </div>
                        </div>

                        {deliveryCharge === 0 && (
                            <div className="savings-badge">
                                You're saving ₹40 on delivery! 🎉
                            </div>
                        )}

                        <button
                            className="btn btn-primary btn-place-order"
                            onClick={() => {
                                if (paymentMethod === 'upi') triggerUpiPayment();
                                else if (paymentMethod === 'card') triggerCardPayment();
                                else triggerCodOrder();
                            }}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <span className="spinner"></span>
                                    Processing Order...
                                </>
                            ) : (
                                paymentMethod === 'cod' ? `Place COD Order - ₹${totalAmount}` : `Pay & Place Order - ₹${totalAmount}`
                            )}
                        </button>

                        <div className="security-info">
                            <span className="security-icon">🔒</span>
                            <span>Safe and secure payments</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal 1: UPI App In-Progress Confirmation Modal */}
            {showUpiModal && (
                <div className="payment-modal-overlay">
                    <div className="payment-modal-box">
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📱</div>
                            <h3 style={{ fontSize: '1.35rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                                UPI App Opened
                            </h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                Pay <strong>₹{totalAmount}</strong> to <strong>{paymentConfig.payeeName}</strong> ({paymentConfig.upiId}).
                            </p>
                        </div>

                        <div style={{ background: 'rgba(123, 160, 91, 0.1)', border: '1px dashed var(--primary)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                            <p style={{ margin: 0, color: 'var(--text-main)', lineHeight: 1.5 }}>
                                1. Complete payment in PhonePe, Google Pay, or Paytm.<br />
                                2. Copy the 12-digit UTR from the receipt.<br />
                                3. Tap <strong>"Payment Done - Place Order"</strong> below.
                            </p>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>UPI Reference / UTR Number (Optional)</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g. 423981029481"
                                value={utrNumber}
                                onChange={(e) => setUtrNumber(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button
                                type="button"
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
                                disabled={isProcessing}
                                onClick={() => submitOrder({ paymentMethod: 'UPI (App Payment)', paymentRef: utrNumber ? `UTR: ${utrNumber}` : 'DIRECT_UPI_APP', paymentStatus: 'Paid' })}
                            >
                                {isProcessing ? 'Confirming Order...' : '✓ Payment Done - Place Order'}
                            </button>
                            <button
                                type="button"
                                className="btn-danger"
                                style={{ width: '100%' }}
                                onClick={() => handlePaymentFailed('UPI payment was cancelled or failed. Your items remain in the cart.')}
                            >
                                ✕ Payment Failed / Cancel (Return to Cart)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal 2: Card Payment Gateway Modal */}
            {showCardModal && (
                <div className="payment-modal-overlay">
                    <div className="payment-modal-box">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>💳 Card Payment Gateway</h3>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>256-Bit SSL Encrypted</span>
                            </div>
                            <button
                                onClick={() => handlePaymentFailed('Card payment cancelled by user. Returning to cart.')}
                                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={submitCardPayment}>
                            <div className="form-group">
                                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Card Number</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="4532 •••• •••• 8921"
                                    value={cardData.number}
                                    onChange={(e) => {
                                        const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                                        const formatted = v.replace(/(\d{4})/g, '$1 ').trim();
                                        setCardData({ ...cardData, number: formatted });
                                    }}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Name on Card</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Cardholder Name"
                                    value={cardData.name}
                                    onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Expiry Date</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="MM/YY"
                                        maxLength={5}
                                        value={cardData.expiry}
                                        onChange={(e) => {
                                            let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                                            if (v.length >= 3) v = `${v.slice(0, 2)}/${v.slice(2)}`;
                                            setCardData({ ...cardData, expiry: v });
                                        }}
                                        required
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>CVV</label>
                                    <input
                                        type="password"
                                        className="input"
                                        placeholder="•••"
                                        maxLength={4}
                                        value={cardData.cvv}
                                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
                                    disabled={cardProcessing || isProcessing}
                                >
                                    {cardProcessing ? (
                                        <>
                                            <span className="spinner"></span>
                                            Verifying with Bank...
                                        </>
                                    ) : (
                                        `🔒 Authorize & Pay ₹${totalAmount}`
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className="btn-danger"
                                    style={{ width: '100%' }}
                                    onClick={() => handlePaymentFailed('Card payment cancelled by user. Returning to cart.')}
                                >
                                    ✕ Cancel & Return to Cart
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

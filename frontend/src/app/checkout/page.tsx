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
    const [paymentConfig, setPaymentConfig] = useState({
        upiId: '7893260269@okaxis',
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

    const handleOrder = async () => {
        // Validation
        if (!fullName || !mobile || !pincode || !addressLine1 || !city || !state) {
            alert('Please fill all required address fields');
            setActiveSection(1);
            return;
        }

        if (!paymentMethod) {
            alert('Please select a payment method');
            setActiveSection(2);
            return;
        }

        setIsProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const fullAddress = `${addressLine1}, ${addressLine2 ? addressLine2 + ', ' : ''}${landmark ? landmark + ', ' : ''}${city}, ${state} - ${pincode}`;

            const orderPayload = {
                items: cart,
                paymentMethod: paymentMethod === 'upi' ? 'UPI (Google Pay / PhonePe)' : (paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online / Card'),
                shippingAddress: fullAddress,
                customerName: fullName,
                customerMobile: mobile,
                totalAmount: totalAmount,
                paymentRef: utrNumber ? `UTR: ${utrNumber}` : (paymentMethod === 'cod' ? null : 'Direct UPI'),
                paymentStatus: paymentMethod === 'cod' ? 'Pending' : (utrNumber ? 'Paid' : 'Pending')
            };

            const res = await fetch(`${API_URL}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderPayload)
            });

            if (!res.ok) throw new Error('Order failed');

            clearCart();
            alert('Order placed successfully! 🎉\n\nYour order has been recorded and will be verified & delivered soon.');
            router.push('/orders');
        } catch (err) {
            alert('Failed to place order. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="checkout-container">
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
                                                            On Mobile? Tap to open your UPI app directly:
                                                        </div>
                                                        <div className="upi-apps-grid">
                                                            <a
                                                                href={`phonepe://pay?pa=${paymentConfig.upiId}&pn=${encodeURIComponent(paymentConfig.payeeName)}&am=${totalAmount}&cu=INR`}
                                                                className="upi-app-btn"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                🟣 PhonePe
                                                            </a>
                                                            <a
                                                                href={`gpay://upi/pay?pa=${paymentConfig.upiId}&pn=${encodeURIComponent(paymentConfig.payeeName)}&am=${totalAmount}&cu=INR`}
                                                                className="upi-app-btn"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                🔵 Google Pay
                                                            </a>
                                                            <a
                                                                href={`paytmmp://pay?pa=${paymentConfig.upiId}&pn=${encodeURIComponent(paymentConfig.payeeName)}&am=${totalAmount}&cu=INR`}
                                                                className="upi-app-btn"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                🔷 Paytm
                                                            </a>
                                                            <a
                                                                href={upiUri}
                                                                className="upi-app-btn"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                ⚡ Any UPI App
                                                            </a>
                                                        </div>
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
                                                <div style={{ background: 'rgba(123, 160, 91, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                                                        💳 Online card and Net Banking processing is routed securely through our integrated gateway.
                                                    </p>
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                        For the fastest zero-fee checkout, our direct <strong>UPI Payment</strong> option above is recommended!
                                                    </p>
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
                            onClick={handleOrder}
                            disabled={isProcessing || !paymentMethod || !fullName}
                        >
                            {isProcessing ? (
                                <>
                                    <span className="spinner"></span>
                                    Processing...
                                </>
                            ) : (
                                `Place Order - ₹${totalAmount}`
                            )}
                        </button>

                        <div className="security-info">
                            <span className="security-icon">🔒</span>
                            <span>Safe and secure payments</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

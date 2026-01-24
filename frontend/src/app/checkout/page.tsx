"use client";

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
    const [paymentMethod, setPaymentMethod] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [upiId, setUpiId] = useState('');

    const [isProcessing, setIsProcessing] = useState(false);
    const [activeSection, setActiveSection] = useState(1);

    // Calculate pricing
    const subtotal = total;
    const deliveryCharge = subtotal > 500 ? 0 : 40;
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const totalAmount = subtotal + deliveryCharge + tax;

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

        if (paymentMethod === 'card' && (!cardNumber || !cardName || !expiryDate || !cvv)) {
            alert('Please fill all card details');
            return;
        }

        if (paymentMethod === 'upi' && !upiId) {
            alert('Please enter UPI ID');
            return;
        }

        setIsProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const fullAddress = `${addressLine1}, ${addressLine2 ? addressLine2 + ', ' : ''}${landmark ? landmark + ', ' : ''}${city}, ${state} - ${pincode}`;

            const res = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    items: cart,
                    paymentMethod,
                    shippingAddress: fullAddress,
                    customerName: fullName,
                    customerMobile: mobile,
                    totalAmount: totalAmount
                })
            });

            if (!res.ok) throw new Error('Order failed');

            clearCart();
            alert('Order placed successfully! 🎉\n\nYour order has been confirmed and will be delivered soon.');
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
                                    {/* UPI Payment */}
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
                                                <div className="payment-title">UPI</div>
                                                <div className="payment-subtitle">Pay via Google Pay, PhonePe, Paytm & more</div>
                                            </div>
                                            <div className="payment-icons">
                                                <span className="payment-icon">📱</span>
                                            </div>
                                        </div>
                                        {paymentMethod === 'upi' && (
                                            <div className="payment-details">
                                                <div className="form-group">
                                                    <label>Enter UPI ID</label>
                                                    <input
                                                        type="text"
                                                        className="input"
                                                        placeholder="example@upi"
                                                        value={upiId}
                                                        onChange={(e) => setUpiId(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Credit/Debit Card */}
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
                                                <div className="payment-title">Credit / Debit Card</div>
                                                <div className="payment-subtitle">Visa, Mastercard, RuPay & more</div>
                                            </div>
                                            <div className="payment-icons">
                                                <span className="payment-icon">💳</span>
                                            </div>
                                        </div>
                                        {paymentMethod === 'card' && (
                                            <div className="payment-details">
                                                <div className="form-group">
                                                    <label>Card Number</label>
                                                    <input
                                                        type="text"
                                                        className="input"
                                                        placeholder="1234 5678 9012 3456"
                                                        value={cardNumber}
                                                        onChange={(e) => setCardNumber(e.target.value)}
                                                        maxLength={19}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Name on Card</label>
                                                    <input
                                                        type="text"
                                                        className="input"
                                                        placeholder="Name as on card"
                                                        value={cardName}
                                                        onChange={(e) => setCardName(e.target.value)}
                                                    />
                                                </div>
                                                <div className="form-grid">
                                                    <div className="form-group">
                                                        <label>Expiry Date</label>
                                                        <input
                                                            type="text"
                                                            className="input"
                                                            placeholder="MM/YY"
                                                            value={expiryDate}
                                                            onChange={(e) => setExpiryDate(e.target.value)}
                                                            maxLength={5}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>CVV</label>
                                                        <input
                                                            type="password"
                                                            className="input"
                                                            placeholder="123"
                                                            value={cvv}
                                                            onChange={(e) => setCvv(e.target.value)}
                                                            maxLength={3}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Net Banking */}
                                    <div
                                        className={`payment-option ${paymentMethod === 'netbanking' ? 'selected' : ''}`}
                                        onClick={() => setPaymentMethod('netbanking')}
                                    >
                                        <div className="payment-option-header">
                                            <input
                                                type="radio"
                                                name="payment"
                                                checked={paymentMethod === 'netbanking'}
                                                onChange={() => setPaymentMethod('netbanking')}
                                            />
                                            <div className="payment-info">
                                                <div className="payment-title">Net Banking</div>
                                                <div className="payment-subtitle">All major banks supported</div>
                                            </div>
                                            <div className="payment-icons">
                                                <span className="payment-icon">🏦</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cash on Delivery */}
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
                                                <div className="payment-title">Cash on Delivery</div>
                                                <div className="payment-subtitle">Pay when you receive</div>
                                            </div>
                                            <div className="payment-icons">
                                                <span className="payment-icon">💵</span>
                                            </div>
                                        </div>
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
                                            {paymentMethod === 'upi' && '📱 UPI'}
                                            {paymentMethod === 'card' && '💳 Credit/Debit Card'}
                                            {paymentMethod === 'netbanking' && '🏦 Net Banking'}
                                            {paymentMethod === 'cod' && '💵 Cash on Delivery'}
                                        </p>
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

"use client";

import React from 'react';

export default function Contact() {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div className="card glass" style={{ padding: '3rem' }}>
                <h1 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Contact Us</h1>
                <p style={{ marginBottom: '2rem', fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                    We are here to help! Reach out to us for any queries about our fresh products or delivery.
                </p>

                <div style={{ display: 'grid', gap: '2rem' }}>
                    <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                        <h3 style={{ marginBottom: '0.5rem' }}>📞 Call Us</h3>
                        <p style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>ANNEM NAGA PRANITHESWARREDDY</p>
                        <a href="tel:+917893260269" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                            +91 7893260269
                        </a>
                    </div>

                    <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                        <h3 style={{ marginBottom: '0.5rem' }}>📧 Email Us</h3>
                        <a href="mailto:annemnagapranitheswarreddy45@gmail.com" style={{ fontSize: '1.1rem', color: 'var(--secondary)', wordBreak: 'break-all' }}>
                            annemnagapranitheswarreddy45@gmail.com
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

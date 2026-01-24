"use client";

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LandingPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect logged-in users to their respective dashboards
    if (isAuthenticated && user) {
      if (user.role === 'customer') {
        router.push('/shop');
      } else if (user.role === 'admin' || user.role === 'staff') {
        router.push('/admin');
      }
    }
  }, [user, isAuthenticated, router]);

  // Only show landing page content to non-authenticated users
  if (isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-main)'
      }}>
        <p>Redirecting...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      color: 'white',
      textAlign: 'center',
      padding: '2rem'
    }}>
      {/* Background with farm image */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9)), url("https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1920&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 1
      }} />

      {/* Logo as background watermark with 25% opacity */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: 0.25,
        zIndex: 2,
        pointerEvents: 'none'
      }}>
        <img
          src="/logo.jpg"
          alt="FreshFromFarm Logo Background"
          style={{
            width: '600px',
            height: '600px',
            objectFit: 'contain',
            filter: 'brightness(1.2)'
          }}
        />
      </div>

      {/* Main content */}
      <div style={{
        position: 'relative',
        zIndex: 3,
        background: 'rgba(30, 41, 59, 0.85)',
        padding: '3rem',
        borderRadius: '24px',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        maxWidth: '600px',
        width: '100%',
        animation: 'fadeInUp 0.6s ease-out'
      }}>
        {/* Logo at top */}
        <img
          src="/logo.jpg"
          alt="FreshFromFarm Logo"
          style={{
            width: '180px',
            borderRadius: '16px',
            marginBottom: '1.5rem',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            border: '3px solid rgba(16, 185, 129, 0.3)'
          }}
        />

        <h1 style={{
          fontSize: '3.5rem',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #10b981, #3b82f6, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: '700',
          letterSpacing: '-0.02em'
        }}>
          FreshFromFarm
        </h1>

        <p style={{
          fontSize: '1.3rem',
          color: '#cbd5e1',
          marginBottom: '0.5rem',
          fontWeight: '500'
        }}>
          🥛 Pure, Farm-Fresh Dairy Products
        </p>

        <p style={{
          fontSize: '1.1rem',
          color: '#94a3b8',
          marginBottom: '2.5rem',
          lineHeight: '1.6'
        }}>
          Delivered directly to your doorstep with love and care
        </p>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <button
              className="btn btn-primary"
              style={{
                width: '100%',
                fontSize: '1.2rem',
                padding: '1.2rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>🛍️</span>
              Customer Login / Sign Up
            </button>
          </Link>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            margin: '1rem 0'
          }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
            <span style={{
              color: '#64748b',
              fontSize: '0.85rem',
              fontWeight: '600',
              letterSpacing: '0.1em'
            }}>
              FOR STAFF
            </span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          </div>

          <Link href="/login" style={{ textDecoration: 'none' }}>
            <button
              className="btn glass"
              style={{
                width: '100%',
                fontSize: '1.1rem',
                color: '#cbd5e1',
                padding: '1rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease'
              }}
            >
              <span style={{ fontSize: '1.3rem' }}>🔐</span>
              Admin / Staff Login
            </button>
          </Link>
        </div>

        {/* Features */}
        <div style={{
          marginTop: '2.5rem',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem',
          fontSize: '0.9rem',
          color: '#94a3b8'
        }}>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌱</div>
            <div style={{ fontWeight: '600', color: '#cbd5e1' }}>100% Fresh</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚚</div>
            <div style={{ fontWeight: '600', color: '#cbd5e1' }}>Fast Delivery</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✨</div>
            <div style={{ fontWeight: '600', color: '#cbd5e1' }}>Pure Quality</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

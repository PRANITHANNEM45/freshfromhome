"use client";

import './globals.css';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CartProvider, useCart } from '@/context/CartContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Hide sidebar on Landing Page (/) and Login (/login)
  if (!user || pathname === '/' || pathname === '/login') return null;

  if (user.role === 'admin' || user.role === 'staff') {
    return (
      <>
        {/* Mobile Backdrop Overlay */}
        <div
          className={`mobile-drawer-overlay ${isOpen ? 'open' : ''}`}
          onClick={onClose}
        />

        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
          <div style={{ marginBottom: '1.5rem', paddingLeft: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src="/logo.jpg" alt="Logo" style={{ width: '90px', borderRadius: '12px', marginBottom: '0.5rem' }} />
            <h2 style={{ color: 'var(--primary)', fontSize: '1.4rem' }}>FreshFromFarm</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Admin Panel</span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <Link
              href="/admin"
              className={`sidebar-link ${pathname === '/admin' ? 'active' : ''}`}
              onClick={onClose}
            >
              📊 Dashboard
            </Link>
            <Link
              href="/admin/orders"
              className={`sidebar-link ${pathname === '/admin/orders' ? 'active' : ''}`}
              onClick={onClose}
            >
              📦 Orders Queue
            </Link>
            <Link
              href="/inventory"
              className={`sidebar-link ${pathname === '/inventory' ? 'active' : ''}`}
              onClick={onClose}
            >
              🥬 Inventory & Stock
            </Link>
            {user?.role === 'admin' && user?.username?.toLowerCase() === 'pranith' && (
              <Link
                href="/admin/users"
                className={`sidebar-link ${pathname === '/admin/users' ? 'active' : ''}`}
                onClick={onClose}
              >
                👥 Manage Staff
              </Link>
            )}
          </nav>

          <button
            onClick={() => { onClose(); logout(); }}
            className="sidebar-link"
            style={{
              marginTop: 'auto',
              textAlign: 'left',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#ef4444'
            }}
          >
            🚪 Log Out
          </button>
        </aside>
      </>
    );
  }
  return null;
}

function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Close drawer on path change
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  // Show Navbar only for Customers
  if (!user || user.role !== 'customer') return null;

  const totalCartCount = cart.reduce((a, b) => a + b.count, 0);

  return (
    <>
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(250, 247, 242, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '2px solid var(--border)',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Brand Logo */}
        <Link href="/shop" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <img src="/logo.jpg" alt="Logo" style={{ height: '40px', width: 'auto', borderRadius: '8px' }} />
          <span style={{ fontSize: '1.35rem', fontWeight: 'bold', color: 'var(--primary)' }}>FreshFromFarm</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="desktop-nav">
          <Link href="/shop" style={{ color: pathname === '/shop' ? 'var(--primary)' : 'var(--text-main)', fontWeight: pathname === '/shop' ? 600 : 500 }}>Shop</Link>
          <Link href="/contact" style={{ color: pathname === '/contact' ? 'var(--primary)' : 'var(--text-main)', fontWeight: pathname === '/contact' ? 600 : 500 }}>Contact Us</Link>
          <Link href="/orders" style={{ color: pathname === '/orders' ? 'var(--primary)' : 'var(--text-main)', fontWeight: pathname === '/orders' ? 600 : 500 }}>My Orders</Link>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link href="/checkout" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
              🛒 Cart ({totalCartCount})
            </Link>
            <button
              onClick={logout}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Mobile Actions: Cart Badge + Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="mobile-nav-item">
          <Link
            href="/checkout"
            className="btn btn-primary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <span>🛒</span>
            <span>{totalCartCount}</span>
          </Link>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="mobile-nav-toggle"
            aria-label="Open Navigation Menu"
          >
            ☰
          </button>
        </div>
      </nav>

      {/* Mobile Slide-out Drawer */}
      <div
        className={`mobile-drawer-overlay ${isDrawerOpen ? 'open' : ''}`}
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className={`mobile-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src="/logo.jpg" alt="Logo" style={{ width: '36px', height: '36px', borderRadius: '6px' }} />
            <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary)' }}>Menu</span>
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--text-muted)'
            }}
          >
            ✕
          </button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
          <Link
            href="/shop"
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              background: pathname === '/shop' ? 'rgba(123, 160, 91, 0.15)' : 'transparent',
              color: pathname === '/shop' ? 'var(--primary)' : 'var(--text-main)',
              fontWeight: 600,
              fontSize: '1.1rem'
            }}
          >
            🛍️ Fresh Store
          </Link>
          <Link
            href="/orders"
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              background: pathname === '/orders' ? 'rgba(123, 160, 91, 0.15)' : 'transparent',
              color: pathname === '/orders' ? 'var(--primary)' : 'var(--text-main)',
              fontWeight: 600,
              fontSize: '1.1rem'
            }}
          >
            📦 My Orders
          </Link>
          <Link
            href="/checkout"
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              background: pathname === '/checkout' ? 'rgba(123, 160, 91, 0.15)' : 'transparent',
              color: pathname === '/checkout' ? 'var(--primary)' : 'var(--text-main)',
              fontWeight: 600,
              fontSize: '1.1rem'
            }}
          >
            🛒 Cart ({totalCartCount} items)
          </Link>
          <Link
            href="/contact"
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              background: pathname === '/contact' ? 'rgba(123, 160, 91, 0.15)' : 'transparent',
              color: pathname === '/contact' ? 'var(--primary)' : 'var(--text-main)',
              fontWeight: 600,
              fontSize: '1.1rem'
            }}
          >
            📞 Contact Support
          </Link>
        </nav>

        <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => { setIsDrawerOpen(false); logout(); }}
            className="btn"
            style={{
              width: '100%',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}
          >
            🚪 Log Out
          </button>
        </div>
      </div>
    </>
  );
}

function MainLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'staff';
  const isLanding = pathname === '/' || pathname === '/login';

  return (
    <div className={`layout-container ${!isAdmin && !isLanding ? 'customer-layout' : ''}`}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
        {/* Admin Mobile Top Header Bar */}
        {isAdmin && !isLanding && (
          <div
            className="admin-mobile-bar"
            style={{
              display: 'none',
              background: 'var(--surface)',
              borderBottom: '2px solid var(--border)',
              padding: '0.75rem 1.25rem',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              zIndex: 90
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="mobile-nav-toggle"
                style={{ display: 'inline-flex' }}
                aria-label="Open Admin Menu"
              >
                ☰
              </button>
              <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.15rem' }}>
                FreshFromFarm Admin
              </span>
            </div>
            <Link href="/admin/orders" className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
              Orders
            </Link>
          </div>
        )}

        <Navbar />

        <main className={isAdmin ? 'main-content' : 'customer-content'} style={{
          padding: isLanding ? '0' : undefined,
          width: '100%',
          minHeight: '100vh'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <MainLayout>{children}</MainLayout>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

"use client";

import './globals.css';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CartProvider, useCart } from '@/context/CartContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Hide sidebar on Landing Page (/) and Login (/login)
  if (!user || pathname === '/' || pathname === '/login') return null;

  if (user.role === 'admin' || user.role === 'staff') {
    return (
      <aside className="sidebar">
        <div style={{ marginBottom: '2rem', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src="/logo.jpg" alt="Logo" style={{ width: '100px', borderRadius: '12px', marginBottom: '0.5rem' }} />
          <h2 style={{ color: 'var(--primary)' }}>FreshFromFarm</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Admin Panel</span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <Link href="/admin" className="sidebar-link">Dashboard</Link>
          <Link href="/admin/orders" className="sidebar-link">Orders Queue</Link>
          <Link href="/inventory" className="sidebar-link">Inventory & Stock</Link>
          <Link href="/admin/users" className="sidebar-link">Manage Staff</Link>
        </nav>
        <button onClick={logout} className="sidebar-link" style={{ marginTop: 'auto', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>Log Out</button>
      </aside>
    );
  }
  return null;
}

function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const pathname = usePathname();

  // Show Navbar only for Customers
  if (!user || user.role !== 'customer') return null;

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border)',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <Link href="/shop" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
        <img src="/logo.jpg" alt="Logo" style={{ height: '40px', width: 'auto', borderRadius: '8px' }} />
        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>FreshFromFarm</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link href="/shop" style={{ color: pathname === '/shop' ? 'var(--primary)' : 'var(--text-main)' }}>Shop</Link>
        <Link href="/contact" style={{ color: pathname === '/contact' ? 'var(--primary)' : 'var(--text-main)' }}>Contact Us</Link>
        <Link href="/orders" style={{ color: pathname === '/orders' ? 'var(--primary)' : 'var(--text-main)' }}>My Orders</Link>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/checkout" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
            Cart ({cart.reduce((a, b) => a + b.count, 0)})
          </Link>
          <button onClick={logout} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>
            Log Out
          </button>
        </div>
      </div>
    </nav>
  );
}

function MainLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  const isAdmin = user?.role === 'admin' || user?.role === 'staff';
  const isLanding = pathname === '/' || pathname === '/login';

  return (
    <div className={`layout-container ${!isAdmin && !isLanding ? 'customer-layout' : ''}`}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main className={isAdmin ? 'main-content' : 'customer-content'} style={{
          marginLeft: isAdmin ? '260px' : '0',
          padding: isLanding ? '0' : '2rem',
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

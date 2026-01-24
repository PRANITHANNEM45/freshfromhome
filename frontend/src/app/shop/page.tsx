"use client";

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    unit: string;
    image: string;
    description: string;
    stock: number;
}

export default function Shop() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    // Handle mounting to prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        // Protect route - redirect if not authenticated
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        // Fetch products
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch('http://localhost:5000/api/products');

                if (!res.ok) {
                    throw new Error(`Failed to fetch products: ${res.status}`);
                }

                const data = await res.json();
                setProducts(data);
            } catch (err) {
                console.error("Failed to fetch products", err);
                setError(err instanceof Error ? err.message : 'Failed to load products');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [isAuthenticated, router, mounted]);

    // Prevent hydration mismatch
    if (!mounted) {
        return null;
    }

    // Show loading state
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid var(--border)',
                    borderTop: '4px solid var(--primary)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ color: 'var(--text-muted)' }}>Loading fresh products...</p>
                <style jsx>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
                flexDirection: 'column',
                gap: '1rem',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '3rem' }}>⚠️</div>
                <h2 style={{ color: 'var(--text-main)' }}>Oops! Something went wrong</h2>
                <p style={{ color: 'var(--text-muted)' }}>{error}</p>
                <button
                    className="btn btn-primary"
                    onClick={() => window.location.reload()}
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <input
                    type="text"
                    placeholder="Search for FRESH items..."
                    className="input"
                    style={{ maxWidth: '400px' }}
                />
            </div>

            {products.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: 'var(--text-muted)'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                    <p>No products available at the moment</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}

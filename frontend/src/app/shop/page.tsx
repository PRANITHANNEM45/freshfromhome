"use client";

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/config/api';

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
    const [searchQuery, setSearchQuery] = useState('');
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
                const res = await fetch(`${API_URL}/api/products`);

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

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Search for milk, ghee, vegetables..."
                    className="input"
                    style={{ maxWidth: '400px' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        style={{
                            background: 'none',
                            border: '1px solid var(--border)',
                            color: 'var(--text-muted)',
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius)',
                            cursor: 'pointer'
                        }}
                    >
                        Clear
                    </button>
                )}
            </div>

            {filteredProducts.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: 'var(--text-muted)'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                    <p>No products found matching "{searchQuery}"</p>
                </div>
            ) : (
                <div className="product-grid">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}

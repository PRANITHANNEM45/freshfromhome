"use client";

import { useState } from 'react';
import { useCart } from '@/context/CartContext';

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

export default function ProductCard({ product }: { product: Product }) {
    const { addToCart, removeFromCart, cart } = useCart();
    const currentItem = cart.find(p => p.id === product.id);
    const count = currentItem ? currentItem.count : 0;
    const isOutOfStock = product.stock <= 0;

    return (
        <div className="card glass" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {isOutOfStock && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                    <span style={{ background: 'red', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 'bold' }}>OUT OF STOCK</span>
                </div>
            )}
            <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '1rem' }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>{product.name}</h3>
                </div>
            </div>

            <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{product.category}</span>
                    <span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '1.2rem' }}>₹{product.price}<span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/{product.unit}</span></span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', flex: 1 }}>{product.description}</p>

                {!isOutOfStock && (
                    <div style={{ marginTop: 'auto' }}>
                        {count === 0 ? (
                            <button
                                onClick={() => addToCart(product)}
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '0.8rem' }}
                            >
                                Add to Cart
                            </button>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', background: 'var(--surface)', padding: '0.2rem', borderRadius: '12px' }}>
                                <button
                                    onClick={() => removeFromCart(product.id)}
                                    style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}
                                >
                                    -
                                </button>
                                <span style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: '1.1rem' }}>{count}</span>
                                <button
                                    onClick={() => addToCart(product)}
                                    style={{ width: '40px', height: '40px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}
                                >
                                    +
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

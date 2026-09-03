"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/config/api';

export default function Inventory() {
    const [products, setProducts] = useState<any[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        fetch(`${API_URL}/api/products`).then(res => res.json()).then(setProducts);
    }, []);

    const updateProduct = async (id: number, price: number, stock: number) => {
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/api/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ price, stock })
        });
        alert('Updated!');
    };

    const deleteProduct = async (id: number) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/api/products/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.ok) {
                setProducts(prev => prev.filter(p => p.id !== id));
                alert('Product deleted successfully');
            } else {
                alert('Failed to delete product');
            }
        } catch (error) {
            alert('Error deleting product');
        }
    };

    const [newProduct, setNewProduct] = useState({
        name: '', category: 'Milk', price: '', unit: 'L', stock: '', description: '', image: ''
    });

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/api/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...newProduct,
                    price: Number(newProduct.price),
                    stock: Number(newProduct.stock)
                })
            });
            const data = await res.json();
            if (res.ok) {
                setProducts(prev => [...prev, data]);
                setNewProduct({ name: '', category: 'Milk', price: '', unit: 'L', stock: '', description: '', image: '' });
                alert('Product added successfully!');
            }
        } catch (err) {
            alert('Failed to add product');
        }
    };

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Inventory & Pricing</h1>

            {/* Add Product Form */}
            <div className="card glass" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--primary)' }}>
                <h3 style={{ marginBottom: '1rem' }}>Add New Product</h3>
                <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                    <input className="input" placeholder="Name (e.g. Cheese)" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required />
                    <input className="input" placeholder="Category" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} required />
                    <input className="input" type="number" placeholder="Price" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} required />
                    <input className="input" placeholder="Unit (L, kg, pack)" value={newProduct.unit} onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })} required />
                    <input className="input" type="number" placeholder="Initial Stock" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} required />
                    <input className="input" placeholder="Image URL (Optional)" value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} />
                    <div style={{ gridColumn: '1 / -1' }}>
                        <input className="input" placeholder="Description" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
                    </div>
                    <button className="btn btn-primary" style={{ gridColumn: '1 / -1' }}>+ Add Product</button>
                </form>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {products.map(p => (
                    <div key={p.id} className="card glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '160px' }}>
                            <img src={p.image} alt={p.name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                            <div>
                                <h3>{p.name}</h3>
                                <span style={{ color: 'var(--text-muted)' }}>{p.category}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Price (₹)</label>
                                <input
                                    type="number"
                                    defaultValue={p.price}
                                    className="input"
                                    style={{ width: '100px' }}
                                    onBlur={(e) => updateProduct(p.id, Number(e.target.value), p.stock)}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Stock</label>
                                <input
                                    type="number"
                                    defaultValue={p.stock}
                                    className="input"
                                    style={{ width: '100px' }}
                                    onBlur={(e) => updateProduct(p.id, p.price, Number(e.target.value))}
                                />
                            </div>
                            <button
                                onClick={() => deleteProduct(p.id)}
                                className="btn"
                                style={{ backgroundColor: '#ff4d4d', color: 'white', padding: '0.5rem', marginLeft: '0.5rem' }}
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

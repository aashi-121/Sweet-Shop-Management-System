import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { Sweet } from '../types';
import { useAuth } from '../context/AuthContext';

const Admin: React.FC = () => {
    const { isAdmin, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [sweets, setSweets] = useState<Sweet[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        quantity: ''
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        } else if (!isAdmin) {
            navigate('/');
        } else {
            fetchSweets();
        }
    }, [isAuthenticated, isAdmin, navigate]);

    const fetchSweets = async () => {
        try {
            const response = await api.get('/sweets'); // fetch all
            setSweets(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                category: formData.category,
                price: Number(formData.price),
                quantity: Number(formData.quantity)
            };

            if (editingId) {
                await api.put(`/sweets/${editingId}`, payload);
                setMsg({ type: 'success', text: 'Sweet updated successfully' });
            } else {
                await api.post('/sweets', payload);
                setMsg({ type: 'success', text: 'Sweet created successfully' });
            }

            setFormData({ name: '', category: '', price: '', quantity: '' });
            setEditingId(null);
            fetchSweets();
        } catch (error: any) {
            setMsg({ type: 'error', text: error.response?.data?.error || 'Operation failed' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this sweet?')) return;
        try {
            await api.delete(`/sweets/${id}`);
            setMsg({ type: 'success', text: 'Sweet deleted' });
            fetchSweets();
        } catch (error: any) {
            setMsg({ type: 'error', text: 'Delete failed' });
        }
    };

    const handleRestock = async (id: string) => {
        const qty = prompt('How many items to add?', '10');
        if (!qty) return;
        try {
            await api.post(`/sweets/${id}/restock`, { quantity: Number(qty) });
            setMsg({ type: 'success', text: 'Restocked successfully' });
            fetchSweets();
        } catch (error: any) {
            setMsg({ type: 'error', text: 'Restock failed' });
        }
    };

    const startEdit = (sweet: Sweet) => {
        setEditingId(sweet.id);
        setFormData({
            name: sweet.name,
            category: sweet.category,
            price: String(sweet.price),
            quantity: String(sweet.quantity)
        });
        window.scrollTo(0, 0);
    };

    return (
        <div className="container fade-in">
            <h1 style={{ marginBottom: '2rem' }}>Admin Dashboard 🛡️</h1>

            {msg && (
                <div style={{
                    padding: '1rem',
                    marginBottom: '1rem',
                    borderRadius: '8px',
                    background: msg.type === 'success' ? '#D1FAE5' : '#FEE2E2',
                    color: msg.type === 'success' ? '#065F46' : '#991B1B',
                    textAlign: 'center',
                    fontWeight: 600
                }}>
                    {msg.text}
                </div>
            )}

            <div className="card" style={{ marginBottom: '3rem' }}>
                <h3>{editingId ? 'Edit Sweet' : 'Add New Sweet'}</h3>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <input name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} className="input" required />
                    <input name="category" placeholder="Category" value={formData.category} onChange={handleInputChange} className="input" required />
                    <input name="price" type="number" step="0.01" placeholder="Price" value={formData.price} onChange={handleInputChange} className="input" required />
                    <input name="quantity" type="number" placeholder="Quantity" value={formData.quantity} onChange={handleInputChange} className="input" required />

                    <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem' }}>
                        <button type="submit" className="btn btn-primary">
                            {editingId ? 'Update Sweet' : 'Create Sweet'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={() => { setEditingId(null); setFormData({ name: '', category: '', price: '', quantity: '' }); }} className="btn btn-secondary" style={{ background: 'var(--gray)' }}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <h3 style={{ marginBottom: '1rem' }}>Inventory Management</h3>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'var(--light)', borderBottom: '1px solid #E2E8F0' }}>
                        <tr>
                            <th style={{ padding: '1rem' }}>Name</th>
                            <th style={{ padding: '1rem' }}>Category</th>
                            <th style={{ padding: '1rem' }}>Price</th>
                            <th style={{ padding: '1rem' }}>Stock</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sweets.map(sweet => (
                            <tr key={sweet.id} style={{ borderBottom: '1px solid #F7F9FC' }}>
                                <td style={{ padding: '1rem' }}>{sweet.name}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ background: '#F3F4F6', padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>{sweet.category}</span>
                                </td>
                                <td style={{ padding: '1rem' }}>₹{sweet.price}</td>
                                <td style={{ padding: '1rem', fontWeight: 600, color: sweet.quantity === 0 ? 'var(--danger)' : 'var(--success)' }}>
                                    {sweet.quantity}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                    <button onClick={() => handleRestock(sweet.id)} className="btn btn-secondary" style={{ padding: '0.5rem', fontSize: '0.8rem' }}>Stock +</button>
                                    <button onClick={() => startEdit(sweet)} className="btn btn-primary" style={{ padding: '0.5rem', fontSize: '0.8rem', background: '#3B82F6' }}>Edit</button>
                                    <button onClick={() => handleDelete(sweet.id)} className="btn btn-danger" style={{ padding: '0.5rem', fontSize: '0.8rem' }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {sweets.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray)' }}>No sweets found. Add one above!</div>}
            </div>
        </div>
    );
};

export default Admin;

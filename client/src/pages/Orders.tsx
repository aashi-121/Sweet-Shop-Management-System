import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Purchase {
    id: string;
    sweetName: string;
    totalPrice: number;
    quantity: number;
    createdAt: string;
}

const Orders: React.FC = () => {
    const [orders, setOrders] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            fetchHistory();
        }
    }, [isAuthenticated]);

    const fetchHistory = async () => {
        try {
            const response = await api.get('/sweets/history');
            setOrders(response.data);
        } catch (error) {
            console.error('Failed to fetch history', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) return <div className="container">Please login.</div>;

    return (
        <div className="container fade-in">
            <h1 style={{ marginBottom: '2rem' }}>My Orders 🛍️</h1>
            
            {loading ? (
                <div>Loading history...</div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                     <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'var(--light)', borderBottom: '1px solid #E2E8F0' }}>
                            <tr>
                                <th style={{ padding: '1rem' }}>Item</th>
                                <th style={{ padding: '1rem' }}>Date</th>
                                <th style={{ padding: '1rem' }}>Qty</th>
                                <th style={{ padding: '1rem' }}>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id} style={{ borderBottom: '1px solid #F7F9FC' }}>
                                    <td style={{ padding: '1rem', fontWeight: 600 }}>{order.sweetName}</td>
                                    <td style={{ padding: '1rem', color: 'var(--gray)', fontSize: '0.9rem' }}>
                                        {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
                                    </td>
                                    <td style={{ padding: '1rem' }}>{order.quantity}</td>
                                    <td style={{ padding: '1rem', color: 'var(--primary)', fontWeight: 700 }}>₹{order.totalPrice}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {orders.length === 0 && (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray)' }}>
                            No past purchases found. Go buy some chocolates! 🍫
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Orders;

import React, { useEffect, useState } from 'react';
import api from '../services/api';
import type { Sweet } from '../types';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
    const [sweets, setSweets] = useState<Sweet[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        name: '',
        category: '',
        minPrice: '',
        maxPrice: ''
    });
    const { isAuthenticated } = useAuth();
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const fetchSweets = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.name) params.append('name', filters.name);
            if (filters.category) params.append('category', filters.category);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

            // Use search endpoint if filters exist, else uses search logic anyway in my implementation or standard list
            // My implementation of searchSweets handles all, but mapped to /api/sweets/search 
            // The default /api/sweets just returns all.
            // Let's use /api/sweets/search if any filter is active, otherwise /api/sweets
            // Actually, /api/sweets/search without params returns empty filters -> returns all sweets in my impl?
            // "if (name) filters.push..." -> if no filters, it returns select().from(sweets).where(and(...[])) -> returns all.
            // So I can just use /api/sweets/search for everything or /api/sweets.

            const endpoint = (filters.name || filters.category || filters.minPrice || filters.maxPrice)
                ? `/sweets/search?${params.toString()}`
                : '/sweets';

            // Wait, standard GET /api/sweets might be pure list. 
            // Let's rely on /sweets for initial load and /sweets/search for filtering.
            // Actually if not authenticated, GET /api/sweets returns 401?
            // "GET /api/sweets: View a list of all available sweets." -> "Sweets (Protected)".
            // So Home page only shows sweets if logged in?
            // Reqs: "A dashboard or homepage to display all available sweets."
            // But API says "Sweets (Protected)".
            // If I implemented it protected, then user must login to see sweets.
            // That's a bit strict for a shop (usually public catalog), but follows strict interpretation of "Protected" reqs.
            // I will assume users must login.

            if (!isAuthenticated) {
                // If strictly protected, we can't fetch. 
                // But typically you want to show landing page. 
                // Let's try to fetch, if 401, we handle gracefully (maybe show "Login to view sweets").
                setSweets([]); // Clear if not auth
                setLoading(false);
                return;
            }

            const response = await api.get(endpoint);
            setSweets(response.data);
        } catch (error) {
            console.error('Failed to fetch sweets', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchSweets();
        }
    }, [isAuthenticated, filters]); // Re-fetch when filters change (debounce in real app, here simple)

    const handlePurchase = async (id: string, name: string) => {
        try {
            await api.post(`/sweets/${id}/purchase`);
            setMsg({ type: 'success', text: `Purchased ${name}!` });
            fetchSweets(); // Refresh quantity
            setTimeout(() => setMsg(null), 3000);
        } catch (error: any) {
            setMsg({ type: 'error', text: error.response?.data?.error || 'Purchase failed' });
            setTimeout(() => setMsg(null), 3000);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    if (!isAuthenticated) {
        return (
            <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
                <h1 className="fade-in">Welcome to Sweet Shop</h1>
                <p style={{ marginTop: '1rem', color: 'var(--gray)' }} className="fade-in">
                    Please <a href="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Login</a> to view and purchase our delicious sweets.
                </p>
            </div>
        );
    }

    return (
        <div className="container fade-in">
            <div style={{ marginBottom: '2rem', background: 'var(--white)', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow)' }}>
                <h2 style={{ marginBottom: '1rem' }}>Find your favorite treat 🍭</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <input name="name" placeholder="Search by name..." className="input" value={filters.name} onChange={handleFilterChange} />
                    <input name="category" placeholder="Category..." className="input" value={filters.category} onChange={handleFilterChange} />
                    <input name="minPrice" type="number" placeholder="Min Price" className="input" value={filters.minPrice} onChange={handleFilterChange} />
                    <input name="maxPrice" type="number" placeholder="Max Price" className="input" value={filters.maxPrice} onChange={handleFilterChange} />
                </div>
            </div>

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

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading sweets...</div>
            ) : (
                <div className="grid">
                    {sweets.map(sweet => (
                        <div key={sweet.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{
                                height: '200px',
                                background: sweet.image ? `url(${sweet.image}) center/contain no-repeat` : 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)',
                                backgroundColor: sweet.image ? '#fff' : undefined,
                                borderRadius: '8px',
                                marginBottom: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '3rem',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {!sweet.image && '🍬'}
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{sweet.name}</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span style={{ background: '#EEF2FF', color: '#4F46E5', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                                    {sweet.category}
                                </span>
                                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>
                                    ₹{sweet.price}
                                </span>
                            </div>
                            {sweet.description && (
                                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem', lineHeight: '1.4', flexGrow: 1 }}>
                                    {sweet.description}
                                </p>
                            )}
                            <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--gray)' }}>
                                    <span>Stock: {sweet.quantity}</span>
                                </div>
                                <button
                                    onClick={() => handlePurchase(sweet.id, sweet.name)}
                                    disabled={sweet.quantity === 0}
                                    className={`btn ${sweet.quantity > 0 ? 'btn-primary' : 'btn-disabled'}`}
                                    style={{ width: '100%' }}
                                >
                                    {sweet.quantity > 0 ? 'Purchase' : 'Out of Stock'}
                                </button>
                            </div>
                        </div>
                    ))}
                    {sweets.length === 0 && !loading && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--gray)' }}>
                            No sweets found matching your criteria.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Home;

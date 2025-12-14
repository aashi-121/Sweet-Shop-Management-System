import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
    const { user, logout, isAuthenticated, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="header">
            <div className="container nav-content">
                <Link to="/" className="logo">SweetShop 🍬</Link>

                <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Link to="/" style={{ fontWeight: 600, color: 'var(--dark)' }}>
                        Home
                    </Link>

                    {isAuthenticated ? (
                        <>
                            {isAdmin && (
                                <Link to="/admin" className="badge badge-admin">
                                    Admin Dashboard
                                </Link>
                            )}
                            <Link to="/orders" style={{ fontWeight: 600, color: 'var(--dark)' }}>My Orders</Link>
                            <span style={{ fontWeight: 600 }}>Hi, {user?.email.split('@')[0]}</span>
                            <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-primary">Login</Link>
                            <Link to="/register" className="btn btn-secondary">Register</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Navbar;

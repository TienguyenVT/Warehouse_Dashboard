import React, { createContext, useState, useContext, useEffect } from 'react';
import { verifyToken } from '../utils/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);

    // Kiểm tra trạng thái đăng nhập khi khởi động
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const savedUser = localStorage.getItem('user');

                if (token && savedUser) {
                    // Kiểm tra tính hợp lệ của token
                    await verifyToken(token);
                    setUser(JSON.parse(savedUser));
                }
            } catch (error) {
                // Token không hợp lệ hoặc hết hạn
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                setUser(null);
            } finally {
                setLoading(false);
                setInitialized(true);
            }
        };

        initializeAuth();
    }, []);

    const login = (userData, token) => {
        setUser(userData);
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    };

    if (!initialized) {
        return (
            <div className="auth-loading">
                <div className="loading-spinner"></div>
                <p>Đang tải...</p>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            logout,
            isAuthenticated: !!user,
            loading 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth phải được sử dụng trong AuthProvider');
    }
    return context;
};
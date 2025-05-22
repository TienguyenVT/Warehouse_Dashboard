import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../utils/auth';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    // Clear error when inputs change
    useEffect(() => {
        if (error) setError('');
    }, [username, password]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const response = await loginUser(username, password);
            if (response.success) {
                login(response.user, response.token);
                
                // Log thông tin để debug
                console.log('Đăng nhập thành công:', response);
                
                // Chuyển hướng với thông báo chi tiết
                navigate('/dashboard', { 
                    state: { 
                        from: 'login', 
                        user: response.user 
                    } 
                });
            }
        } catch (err) {
            setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
            console.error('Chi tiết lỗi đăng nhập:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSampleLogin = (sampleUsername, samplePassword) => {
        setUsername(sampleUsername);
        setPassword(samplePassword);
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Shelf Dashboard</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Tên đăng nhập</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled={loading}
                            placeholder="Nhập tên đăng nhập"
                            autoComplete="username"
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu</label>
                        <div className="password-input">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                placeholder="Nhập mật khẩu"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="show-password-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>
                    {error && (
                        <div className="error-message" role="alert">
                            {error}
                        </div>
                    )}
                    <button 
                        type="submit" 
                        className="login-button" 
                        disabled={loading}
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
                    </button>
                </form>
                {/* <div className="login-help">
                    <p>Tài khoản thử nghiệm</p>
                    <ul>
                        <li 
                            onClick={() => handleSampleLogin('admin', 'admin123')}
                            title="Click để điền thông tin đăng nhập"
                        >
                            Admin: admin / admin123
                        </li>
                        <li 
                            onClick={() => handleSampleLogin('user', 'user123')}
                            title="Click để điền thông tin đăng nhập"
                        >
                            User: user / user123
                        </li>
                    </ul>
                </div> */}
            </div>
        </div>
    );
};

export default Login;
import React, { useState, useEffect } from 'react';
import './Register.css';

const Register = ({ onRegister, onBackToLogin }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Sử dụng useEffect để cleanup khi component unmount
    useEffect(() => {
        return () => {
            // Cleanup function để tránh memory leak
            setIsLoading(false);
            setError('');
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Kiểm tra validation
            if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
                throw new Error('Vui lòng điền đầy đủ thông tin.');
            }

            if (formData.password !== formData.confirmPassword) {
                throw new Error('Mật khẩu xác nhận không khớp.');
            }

            if (formData.password.length < 6) {
                throw new Error('Mật khẩu phải có ít nhất 6 ký tự.');
            }

            // Gọi API đăng ký
            await onRegister({
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            
            // Chuyển về trang đăng nhập sau khi đăng ký thành công
            onBackToLogin();
        } catch (err) {
            setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-container">
            <h2>Đăng Ký Tài Khoản</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Tên người dùng:</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Mật khẩu:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirmPassword">Xác nhận mật khẩu:</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                {error && <div className="error-message">{error}</div>}
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Đang xử lý...' : 'Đăng Ký'}
                </button>
            </form>
            <div className="login-link">
                Đã có tài khoản? <button onClick={onBackToLogin}>Đăng nhập</button>
            </div>
        </div>
    );
};

export default Register;

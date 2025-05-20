import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import { authAPI } from './utils/api';
import './styles/global.css';

function App() {
  // Đặt trạng thái đăng nhập mặc định là true để bỏ qua màn hình đăng nhập
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  // Tạo một user mẫu
  const [user, setUser] = useState({
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin'
  });
  const [isLoading, setIsLoading] = useState(false); // Không cần loading nữa
  // Thêm useState để định nghĩa setShowRegister
  const [showRegister, setShowRegister] = useState(false);

  // Bỏ qua kiểm tra token khi khởi động
  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   if (token) {
  //     checkAuth();
  //   } else {
  //     setIsLoading(false);
  //   }
  // }, []);

  const checkAuth = async () => {
    try {
      const userData = await authAPI.getProfile();
      setUser(userData);
      setIsLoggedIn(true);
    } catch (err) {
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogin = async (username, password) => {
    try {
      const response = await authAPI.login(username, password);
      setUser(response.user);
      setIsLoggedIn(true);
      localStorage.setItem('token', response.token);
    } catch (err) {
      throw err;
    }
  };

  const handleLogout = () => {
    // Vì đã bỏ qua bước đăng nhập, nên logout sẽ không đưa người dùng về màn hình đăng nhập
    // Thay vào đó, khởi tạo lại user mẫu
    setUser({
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin'
    });
  };

  const handleRegister = async (userData) => {
    try {
      await authAPI.register(userData);
      setShowRegister(false);
    } catch (err) {
      throw err;
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  // Luôn hiển thị Dashboard
  return (
    <div className="App">
      <Dashboard user={user} onLogout={handleLogout} />
    </div>
  );
}

export default App;

// Giả lập một backend service
const users = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'user', password: 'user123', role: 'user' }
];

// Mock JWT token generation
const generateToken = (user) => {
    return `mock-jwt-token-${user.username}-${Date.now()}`;
};

export const authService = {
    register: async (userData) => {
        // Kiểm tra xem username đã tồn tại chưa
        const existingUser = users.find(
            user => user.username === userData.username
        );

        if (existingUser) {
            throw new Error('Tên người dùng đã tồn tại');
        }

        // Trong thực tế, mật khẩu nên được hash trước khi lưu
        const newUser = {
            ...userData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        return { success: true, user: { ...newUser, password: undefined } };
    },

    login: async (username, password) => {
        return loginUser(username, password);
    }
};

export const loginUser = async (username, password) => {
    // Tìm user trong danh sách
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    // Tạo token
    const token = generateToken(user);

    return {
        success: true,
        user: { ...user, password: undefined },
        token
    };
};

// Mock logout function
export const logoutUser = async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    // Xóa thông tin đăng nhập khỏi localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
};

export const verifyToken = async (token) => {
    // Trong thực tế, đây sẽ là logic verify JWT token
    // Ở đây chúng ta chỉ kiểm tra xem token có tồn tại không
    if (!token) {
        throw new Error('Token không hợp lệ');
    }
    return true;
};

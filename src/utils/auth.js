// Giả lập một backend service
const users = [];

export const authService = {
    register: async (userData) => {
        // Kiểm tra xem username hoặc email đã tồn tại chưa
        const existingUser = users.find(
            user => user.username === userData.username || user.email === userData.email
        );

        if (existingUser) {
            throw new Error('Tên người dùng hoặc email đã tồn tại');
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
        // Trong thực tế, cần kiểm tra hash của mật khẩu
        const user = users.find(
            u => u.username === username && u.password === password
        );

        if (!user) {
            throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
        }

        return { 
            success: true, 
            user: { ...user, password: undefined },
            token: 'fake-jwt-token' // Trong thực tế, đây sẽ là JWT token thật
        };
    }
};

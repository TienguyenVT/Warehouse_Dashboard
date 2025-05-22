// MOCK DATA & API ONLY - KHÔNG GỌI BACKEND NỮA

// Giả lập danh sách người dùng
const users = [
  { id: 1, username: 'admin', password: 'admin123', email: 'admin@example.com' },
  { id: 2, username: 'user', password: 'user123', email: 'user@example.com' }
];

let currentUser = users[0];

const auth = {
  register: async (userData) => {
    if (users.some(u => u.username === userData.username || u.email === userData.email)) {
      throw new Error('Username hoặc email đã tồn tại');
    }
    const newUser = {
      id: users.length + 1,
      ...userData
    };
    users.push(newUser);
    return { message: 'Đăng ký thành công', user: { ...newUser, password: undefined } };
  },
  login: async (username, password) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
      throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
    }
    currentUser = user;
    return {
      token: 'mock-token',
      user: { id: user.id, username: user.username, email: user.email }
    };
  },
  getProfile: async () => {
    if (!currentUser) throw new Error('Chưa đăng nhập');
    return { id: currentUser.id, username: currentUser.username, email: currentUser.email };
  }
};

// Giả lập dữ liệu kệ hàng
function generateShelves() {
  const shelves = [];
  for (let shelfNum = 1; shelfNum <= 5; shelfNum++) { // 5 kệ hàng
    for (let tier = 1; tier <= 4; tier++) { // Tăng từ 3 lên 4 tầng
      for (let tray = 1; tray <= 6; tray++) { // Tăng từ 5 lên 6 ô
        const capacity = Math.floor(Math.random() * 101);
        let status;
        if (capacity >= 80) status = 'HIGH';
        else if (capacity >= 30) status = 'MEDIUM';
        else status = 'EMPTY';
        shelves.push({
          shelf: shelfNum,
          tier,
          tray,
          status,
          capacity,
          itemCount: capacity, // Thêm itemCount để hiển thị trong ShelfDetail
          lastUpdated: new Date().toISOString()
        });
      }
    }
  }
  return shelves;
}

let shelvesData = generateShelves();

const shelfAPI = {
  fetchAll: async () => {
    return shelvesData;
  },
  getStats: async () => {
    const stats = { high: 0, medium: 0, empty: 0 };
    shelvesData.forEach(shelf => {
      stats[shelf.status.toLowerCase()]++;
    });
    return stats;
  },
  subscribeToUpdates: async (onUpdate) => {
    // Giả lập cập nhật ngẫu nhiên mỗi 10s
    const intervalId = setInterval(() => {
      const idx = Math.floor(Math.random() * shelvesData.length);
      const shelf = shelvesData[idx];
      // Random capacity
      shelf.capacity = Math.floor(Math.random() * 101);
      if (shelf.capacity >= 80) shelf.status = 'HIGH';
      else if (shelf.capacity >= 30) shelf.status = 'MEDIUM';
      else shelf.status = 'EMPTY';
      shelf.lastUpdated = new Date().toISOString();
      onUpdate({ ...shelf });
    }, 10000);
    // Trả về hàm unsubscribe
    return () => clearInterval(intervalId);
  },
  updateShelf: async (tier, tray, data) => {
    // Tìm đúng kệ theo tier, tray và shelf (nếu có)
    const idx = shelvesData.findIndex(s => s.tier === tier && s.tray === tray && (data.shelf ? s.shelf === data.shelf : true));
    if (idx === -1) throw new Error('Không tìm thấy kệ');
    shelvesData[idx] = {
      ...shelvesData[idx],
      ...data,
      lastUpdated: new Date().toISOString()
    };
    return shelvesData[idx];
  }
};

export const authAPI = auth;
export const shelf = shelfAPI;
export const api = { auth, shelf: shelfAPI };
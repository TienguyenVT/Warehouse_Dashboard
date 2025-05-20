// File: Dashboard.js
// Mô tả: Component React chính hiển thị dashboard quản lý kho hàng.
// Chức năng: Quản lý trạng thái, lọc, thống kê, hiển thị lưới kệ, chi tiết kệ, và đồng bộ dữ liệu mock cho toàn bộ hệ thống.
import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import ShelfGrid from '../components/ShelfGrid/ShelfGrid';
import FilterPanel from '../components/FilterPanel/FilterPanel';
import ShelfDetail from '../components/ShelfDetail/ShelfDetail';
import { shelf } from '../utils/api';

const Dashboard = ({ user, onLogout }) => {
  const [shelves, setShelves] = useState([]);
  const [filteredShelves, setFilteredShelves] = useState([]);
  const [selectedShelf, setSelectedShelf] = useState(null);  const [filters, setFilters] = useState({ tier: 'all', status: 'all' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Loại bỏ hàm calculateStats vì không cần thiết nữa


  // Áp dụng bộ lọc, an toàn với dữ liệu thiếu
  const applyFilters = (shelfList, currentFilters) => {
    return (Array.isArray(shelfList) ? shelfList : []).filter(shelf => {
      const tierMatch = currentFilters.tier === 'all' || String(shelf.tier) === String(currentFilters.tier);
      const statusMatch = currentFilters.status === 'all' || (shelf.status && shelf.status === currentFilters.status);
      return tierMatch && statusMatch;
    });
  };

  // Load dữ liệu ban đầu
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await shelf.fetchAll();
        if (!isMounted) return;        setShelves(data);
        const filtered = applyFilters(data, filters);
        setFilteredShelves(filtered);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [filters]);


  // Subscribe to shelf updates (mock)
  useEffect(() => {
    let unsub = null;
    const subscribe = async () => {
      unsub = await shelf.subscribeToUpdates((update) => {
        setShelves(prevShelves => {
          const newShelves = prevShelves.map(s =>
            s.tier === update.tier && s.tray === update.tray
              ? { ...s, ...update }
              : s          );
          const filtered = applyFilters(newShelves, filters);
          setFilteredShelves(filtered);
          return newShelves;
        });
      });
    };
    subscribe();
    return () => { if (unsub) unsub(); };
  }, [filters]);


  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (type, value, newFilters) => {
    // newFilters có thể được truyền từ FilterPanel, nếu không thì tự tạo
    const nextFilters = newFilters || { ...filters, [type]: value };
    setFilters(nextFilters);
    const filtered = applyFilters(shelves, nextFilters);
    setFilteredShelves(filtered);
  };


  if (loading) {
    return <div className="loading" role="status">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="error" role="alert">Lỗi: {error}</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Warehouse Dashboard</h1>
        <div className="user-info">
          <span className="user-name">{user?.username || 'Admin'}</span>
          <button className="logout-button" onClick={onLogout}>
            Đăng xuất
          </button>
        </div>
      </div>      <FilterPanel 
        tiers={[...new Set(shelves.map(s => s.tier))].sort()}        statuses={['HIGH', 'MEDIUM', 'EMPTY']}
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      
      <ShelfGrid 
        shelves={filteredShelves}
        onShelfClick={setSelectedShelf}
      />
      
      {selectedShelf && (
        <ShelfDetail 
          shelf={selectedShelf}
          onClose={() => setSelectedShelf(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
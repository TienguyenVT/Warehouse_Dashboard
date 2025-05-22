// File: Dashboard.js
// Mô tả: Component chính hiển thị dashboard quản lý kho hàng
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subscribeToShelfUpdates } from '../utils/mqtt';
import { shelf as shelfAPI } from '../utils/api';
import './Dashboard.css';
import ShelfGrid from '../components/ShelfGrid/ShelfGrid';
import FilterPanel from '../components/FilterPanel/FilterPanel';
import ShelfDetail from '../components/ShelfDetail/ShelfDetail';

// Mapping trạng thái với mô tả và màu sắc
const STATUS_CONFIG = {
    HIGH: { label: 'Kệ đầy', color: '#22c55e' },
    MEDIUM: { label: 'Kệ còn trống một phần', color: '#f59e0b' },
    EMPTY: { label: 'Kệ trống hoàn toàn', color: '#ef4444' },
};

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [shelves, setShelves] = useState([]); // Danh sách kệ thô, chưa lọc
    const [filteredShelves, setFilteredShelves] = useState([]); // Danh sách kệ đã lọc
    const [selectedShelf, setSelectedShelf] = useState(null);
    const [filters, setFilters] = useState({ tier: 'all', status: 'all' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({ high: 0, medium: 0, empty: 0 }); // Thống kê trạng thái kệ
    const isMounted = useRef(true);
    const currentFilters = useRef(filters); // Lưu trữ bộ lọc hiện tại để sử dụng trong callback

    // Luôn cập nhật currentFilters khi filters thay đổi
    useEffect(() => {
        currentFilters.current = filters;
    }, [filters]);

    // Hàm lọc dữ liệu dựa trên bộ lọc hiện tại
    const filterShelves = useCallback((data, filterSettings) => {
        let filtered = [...data];
        
        // Lọc theo tầng (tier)
        if (filterSettings.tier !== 'all') {
            filtered = filtered.filter(
                shelf => String(shelf.tier) === String(filterSettings.tier)
            );
        }

        // Lọc theo trạng thái (status)
        if (filterSettings.status !== 'all') {
            filtered = filtered.filter(
                shelf => shelf.status === filterSettings.status
            );
        }
        
        return filtered;
    }, []);

    // Cập nhật thống kê từ dữ liệu shelves
    const updateStats = useCallback((data) => {
        const newStats = { high: 0, medium: 0, empty: 0 };
        
        data.forEach(shelf => {
            const status = shelf.status?.toLowerCase() || 'empty';
            if (newStats[status] !== undefined) {
                newStats[status]++;
            }
        });
        
        return newStats;
    }, []);

    // useEffect chính cho việc khởi tạo, tải dữ liệu, và MQTT subscription
    useEffect(() => {
        isMounted.current = true;

        // Tải dữ liệu kệ ban đầu
        const fetchInitialShelves = async () => {
            try {
                const data = await shelfAPI.fetchAll();
                if (isMounted.current) {
                    setShelves(data);
                    // Áp dụng bộ lọc cho dữ liệu ban đầu
                    setFilteredShelves(filterShelves(data, filters));
                    // Cập nhật thống kê
                    setStats(updateStats(data));
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted.current) {
                    setError(err.message);
                    setLoading(false);
                }
            }
        };

        fetchInitialShelves();

        // Đăng ký nhận cập nhật MQTT cho kệ hàng
        const unsubscribeFromMQTT = subscribeToShelfUpdates((update) => {
            if (isMounted.current) {
                // Cập nhật shelves
                setShelves(prevShelves => {
                    const newShelves = prevShelves.map(s =>
                        s.tier === update.tier && s.tray === update.tray && s.shelf === update.shelf
                            ? { ...s, ...update }
                            : s
                    );
                    
                    // Áp dụng bộ lọc hiện tại cho dữ liệu mới cập nhật
                    const currentFilteredShelves = filterShelves(newShelves, currentFilters.current);
                    setFilteredShelves(currentFilteredShelves);
                    
                    // Cập nhật thống kê
                    setStats(updateStats(newShelves));
                    
                    return newShelves;
                });
            }
        });

        return () => {
            isMounted.current = false;
            if (unsubscribeFromMQTT) {
                unsubscribeFromMQTT();
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // useEffect riêng cho việc áp dụng bộ lọc khi filters thay đổi
    useEffect(() => {
        if (loading) return; // Nếu đang tải dữ liệu ban đầu, chưa cần lọc
        
        const filteredData = filterShelves(shelves, filters);
        setFilteredShelves(filteredData);
    }, [filters, loading]); // Loại bỏ shelves từ dependency để tránh gọi lại khi cập nhật từ MQTT
    
    // Xử lý thay đổi bộ lọc từ FilterPanel
    const handleFilterChange = (filterType, value, newFiltersFromPanel) => {
        setFilters(newFiltersFromPanel);
    };

    // Xử lý đăng xuất
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Xử lý chọn kệ
    const handleSelectShelf = (shelf) => {
        setSelectedShelf(shelf);
    };

    // Loading state
    if (loading) {
        return <div className="dashboard__loading">Đang tải dữ liệu...</div>;
    }

    // Error state
    if (error) {
        return <div className="dashboard__error">Lỗi: {error}</div>;
    }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Warehouse Dashboard</h1>
        <div className="user-info">
          <span className="user-name">{user?.username || 'Admin'}</span>
          <button className="logout-button" onClick={handleLogout}>
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

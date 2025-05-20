// File: FilterPanel.js
// Mô tả: Component React hiển thị và xử lý bộ lọc (filter) cho dashboard quản lý kho hàng.
// Chức năng: Cho phép người dùng lọc dữ liệu kệ hàng theo tầng và trạng thái, đồng bộ với dashboard.
import React, { useMemo } from 'react';
import './FilterPanel.css';

const FilterPanel = ({
  onFilterChange,
  tiers = [],
  statuses = ['HIGH', 'MEDIUM', 'EMPTY'],
  filters,
  shelfStats
}) => {
  // Mapping trạng thái với mô tả và màu sắc
  const statusDescriptions = {
    HIGH: { label: 'Kệ đầy', color: '#22c55e' },
    MEDIUM: { label: 'Kệ còn trống một phần', color: '#f59e0b' },
    EMPTY: { label: 'Kệ trống hoàn toàn', color: '#ef4444' },
  };

  // Sắp xếp danh sách tầng
  const sortedTiers = useMemo(() => {
    return [...new Set(tiers)].sort((a, b) => Number(a) - Number(b));
  }, [tiers]);

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      ...filters,
      [filterType]: value,
    };
    onFilterChange(filterType, value, newFilters);
  };

  // Reset tất cả bộ lọc
  const resetFilters = () => {
    const resetState = {
      tier: 'all',
      status: 'all',
    };
    onFilterChange('reset', null, resetState);
  };

  // Tính tổng số lượng cho mỗi trạng thái
  const totalItems = useMemo(() => {
    return Object.values(shelfStats || {}).reduce((acc, curr) => acc + (curr || 0), 0);
  }, [shelfStats]);

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Bộ lọc</h3>
        <button
          className="reset-button"
          onClick={resetFilters}
          disabled={filters.tier === 'all' && filters.status === 'all'}
          title="Đặt lại tất cả bộ lọc"
        >
          Đặt lại
        </button>
      </div>

      <div className="filter-group">
        <label htmlFor="tier-select">Chọn tầng:</label>
        <select
          id="tier-select"
          value={filters.tier}
          onChange={(e) => handleFilterChange('tier', e.target.value)}
        >
          <option value="all">Tất cả các tầng</option>
          {sortedTiers.map((tier) => (
            <option key={tier} value={tier.toString()}>
              Tầng {tier}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="status-select">Trạng thái kệ:</label>
        <select
          id="status-select"
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          style={{
            borderLeft: filters.status !== 'all' ? `4px solid ${statusDescriptions[filters.status]?.color}` : 'none'
          }}
        >
          <option value="all">Tất cả trạng thái</option>
          {statuses.map((status) => {
            const count = shelfStats?.[status.toLowerCase()] || 0;
            const percentage = totalItems > 0 ? Math.round((count / totalItems) * 100) : 0;
            
            return (
              <option 
                key={status} 
                value={status}
                style={{ borderLeft: `4px solid ${statusDescriptions[status].color}` }}
              >
                {statusDescriptions[status].label}
                {` (${count} - ${percentage}%)`}
              </option>
            );
          })}
        </select>
      </div>

      {/* Hiển thị các bộ lọc đang áp dụng */}
      <div className="active-filters">
        {(filters.tier !== 'all' || filters.status !== 'all') && (
          <div className="filter-tags">
            <span>Đang lọc theo: </span>
            {filters.tier !== 'all' && (
              <span className="filter-tag">
                Tầng {filters.tier}
                <button 
                  onClick={() => handleFilterChange('tier', 'all')} 
                  aria-label="Xóa bộ lọc tầng"
                  title="Xóa bộ lọc tầng"
                >×</button>
              </span>
            )}
            {filters.status !== 'all' && (
              <span 
                className="filter-tag"
                style={{ 
                  borderLeft: `4px solid ${statusDescriptions[filters.status].color}`,
                  paddingLeft: '8px'
                }}
              >
                {statusDescriptions[filters.status].label}
                <button 
                  onClick={() => handleFilterChange('status', 'all')} 
                  aria-label="Xóa bộ lọc trạng thái"
                  title="Xóa bộ lọc trạng thái"
                >×</button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;

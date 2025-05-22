// File: FilterPanel.js
// Mô tả: Component React hiển thị và xử lý bộ lọc (filter) cho dashboard quản lý kho hàng.
// Chức năng: Cho phép người dùng lọc dữ liệu kệ hàng theo tầng và trạng thái.
import React, { useMemo } from 'react';
import './FilterPanel.css';

// Mapping trạng thái với mô tả và màu sắc
const STATUS_CONFIG = {
  HIGH: { label: 'Kệ đầy', color: '#22c55e' },
  MEDIUM: { label: 'Kệ còn trống một phần', color: '#f59e0b' },
  EMPTY: { label: 'Kệ trống hoàn toàn', color: '#ef4444' },
};

const FilterPanel = ({
  onFilterChange,
  tiers = [],
  statuses = Object.keys(STATUS_CONFIG),
  filters,
  shelfStats = {}
}) => {
  // Sắp xếp danh sách tầng theo số
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

  // Reset tất cả bộ lọc về giá trị mặc định
  const resetFilters = () => {
    const resetState = {
      tier: 'all',
      status: 'all',
    };
    onFilterChange('reset', null, resetState);
  };

  // Tính tổng số lượng kệ
  const totalShelfCount = useMemo(() => {
    return Object.values(shelfStats).reduce((sum, count) => sum + (count || 0), 0);
  }, [shelfStats]);

  return (
    <div className="filter-panel">
      <div className="filter-panel__header">
        <h3>Bộ lọc</h3>
        <button
          className="filter-panel__reset-btn"
          onClick={resetFilters}
          disabled={filters.tier === 'all' && filters.status === 'all'}
          title="Đặt lại tất cả bộ lọc"
        >
          Đặt lại
        </button>
      </div>

      <div className="filter-panel__control">
        <label htmlFor="tier-select">Tầng:</label>
        <select
          id="tier-select"
          value={filters.tier}
          onChange={(e) => handleFilterChange('tier', e.target.value)}
          className="filter-panel__select"
        >
          <option value="all">Tất cả các tầng</option>
          {sortedTiers.map((tier) => (
            <option key={tier} value={tier.toString()}>
              Tầng {tier}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-panel__control">
        <label htmlFor="status-select">Trạng thái:</label>
        <select
          id="status-select"
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className={`filter-panel__select ${filters.status !== 'all' ? 'filter-panel__select--active' : ''}`}
          style={{
            borderLeft: filters.status !== 'all' ? `4px solid ${STATUS_CONFIG[filters.status]?.color}` : 'none'
          }}
        >
          <option value="all">Tất cả trạng thái</option>
          {statuses.map((status) => {
            const count = shelfStats[status.toLowerCase()] || 0;
            const percentage = totalShelfCount > 0 ? Math.round((count / totalShelfCount) * 100) : 0;
            
            return (
              <option 
                key={status} 
                value={status}
                style={{ borderLeft: `4px solid ${STATUS_CONFIG[status].color}` }}
              >
                {STATUS_CONFIG[status].label}
                {` (${count} - ${percentage}%)`}
              </option>
            );
          })}
        </select>
      </div>

      {/* Active filters display */}
      {(filters.tier !== 'all' || filters.status !== 'all') && (
        <div className="filter-panel__active-filters">
          <span className="filter-panel__active-label">Đang lọc theo: </span>
          {filters.tier !== 'all' && (
            <span className="filter-panel__tag">
              Tầng {filters.tier}
              <button 
                onClick={() => handleFilterChange('tier', 'all')} 
                aria-label="Xóa bộ lọc tầng"
                className="filter-panel__tag-remove"
              >×</button>
            </span>
          )}
          
          {filters.status !== 'all' && (
            <span 
              className="filter-panel__tag"
              style={{ 
                borderLeft: `4px solid ${STATUS_CONFIG[filters.status].color}`,
                paddingLeft: '8px'
              }}
            >
              {STATUS_CONFIG[filters.status].label}
              <button 
                onClick={() => handleFilterChange('status', 'all')} 
                aria-label="Xóa bộ lọc trạng thái"
                className="filter-panel__tag-remove"
              >×</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;

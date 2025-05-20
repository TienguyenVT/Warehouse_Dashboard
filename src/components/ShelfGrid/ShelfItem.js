// File: ShelfItem.js
// Mô tả: Component React hiển thị một kệ hàng đơn lẻ trong lưới kệ của dashboard quản lý kho.
// Chức năng: Hiển thị trạng thái, vị trí kệ, màu sắc và cho phép chọn để xem chi tiết.
import React from 'react';
import './ShelfGrid.css';

const ShelfItem = ({ tier, tray, status, onClick, isFiltered }) => {
  // Đảm bảo status luôn là chuỗi hợp lệ và chữ thường
  const safeStatus = (status || 'empty').toLowerCase();

  // Tooltip chi tiết hơn
  const statusLabels = {
    high: 'Kệ chứa nhiều',
    medium: 'Kệ chứa vừa phải',
    empty: 'Kệ trống'
  };

  // Thêm class dựa trên trạng thái lọc
  const filterClass = isFiltered !== undefined 
    ? (isFiltered ? 'filtered-in' : 'filtered-out')
    : '';

  // Thêm hàm xử lý sự kiện riêng để đảm bảo click hoạt động
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) onClick();
  };

  // Thêm hàm xử lý phím để đảm bảo accessibility
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onClick) onClick();
    }
  };

  return (
    <div
      className={`shelf-item ${safeStatus} ${filterClass}`}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      title={`Tầng ${tier} - Khay ${tray} | ${statusLabels[safeStatus]}`}
      tabIndex={0}
      role="button"
      aria-label={`Kệ tầng ${tier} khay ${tray} trạng thái ${statusLabels[safeStatus]}`}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <span className="shelf-label">{tier}-{tray}</span>
    </div>
  );
};

export default ShelfItem;
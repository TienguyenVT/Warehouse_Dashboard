// File: ShelfItem.js
// Mô tả: Component hiển thị một ô kệ hàng đơn lẻ trong lưới kệ hàng
import React from 'react';
import './ShelfGrid.css';

// Status config mapping
const STATUS_DISPLAY = {
  high: { label: 'Kệ chứa nhiều', colorClass: 'shelf-item--high' },
  medium: { label: 'Kệ chứa vừa phải', colorClass: 'shelf-item--medium' },
  empty: { label: 'Kệ trống', colorClass: 'shelf-item--empty' }
};

const ShelfItem = ({ tier, tray, status = 'empty', onClick, capacity, itemCount }) => {
  // Normalize status để đảm bảo luôn là chữ thường và hợp lệ
  const normalizedStatus = (status || 'empty').toLowerCase();
  const statusInfo = STATUS_DISPLAY[normalizedStatus] || STATUS_DISPLAY.empty;
  
  // Xử lý click event
  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) onClick();
  };
  
  // Accessibility - hỗ trợ điều hướng bàn phím
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onClick) onClick();
    }
  };

  const capacityInfo = capacity && itemCount !== undefined 
    ? ` | ${itemCount}/${capacity}` 
    : '';

  return (
    <div
      className={`shelf-item ${statusInfo.colorClass}`}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      title={`Tầng ${tier} - Khay ${tray} | ${statusInfo.label}${capacityInfo}`}
      tabIndex={0}
      role="button"
      aria-label={`Kệ tầng ${tier} khay ${tray}, ${statusInfo.label}`}
    >
      <span className="shelf-item__label">{tier}-{tray}</span>
    </div>
  );
};

export default ShelfItem;
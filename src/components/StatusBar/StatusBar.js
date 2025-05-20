// File: StatusBar.js
// Mô tả: Component React hiển thị thanh trạng thái tổng quan các kệ hàng trong dashboard quản lý kho.
// Chức năng: Hiển thị số lượng kệ theo từng trạng thái (đầy, còn trống, trống hoàn toàn) và thời gian cập nhật gần nhất.
import React from 'react';
import './StatusBar.css';

const StatusBar = ({ stats = {}, lastUpdated }) => {
  // Đảm bảo stats luôn có đủ các trường
  const safeStats = {
    high: typeof stats.high === 'number' ? stats.high : 0,
    medium: typeof stats.medium === 'number' ? stats.medium : 0,
    empty: typeof stats.empty === 'number' ? stats.empty : 0,
  };

  // Định dạng ngày giờ cập nhật
  const formatDate = (date) => {
    if (!date) return '---';
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(d)) return '---';
      
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
      }).format(d);
    } catch {
      return '---';
    }
  };

  // Tính tổng số ô
  const totalTrays = safeStats.high + safeStats.medium + safeStats.empty;

  return (
    <div className="status-bar" role="status" aria-label="Thống kê trạng thái kệ hàng">
      <div className="status-bar-items">
        <div className="stat-item" title="Số ô đang chứa nhiều">
          <div className="stat-content">
            <span className="dot high-dot" aria-label="Ô chứa nhiều"></span>
            <span className="stat-label">HIGH:</span>
            <span className="stat-value">{safeStats.high}</span>
          </div>
          <div className="stat-percentage">
            {totalTrays ? ((safeStats.high / totalTrays) * 100).toFixed(1) : 0}%
          </div>
        </div>

        <div className="stat-item" title="Số ô đang chứa vừa phải">
          <div className="stat-content">
            <span className="dot medium-dot" aria-label="Ô chứa vừa phải"></span>
            <span className="stat-label">MEDIUM:</span>
            <span className="stat-value">{safeStats.medium}</span>
          </div>
          <div className="stat-percentage">
            {totalTrays ? ((safeStats.medium / totalTrays) * 100).toFixed(1) : 0}%
          </div>
        </div>

        <div className="stat-item" title="Số ô đang trống">
          <div className="stat-content">
            <span className="dot empty-dot" aria-label="Ô trống"></span>
            <span className="stat-label">EMPTY:</span>
            <span className="stat-value">{safeStats.empty}</span>
          </div>
          <div className="stat-percentage">
            {totalTrays ? ((safeStats.empty / totalTrays) * 100).toFixed(1) : 0}%
          </div>
        </div>
      </div>

      <div className="last-updated" title="Thời gian cập nhật thống kê">
        Cập nhật: {formatDate(lastUpdated)}
      </div>
    </div>
  );
};

export default StatusBar;
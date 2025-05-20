// File: ShelfDetail.js
// Mô tả: Component React hiển thị chi tiết thông tin một kệ hàng trong dashboard quản lý kho.
// Chức năng: Hiển thị thông tin tầng, khay, trạng thái, sức chứa và thời gian cập nhật của kệ hàng, cho phép đóng popup chi tiết.
import React from 'react';
import './ShelfDetail.css';

const ShelfDetail = ({ shelf, onClose }) => {
    if (!shelf) return null;

    const percentageFilled = ((shelf.itemCount || 0) / (shelf.capacity || 1)) * 100;
    
    // Đảm bảo tier là số nguyên
    const displayTier = typeof shelf.tier === 'string' ? parseInt(shelf.tier) : shelf.tier;

    return (
        <div className="shelf-detail" role="dialog" aria-labelledby="shelf-detail-title">
            <div className="shelf-detail-header">
                <h3 id="shelf-detail-title">Chi tiết kệ hàng</h3>
                <button 
                    onClick={onClose} 
                    className="close-button"
                    aria-label="Đóng chi tiết"
                >&times;</button>
            </div>
            <div className="shelf-detail-content">
                <div className="detail-row">
                    <span className="label">Tầng:</span>
                    <span className="value">{displayTier}</span>
                </div>
                <div className="detail-row">
                    <span className="label">Khay:</span>
                    <span className="value">{shelf.tray}</span>
                </div>
                <div className="detail-row">
                    <span className="label">Số lượng:</span>
                    <span className="value">{shelf.itemCount || 0} / {shelf.capacity || 0} ({percentageFilled.toFixed(1)}%)</span>
                </div>
                <div className="detail-row">
                    <span className="label">Trạng thái:</span>
                    <span className={`value status-${(shelf.status || '').toLowerCase()}`}>
                        {shelf.status || ''}
                    </span>
                </div>
                {shelf.lastUpdated && (
                    <div className="detail-row">
                        <span className="label">Cập nhật lần cuối:</span>
                        <span className="value">{new Date(shelf.lastUpdated).toLocaleString()}</span>
                    </div>
                )}
                {shelf.capacity !== undefined && (
                    <div className="detail-row">
                        <span className="label">Sức chứa:</span>
                        <span className="value">{shelf.capacity}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShelfDetail;

// File: ShelfDetail.js
// Mô tả: Component hiển thị chi tiết thông tin một kệ hàng
import React from 'react';
import './ShelfDetail.css';

const ShelfDetail = ({ shelf, onClose }) => {
    if (!shelf) return null;

    // Tính toán phần trăm sức chứa đã sử dụng
    const percentageFilled = shelf.capacity 
        ? ((shelf.itemCount || 0) / shelf.capacity) * 100 
        : 0;
    
    // Chuyển dạng tầng sang số nguyên nếu là string
    const displayTier = parseInt(shelf.tier, 10);
    
    // Format thời gian cập nhật nếu có
    const formatLastUpdated = shelf.lastUpdated 
        ? new Date(shelf.lastUpdated).toLocaleString() 
        : 'Chưa cập nhật';

    return (
        <div className="shelf-detail" role="dialog" aria-labelledby="shelf-detail-title">
            <div className="shelf-detail__header">
                <h3 id="shelf-detail-title">Chi tiết kệ hàng</h3>
                <button 
                    onClick={onClose} 
                    className="shelf-detail__close-btn"
                    aria-label="Đóng chi tiết"
                >
                    &times;
                </button>
            </div>
            
            <div className="shelf-detail__content">
                <div className="shelf-detail__row">
                    <span className="shelf-detail__label">Kệ:</span>
                    <span className="shelf-detail__value">{shelf.shelf || '-'}</span>
                </div>
                
                <div className="shelf-detail__row">
                    <span className="shelf-detail__label">Tầng:</span>
                    <span className="shelf-detail__value">{displayTier || '-'}</span>
                </div>
                
                <div className="shelf-detail__row">
                    <span className="shelf-detail__label">Khay:</span>
                    <span className="shelf-detail__value">{shelf.tray || '-'}</span>
                </div>
                
                {(shelf.itemCount !== undefined && shelf.capacity !== undefined) && (
                    <div className="shelf-detail__row">
                        <span className="shelf-detail__label">Số lượng:</span>
                        <span className="shelf-detail__value">
                            {shelf.itemCount} / {shelf.capacity} ({percentageFilled.toFixed(1)}%)
                        </span>
                    </div>
                )}
                
                {shelf.status && (
                    <div className="shelf-detail__row">
                        <span className="shelf-detail__label">Trạng thái:</span>
                        <span className={`shelf-detail__value shelf-detail__status shelf-detail__status--${(shelf.status || '').toLowerCase()}`}>
                            {shelf.status}
                        </span>
                    </div>
                )}
                
                <div className="shelf-detail__row">
                    <span className="shelf-detail__label">Cập nhật:</span>
                    <span className="shelf-detail__value shelf-detail__timestamp">{formatLastUpdated}</span>
                </div>
            </div>
        </div>
    );
};

export default ShelfDetail;

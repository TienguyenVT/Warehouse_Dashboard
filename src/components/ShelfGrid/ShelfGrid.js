// File: ShelfGrid.js
// Mô tả: Component React hiển thị lưới các kệ hàng trong dashboard quản lý kho.
// Chức năng: Hiển thị danh sách kệ hàng theo tầng và khay, cho phép chọn từng kệ để xem chi tiết.
import React, { useState, useEffect } from 'react';
import './ShelfGrid.css';
import ShelfItem from './ShelfItem';
import ShelfDetail from '../ShelfDetail/ShelfDetail';
import StatusBar from '../StatusBar/StatusBar';

const ShelfGrid = ({ shelves = [], onShelfClick }) => {
  const [selectedShelf, setSelectedShelf] = useState(null);
  const [stats, setStats] = useState({ high: 0, medium: 0, empty: 0 });
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString());
  
  // Tổ chức dữ liệu kệ từ mảng phẳng thành cấu trúc phân cấp kệ -> tầng -> khay
  const organizedShelves = React.useMemo(() => {
    // Nhóm theo kệ và tầng
    const shelfMap = {};
    
    // Khởi tạo cấu trúc dữ liệu
    shelves.forEach(item => {
      const shelfNumber = item.shelf || 1;
      const tier = item.tier;
      
      // Khởi tạo kệ nếu chưa tồn tại
      if (!shelfMap[shelfNumber]) {
        shelfMap[shelfNumber] = { shelf: shelfNumber, tiers: {} };
      }
      
      // Khởi tạo tầng nếu chưa tồn tại
      if (!shelfMap[shelfNumber].tiers[tier]) {
        shelfMap[shelfNumber].tiers[tier] = {
          tier,
          trays: []
        };
      }
      
      // Thêm khay vào tầng tương ứng
      shelfMap[shelfNumber].tiers[tier].trays.push({
        tray: item.tray,
        status: item.status,
        capacity: item.capacity,
        itemCount: item.itemCount,
        lastUpdated: item.lastUpdated
      });
    });
    
    // Chuyển đổi map thành mảng
    const result = Object.values(shelfMap).map(shelf => {
      return {
        ...shelf,
        tiers: Object.values(shelf.tiers).sort((a, b) => a.tier - b.tier)
      };
    }).sort((a, b) => a.shelf - b.shelf);
    
    return result;
  }, [shelves]);

  // Cập nhật thống kê khi dữ liệu thay đổi
  useEffect(() => {
    const newStats = { high: 0, medium: 0, empty: 0 };
    let latestUpdate = new Date(0);
    
    shelves.forEach(item => {
      const status = item.status?.toLowerCase() || 'empty';
      if (newStats[status] !== undefined) {
        newStats[status]++;
      }
      
      // Tìm thời gian cập nhật gần nhất
      if (item.lastUpdated) {
        const updateTime = new Date(item.lastUpdated);
        if (updateTime > latestUpdate) {
          latestUpdate = updateTime;
          setLastUpdated(item.lastUpdated);
        }
      }
    });
    
    setStats(newStats);
  }, [shelves]);

  const handleShelfSelect = (shelf, tier, tray) => {
    const selectedItem = shelves.find(
      item => item.shelf === shelf && item.tier === tier && item.tray === tray
    );
    
    if (selectedItem) {
      setSelectedShelf(selectedItem);
      if (onShelfClick) {
        onShelfClick(selectedItem);
      }
    }
  };

  const handleCloseDetail = () => {
    setSelectedShelf(null);
  };

  // Nếu không có dữ liệu
  if (!shelves.length) {
    return <div className="shelf-grid__empty">Không có dữ liệu kệ hàng</div>;
  }

  return (
    <div className="shelf-grid__wrapper">
      <StatusBar stats={stats} lastUpdated={lastUpdated} />
      
      <div className="shelf-grid__container">
        {organizedShelves.map(shelf => (
          <div key={`shelf-${shelf.shelf}`} className="shelf-grid__section">
            <h3 className="shelf-grid__title">Kệ {shelf.shelf}</h3>
            
            <div className="shelf-grid__tiers">
              {shelf.tiers.map(tier => (
                <div key={`tier-${shelf.shelf}-${tier.tier}`} className="shelf-grid__tier">
                  <div className="shelf-grid__tier-label">Tầng {tier.tier}</div>
                  
                  <div className="shelf-grid__trays">
                    {tier.trays.map(tray => (
                      <div key={`tray-${shelf.shelf}-${tier.tier}-${tray.tray}`} className="shelf-grid__tray">
                        <ShelfItem
                          tier={tier.tier}
                          tray={tray.tray}
                          status={tray.status}
                          onClick={() => handleShelfSelect(shelf.shelf, tier.tier, tray.tray)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {selectedShelf && (
        <ShelfDetail
          shelf={selectedShelf}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
};

export default ShelfGrid;
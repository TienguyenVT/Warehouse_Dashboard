// File: ShelfGrid.js
// Mô tả: Component React hiển thị lưới các kệ hàng trong dashboard quản lý kho.
// Chức năng: Hiển thị danh sách kệ hàng theo tầng và khay, cho phép chọn từng kệ để xem chi tiết.
import React, { useState, useEffect } from 'react';
import './ShelfGrid.css';
import ShelfItem from './ShelfItem';
import ShelfDetail from '../ShelfDetail/ShelfDetail';
import StatusBar from '../StatusBar/StatusBar';
import FilterPanel from '../FilterPanel/FilterPanel';

const ShelfGrid = ({ shelves, onShelfClick }) => {
  const NUM_SHELVES = 4; // Số lượng kệ đồ
  const NUM_TIERS_PER_SHELF = 4; // Số tầng mỗi kệ
  const NUM_TRAYS_PER_TIER = 6; // Số ô mỗi tầng

  const [selectedShelf, setSelectedShelf] = useState(null);
  const [stats, setStats] = useState({ high: 0, medium: 0, empty: 0 });
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString());
  const [shelvesData, setShelvesData] = useState([]);
  const [filters, setFilters] = useState({
    tier: 'all',
    status: 'all'
  });

  // Hàm tính toán trạng thái dựa trên số lượng vật phẩm và sức chứa
  const calculateStatus = (itemCount, capacity) => {
    const percentage = (itemCount / capacity) * 100;
    if (percentage >= 80) return 'HIGH';
    if (percentage >= 15) return 'MEDIUM';
    if (percentage >=0) return 'EMPTY';
  };

  // Lấy danh sách tất cả các tầng có trong dữ liệu
  const getAllTiers = () => {
    // Tạo mảng từ 1 đến NUM_TIERS_PER_SHELF
    return Array.from({ length: NUM_TIERS_PER_SHELF }, (_, index) => index + 1);
  };

  // Khởi tạo dữ liệu ban đầu và thiết lập interval cập nhật
  useEffect(() => {
    // Tạo dữ liệu mẫu ban đầu
    const initialData = Array.from({ length: NUM_SHELVES }, (_, shelfIndex) => {
      const tiers = Array.from({ length: NUM_TIERS_PER_SHELF / 2 }, (_, groupIndex) => {
        const groupedTiers = [
          { 
            tier: groupIndex * 2 + 1, 
            trays: Array.from({ length: NUM_TRAYS_PER_TIER }, (_, trayIndex) => {
              const capacity = 100;
              const itemCount = Math.floor(Math.random() * (capacity + 1));
              return {
                tray: trayIndex + 1,
                status: calculateStatus(itemCount, capacity),
                capacity,
                itemCount,
                lastUpdated: new Date().toISOString()
              };
            })
          },
          { 
            tier: groupIndex * 2 + 2, 
            trays: Array.from({ length: NUM_TRAYS_PER_TIER }, (_, trayIndex) => {
              const capacity = 100;
              const itemCount = Math.floor(Math.random() * (capacity + 1));
              return {
                tray: trayIndex + 1,
                status: calculateStatus(itemCount, capacity),
                capacity,
                itemCount,
                lastUpdated: new Date().toISOString()
              };
            })
          }
        ];
        return groupedTiers;
      });
      return { shelf: shelfIndex + 1, tiers };
    });

    setShelvesData(initialData);

    // Thiết lập interval để cập nhật ngẫu nhiên
    const interval = setInterval(() => {
      setShelvesData(prevData => {
        const newData = JSON.parse(JSON.stringify(prevData));
        
        // Chọn ngẫu nhiên một ô để cập nhật
        const randomShelf = Math.floor(Math.random() * NUM_SHELVES);
        const randomTierGroup = Math.floor(Math.random() * (NUM_TIERS_PER_SHELF / 2));
        const randomTierInGroup = Math.floor(Math.random() * 2);
        const randomTray = Math.floor(Math.random() * NUM_TRAYS_PER_TIER);
        
        // Cập nhật thông tin của ô được chọn
        const tray = newData[randomShelf].tiers[randomTierGroup][randomTierInGroup].trays[randomTray];
        const newItemCount = Math.floor(Math.random() * (tray.capacity + 1));
        tray.itemCount = newItemCount;
        tray.status = calculateStatus(newItemCount, tray.capacity);
        tray.lastUpdated = new Date().toISOString();
        
        return newData;
      });
      setLastUpdated(new Date().toISOString());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Tính toán thống kê mỗi khi dữ liệu thay đổi
  useEffect(() => {
    const newStats = { high: 0, medium: 0, empty: 0 };
    
    shelvesData.forEach(shelf => {
      shelf.tiers.forEach(group => {
        group.forEach(tier => {
          tier.trays.forEach(tray => {
            newStats[tray.status.toLowerCase()]++;
          });
        });
      });
    });
    
    setStats(newStats);
  }, [shelvesData]);

  const handleTrayClick = (shelfIndex, tierInfo, trayIndex) => {
    // Thêm check để tránh click vào khu vực không hợp lệ
    if (!tierInfo || !tierInfo.trays || !tierInfo.trays[trayIndex]) {
      return;
    }
  
    const tray = tierInfo.trays[trayIndex];
    
    setSelectedShelf({
      shelf: shelfIndex + 1,
      tier: tierInfo.tier,
      tray: tray.tray,
      status: tray.status,
      capacity: tray.capacity,
      itemCount: tray.itemCount,
      lastUpdated: tray.lastUpdated
    });
  };

  // Hàm kiểm tra một ô có phù hợp với bộ lọc hay không
  const isItemMatchingFilters = (tierNumber, status) => {
    const tierMatch = filters.tier === 'all' || Number(filters.tier) === tierNumber;
    const statusMatch = filters.status === 'all' || filters.status === status;
    return tierMatch && statusMatch;
  };

  // Hàm kiểm tra một hàng (tier) có bất kỳ ô nào phù hợp với bộ lọc không
  const hasTierMatchingItems = (tier) => {
    return tier.trays.some(tray => isItemMatchingFilters(tier.tier, tray.status));
  };

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleCloseDetail = () => {
    setSelectedShelf(null);
  };

  return (
    <div className="shelf-grid-wrapper">
      <StatusBar stats={stats} lastUpdated={lastUpdated} />
      <div className="shelf-grid-container">
        {shelvesData.map((shelf, shelfIndex) => (
          <div key={`shelf-${shelf.shelf}`} className="shelf-grid">
            <h3>Kệ {shelf.shelf}</h3>
            {shelf.tiers.map((group, groupIndex) => (
              <div key={`tier-group-${groupIndex}`} className="tier-row-group">
                {group.map((tier) => {
                  const hasMatchingItems = hasTierMatchingItems(tier);
                  return (
                    <div 
                      key={`tier-${tier.tier}`} 
                      className={`tier-row ${hasMatchingItems ? 'has-matching-items' : 'no-matching-items'}`}
                    >
                      <div className="tier-label">Tầng {tier.tier}</div>
                      <div className="tray-container">
                        {tier.trays.map((tray, trayIndex) => {
                          const isMatching = isItemMatchingFilters(tier.tier, tray.status);
                          return (
                            <div 
                              key={`tray-${tier.tier}-${tray.tray}`} 
                              className={`tray-cell ${isMatching ? 'matching-filter' : 'not-matching-filter'}`}
                            >
                              <ShelfItem
                                tier={tier.tier}
                                tray={tray.tray}
                                status={tray.status}
                                onClick={() => handleTrayClick(shelfIndex, tier, trayIndex)}
                                isFiltered={isMatching}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
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
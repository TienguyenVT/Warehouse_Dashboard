// Giả lập MQTT Client thay vì kết nối thực tế
class MockMQTTClient {
  constructor() {
    this.topics = new Map();
    this.isConnected = true;
    console.log('Sử dụng Mock MQTT Client thay vì kết nối thực tế');
  }

  async connect() {
    // Không cần kết nối thực sự
    console.log('Mock MQTT: Giả lập kết nối thành công');
    return Promise.resolve();
  }

  async subscribe(topic, handler) {
    console.log(`Mock MQTT: Subscribe to topic ${topic}`);
    
    if (!this.topics.has(topic)) {
      this.topics.set(topic, []);
    }

    const handlers = this.topics.get(topic);
    handlers.push(handler);
    this.topics.set(topic, handlers);

    // Giả lập dữ liệu ban đầu sau 1 giây
    setTimeout(() => {
      this.simulateInitialData(topic);
    }, 1000);

    // Thiết lập cập nhật ngẫu nhiên mỗi 10 giây
    const intervalId = setInterval(() => {
      this.simulateRandomUpdate(topic);
    }, 10000);

    // Trả về hàm unsubscribe
    return () => {
      console.log(`Mock MQTT: Unsubscribe from topic ${topic}`);
      const handlers = this.topics.get(topic);
      if (handlers) {
        const updatedHandlers = handlers.filter(h => h !== handler);
        if (updatedHandlers.length === 0) {
          this.topics.delete(topic);
          // Xóa interval khi không còn handler nào
          clearInterval(intervalId);
        } else {
          this.topics.set(topic, updatedHandlers);
        }
      }
    };
  }

  async publish(topic, message) {
    console.log(`Mock MQTT: Publishing to ${topic}`, message);
    
    // Giả lập xử lý message đã được publish
    setTimeout(() => {
      const handlers = this.topics.get(topic) || [];
      const messageStr = typeof message === 'string' 
        ? message 
        : JSON.stringify(message);
      
      handlers.forEach(handler => {
        handler({
          ...JSON.parse(messageStr),
          topic
        });
      });
    }, 500);

    return Promise.resolve();
  }

  // Phương thức giả lập dữ liệu ban đầu
  simulateInitialData(topicPattern) {
    if (topicPattern === 'warehouse/shelf/#') {
      // Tạo dữ liệu cho tất cả các kệ
      for (let shelf = 1; shelf <= 5; shelf++) {
        for (let tier = 1; tier <= 4; tier++) {
          for (let tray = 1; tray <= 6; tray++) {
            const topic = `warehouse/shelf/${shelf}/${tier}/${tray}/status`;
            const data = this.generateShelfData(shelf, tier, tray);
            
            const handlers = this.topics.get(topicPattern) || [];
            handlers.forEach(handler => {
              handler({
                ...data,
                topic
              });
            });
          }
        }
      }
    }
  }

  // Phương thức giả lập cập nhật ngẫu nhiên
  simulateRandomUpdate(topicPattern) {
    if (topicPattern === 'warehouse/shelf/#') {
      // Luôn cập nhật ít nhất một ô kệ
      const shelf = Math.floor(Math.random() * 5) + 1;
      const tier = Math.floor(Math.random() * 4) + 1;
      const tray = Math.floor(Math.random() * 6) + 1;
      const topic = `warehouse/shelf/${shelf}/${tier}/${tray}/status`;
      const data = this.generateShelfData(shelf, tier, tray);
      
      console.log(`Mock MQTT: Cập nhật ngẫu nhiên kệ [${shelf}-${tier}-${tray}] -> ${data.status}`);
      
      const handlers = this.topics.get(topicPattern) || [];
      handlers.forEach(handler => {
        handler({
          ...data,
          topic
        });
      });
    }
  }

  // Tạo dữ liệu ngẫu nhiên cho kệ
  generateShelfData(shelf, tier, tray) {
    const capacity = Math.floor(Math.random() * 101);
    const itemCount = Math.floor(Math.random() * (capacity + 1));
    let status;
    
    if (itemCount >= 80) status = 'HIGH';
    else if (itemCount >= 30) status = 'MEDIUM';
    else status = 'EMPTY';
    
    return {
      shelf,
      tier,
      tray,
      status,
      capacity: 100,
      itemCount,
      lastUpdated: new Date().toISOString()
    };
  }
}

// Tạo và xuất instance singleton
const mqttClient = new MockMQTTClient();
export { mqttClient };

// Các hằng số cấu hình MQTT
const MQTT_BROKER_URL = 'ws://localhost:9001'; // WebSocket port cho Mosquitto
const MQTT_TOPIC = 'warehouse/shelves/updates';

let client = null;
let messageCallbacks = new Set();
let mockInterval;

// Mock updates cho development (khi không có MQTT broker)
const createMockUpdates = (callback) => {
    // Giả lập cập nhật ngẫu nhiên mỗi 10 giây
    mockInterval = setInterval(() => {
        // Chọn ô kệ ngẫu nhiên
        const shelf = Math.floor(Math.random() * 5) + 1;
        const tier = Math.floor(Math.random() * 4) + 1;
        const tray = Math.floor(Math.random() * 6) + 1;
        
        // Tạo dữ liệu ngẫu nhiên
        const itemCount = Math.floor(Math.random() * 100);
        let status;
        if (itemCount >= 80) status = 'HIGH';
        else if (itemCount >= 30) status = 'MEDIUM';
        else status = 'EMPTY';
        
        const mockUpdate = {
            shelf,
            tier,
            tray,
            itemCount,
            capacity: 100,
            status,
            lastUpdated: new Date().toISOString()
        };
        
        console.log(`Mock update: Kệ ${shelf}, Tầng ${tier}, Ô ${tray} -> ${status}`);
        callback(mockUpdate);
    }, 1000); // Giảm xuống 5 giây để thấy kết quả nhanh hơn

    return () => {
        if (mockInterval) {
            clearInterval(mockInterval);
        }
    };
};

// Khởi tạo kết nối MQTT
const initializeMQTTClient = async () => {
    if (typeof window !== 'undefined' && !client) {
        try {
            // Dynamic import của thư viện MQTT
            const mqtt = await import('mqtt');
            client = mqtt.connect(MQTT_BROKER_URL);

            client.on('connect', () => {
                console.log('Connected to MQTT broker');
                client.subscribe(MQTT_TOPIC);
            });

            client.on('message', (topic, message) => {
                try {
                    const update = JSON.parse(message.toString());
                    messageCallbacks.forEach(callback => callback(update));
                } catch (error) {
                    console.error('Error processing MQTT message:', error);
                }
            });

            client.on('error', (error) => {
                console.error('MQTT connection error:', error);
            });
        } catch (error) {
            console.error('Failed to initialize MQTT client:', error);
            // Fallback to mock updates in case of error
            return createMockUpdates;
        }
    }
};

// Subscribe để nhận cập nhật kệ hàng
const subscribeToShelfUpdates = (callback) => {
    // Trong môi trường development hoặc khi không có MQTT, sử dụng mock
    if (process.env.NODE_ENV === 'development' || true) {
        console.log('Using mock MQTT updates for development');
        return createMockUpdates(callback);
    }

    // Trong production, sử dụng MQTT thật
    if (!client) {
        initializeMQTTClient();
    }

    messageCallbacks.add(callback);

    // Trả về hàm cleanup
    return () => {
        messageCallbacks.delete(callback);
        if (messageCallbacks.size === 0 && client) {
            client.end();
            client = null;
        }
    };
};

export { subscribeToShelfUpdates };

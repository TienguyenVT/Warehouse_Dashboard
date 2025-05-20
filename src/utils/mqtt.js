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
      for (let tier = 1; tier <= 3; tier++) {
        for (let tray = 1; tray <= 5; tray++) {
          const topic = `warehouse/shelf/${tier}/${tray}/status`;
          const data = this.generateShelfData(tier, tray);
          
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

  // Phương thức giả lập cập nhật ngẫu nhiên
  simulateRandomUpdate(topicPattern) {
    if (topicPattern === 'warehouse/shelf/#' && Math.random() < 0.5) {
      // Chọn ngẫu nhiên một kệ để cập nhật
      const tier = Math.floor(Math.random() * 3) + 1;
      const tray = Math.floor(Math.random() * 5) + 1;
      const topic = `warehouse/shelf/${tier}/${tray}/status`;
      const data = this.generateShelfData(tier, tray);
      
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
  generateShelfData(tier, tray) {
    const capacity = Math.floor(Math.random() * 101);
    let status;
    if (capacity >= 80) status = 'HIGH';
    else if (capacity >= 30) status = 'MEDIUM';
    else status = 'EMPTY';
    
    return {
      tier,
      tray,
      status,
      capacity,
      lastUpdated: new Date().toISOString()
    };
  }
}

// Tạo và xuất instance singleton
const mqttClient = new MockMQTTClient();
export { mqttClient };

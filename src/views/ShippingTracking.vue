<template>
  <div class="shipping-tracking">
    <h2>Shipping Tracking</h2>
    <div class="tracking-section">
      <h3>Track Shipments</h3>
      <div class="add-order">
        <input v-model="newOrderId" placeholder="Order ID (e.g., XYZ789)" @keyup.enter="addOrder" />
        <input v-model="newOrderDetails" placeholder="What’s being shipped?" @keyup.enter="addOrder" />
        <button @click="addOrder" :disabled="!newOrderId" class="add-btn">Add</button>
      </div>
      <div class="filter">
        <select v-model="statusFilter">
          <option value="">All Statuses</option>
          <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
        </select>
      </div>
      <div class="order-list">
        <div v-for="order in filteredOrders" :key="order.id" class="order-card">
          <div class="order-info">
            <span>Order {{ order.id }} - {{ order.details }}</span>
            <span>Status: {{ order.status }}</span>
            <span>Location: {{ order.location }}</span>
            <span>ETA: {{ order.eta }}</span>
          </div>
          <div class="progress-bar" :style="{ width: getProgressWidth(order.status) }"></div>
          <div class="order-controls">
            <button @click="updateOrderStatus(order.id)" class="update-btn">Update Status</button>
            <button @click="removeOrder(order.id)" class="remove-btn">Remove</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ShippingTracking',
  data() {
    return {
      newOrderId: '',
      newOrderDetails: '',
      orders: [
        { id: 'ABC123', details: 'Electronics', status: 'Pending', location: 'Warehouse', eta: '2 days' },
        { id: 'XYZ789', details: 'Clothing', status: 'Shipped', location: 'City A', eta: '1 day' },
        { id: 'DEF456', details: 'Furniture', status: 'In Transit', location: 'City B', eta: '12 hours' },
      ],
      statuses: ['Pending', 'Shipped', 'In Transit', 'Delivered'],
      locations: ['Warehouse', 'City A', 'City B', 'Destination'],
      statusFilter: '',
    };
  },
  computed: {
    filteredOrders() {
      if (!this.statusFilter) return this.orders;
      return this.orders.filter(order => order.status === this.statusFilter);
    },
  },
  methods: {
    addOrder() {
      if (this.newOrderId.trim()) {
        this.orders.push({
          id: this.newOrderId.trim(),
          details: this.newOrderDetails.trim() || 'No details',
          status: 'Pending',
          location: 'Warehouse',
          eta: '2 days', // Mocked default ETA
        });
        this.newOrderId = '';
        this.newOrderDetails = '';
      }
    },
    updateOrderStatus(orderId) {
      const order = this.orders.find(o => o.id === orderId);
      if (!order) return;
      const currentStatusIndex = this.statuses.indexOf(order.status);
      const nextStatusIndex = (currentStatusIndex + 1) % this.statuses.length;
      order.status = this.statuses[nextStatusIndex];
      order.location = this.locations[nextStatusIndex];
      order.eta = this.getETA(nextStatusIndex);
    },
    removeOrder(orderId) {
      const index = this.orders.findIndex(o => o.id === orderId);
      if (index !== -1) this.orders.splice(index, 1);
    },
    getETA(statusIndex) {
      switch (statusIndex) {
        case 0: return '2 days'; // Pending
        case 1: return '1 day';  // Shipped
        case 2: return '12 hours'; // In Transit
        case 3: return 'Delivered'; // Delivered
        default: return 'N/A';
      }
    },
    getProgressWidth(status) {
      const index = this.statuses.indexOf(status);
      return `${(index + 1) * 25}%`; // 25% per status step
    },
  },
};
</script>

<style scoped>
.shipping-tracking {
  padding: 20px;
  background-color: #f0f8ff;
  min-height: 100vh;
}
h2 {
  color: #333;
  margin-bottom: 20px;
}
.tracking-section {
  margin-top: 20px;
}
h3 {
  font-size: 18px;
  color: #555;
  margin-bottom: 10px;
}
.add-order {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 15px;
}
.add-order input {
  width: 200px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 3px;
}
.filter {
  margin-bottom: 15px;
}
.filter select {
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 3px;
}
.order-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.order-card {
  background-color: #fff;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  position: relative;
}
.order-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
}
.order-info span {
  font-size: 14px;
  color: #333;
}
.progress-bar {
  height: 5px;
  background-color: #4caf50;
  border-radius: 3px;
  transition: width 0.3s ease;
}
.order-controls {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
.add-btn, .update-btn, .remove-btn {
  padding: 5px 10px;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
}
.add-btn {
  background-color: #4caf50;
}
.add-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.add-btn:hover:not(:disabled) {
  background-color: #388e3c;
}
.update-btn {
  background-color: #007bff;
}
.update-btn:hover {
  background-color: #0056b3;
}
.remove-btn {
  background-color: #ff4d4d;
}
.remove-btn:hover {
  background-color: #e60000;
}
</style>
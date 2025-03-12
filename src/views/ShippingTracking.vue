<template>
  <div class="shipping-tracking">
    <h2 class="page-title">Shipping Tracking Dashboard</h2>
    <div class="tracking-section">
      <transition name="slide-fade">
        <div class="search-bar">
          <div class="search-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <input v-model="searchQuery" placeholder="Search by order ID or details..." @input="searchOrders" />
        </div>
      </transition>
      
      <div class="add-order">
        <h3>Track New Shipment</h3>
        <div class="input-group">
          <div class="form-field">
            <label for="orderId">Order ID</label>
            <input 
              id="orderId" 
              v-model="newOrderId" 
              placeholder="Order ID (e.g., XYZ789)" 
              @keyup.enter="validateAndAddOrder" 
            />
            <span v-if="errors.orderId" class="error-message">{{ errors.orderId }}</span>
          </div>
          <div class="form-field">
            <label for="orderDetails">Package Details</label>
            <input 
              id="orderDetails" 
              v-model="newOrderDetails" 
              placeholder="What's being shipped?" 
              @keyup.enter="validateAndAddOrder" 
            />
          </div>
          <div class="form-field">
            <label for="carrier">Shipping Carrier</label>
            <select id="carrier" v-model="newOrderCarrier">
              <option v-for="carrier in carriers" :key="carrier" :value="carrier">{{ carrier }}</option>
            </select>
          </div>
          <button 
            @click="validateAndAddOrder" 
            :disabled="!newOrderId" 
            class="add-btn"
          >
            <span>Add Shipment</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        </div>
      </div>
      
      <div class="tracking-filters">
        <div class="filter-group">
          <label>Filter by Status:</label>
          <select v-model="statusFilter">
            <option value="">All Statuses</option>
            <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Filter by Carrier:</label>
          <select v-model="carrierFilter">
            <option value="">All Carriers</option>
            <option v-for="carrier in carriers" :key="carrier" :value="carrier">{{ carrier }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Sort by:</label>
          <select v-model="sortOption">
            <option value="dateDesc">Date (Newest First)</option>
            <option value="dateAsc">Date (Oldest First)</option>
            <option value="etaAsc">ETA (Soonest First)</option>
          </select>
        </div>
      </div>
      
      <transition-group name="list" tag="div" class="order-list">
        <div v-for="order in filteredAndSortedOrders" :key="order.id" class="order-card" :class="{ 'highlighted': order.id === highlightedOrder }">
          <div class="order-header">
            <h4>Order {{ order.id }}</h4>
            <span class="carrier-badge">{{ order.carrier }}</span>
            <span :class="['status-badge', order.status.toLowerCase().replace(' ', '-')]">{{ order.status }}</span>
          </div>
          
          <div class="order-info">
            <div class="order-details">
              <p><strong>Package:</strong> {{ order.details }}</p>
              <p><strong>Current Location:</strong> {{ order.location }}</p>
              <p><strong>ETA:</strong> {{ formatETA(order) }}</p>
              <p><strong>Tracked since:</strong> {{ formatDate(order.dateAdded) }}</p>
              <p v-if="order.lastUpdated"><strong>Last updated:</strong> {{ formatTimeSince(order.lastUpdated) }}</p>
            </div>
            
            <div class="tracking-timeline">
              <div class="timeline-track"></div>
              <div class="timeline-stops">
                <div 
                  v-for="(status,) in statuses" 
                  :key="status" 
                  class="timeline-stop" 
                  :class="{ 'completed': isStatusCompleted(order.status, status) }"
                >
                  <div class="stop-icon"></div>
                  <span class="stop-label">{{ status }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="animated-progress">
            <div class="progress-bar" :style="{ width: getProgressWidth(order.status) }"></div>
          </div>
          
          <div class="order-controls">
            <button @click="updateOrderStatus(order.id)" class="update-btn" :disabled="order.status === 'Delivered'">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
              Update Status
            </button>
            <button @click="showNotifications(order.id)" class="notify-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"></path></svg>
              Notify Me
            </button>
            <button @click="removeOrder(order.id)" class="remove-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              Remove
            </button>
          </div>
        </div>
      </transition-group>
      
      <div v-if="filteredAndSortedOrders.length === 0" class="no-orders">
        <p>No shipments found matching your criteria.</p>
      </div>
    </div>
    
    <!-- Notification Modal -->
    <transition name="fade">
      <div v-if="showNotificationModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <h3>Shipment Notifications</h3>
          <p>Set up notifications for order <strong>{{ currentOrderId }}</strong></p>
          
          <div class="notification-options">
            <div class="notification-option">
              <input type="checkbox" id="email-notification" v-model="notifications.email">
              <label for="email-notification">Email notifications</label>
              <input v-if="notifications.email" type="email" placeholder="Enter email address" v-model="notifications.emailAddress">
            </div>
            
            <div class="notification-option">
              <input type="checkbox" id="sms-notification" v-model="notifications.sms">
              <label for="sms-notification">SMS notifications</label>
              <input v-if="notifications.sms" type="tel" placeholder="Enter phone number" v-model="notifications.phoneNumber">
            </div>
            
            <div class="notification-option">
              <input type="checkbox" id="status-change" v-model="notifications.statusChange">
              <label for="status-change">Notify on status change</label>
            </div>
            
            <div class="notification-option">
              <input type="checkbox" id="delivery" v-model="notifications.delivery">
              <label for="delivery">Notify on delivery</label>
            </div>
          </div>
          
          <div class="modal-buttons">
            <button @click="saveNotificationSettings" class="save-btn">Save Settings</button>
            <button @click="closeModal" class="cancel-btn">Cancel</button>
          </div>
        </div>
      </div>
    </transition>
    
    <!-- Toast Notification -->
    <transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        <span>{{ toast.message }}</span>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'ShippingTracking',
  data() {
    return {
      newOrderId: '',
      newOrderDetails: '',
      newOrderCarrier: 'FedEx',
      orders: [
        { 
          id: 'ABC123', 
          details: 'Electronics (Laptop)', 
          status: 'Pending', 
          location: 'San Francisco Warehouse', 
          carrier: 'FedEx',
          eta: this.calculateETA('Pending'),
          dateAdded: new Date(new Date().setDate(new Date().getDate() - 2)),
          lastUpdated: new Date(new Date().setHours(new Date().getHours() - 4))
        },
        { 
          id: 'XYZ789', 
          details: 'Clothing (Winter Jacket)', 
          status: 'Shipped', 
          location: 'Chicago Distribution Center', 
          carrier: 'UPS',
          eta: this.calculateETA('Shipped'),
          dateAdded: new Date(new Date().setDate(new Date().getDate() - 1)),
          lastUpdated: new Date(new Date().setHours(new Date().getHours() - 2))
        },
        { 
          id: 'DEF456', 
          details: 'Furniture (Office Chair)', 
          status: 'In Transit', 
          location: 'Denver Sorting Facility', 
          carrier: 'DHL',
          eta: this.calculateETA('In Transit'),
          dateAdded: new Date(new Date().setDate(new Date().getDate() - 3)),
          lastUpdated: new Date()
        },
        { 
          id: 'GHI789', 
          details: 'Books (Technical Manuals)', 
          status: 'Out for Delivery', 
          location: 'Local Delivery Route', 
          carrier: 'USPS',
          eta: this.calculateETA('Out for Delivery'),
          dateAdded: new Date(new Date().setDate(new Date().getDate() - 5)),
          lastUpdated: new Date(new Date().setHours(new Date().getHours() - 1))
        },
        { 
          id: 'JKL012', 
          details: 'Art Supplies', 
          status: 'Delivered', 
          location: 'Customer Address', 
          carrier: 'Amazon Logistics',
          eta: this.calculateETA('Delivered'),
          dateAdded: new Date(new Date().setDate(new Date().getDate() - 6)),
          lastUpdated: new Date(new Date().setDate(new Date().getDate() - 1))
        },
      ],
      statuses: ['Pending', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered'],
      carriers: ['FedEx', 'UPS', 'DHL', 'USPS', 'Amazon Logistics'],
      locations: [
        'San Francisco Warehouse', 
        'Chicago Distribution Center', 
        'Denver Sorting Facility', 
        'Local Delivery Route', 
        'Customer Address'
      ],
      statusFilter: '',
      carrierFilter: '',
      sortOption: 'dateDesc',
      searchQuery: '',
      filteredOrders: [],
      showNotificationModal: false,
      currentOrderId: null,
      notifications: {
        email: false,
        emailAddress: '',
        sms: false,
        phoneNumber: '',
        statusChange: true,
        delivery: true
      },
      toast: {
        show: false,
        message: '',
        type: 'info',
        timeout: null
      },
      errors: {
        orderId: ''
      },
      highlightedOrder: null
    };
  },
  computed: {
    filteredAndSortedOrders() {
      let result = this.searchQuery ? this.filteredOrders : this.orders;
      
      // Apply status filter
      if (this.statusFilter) {
        result = result.filter(order => order.status === this.statusFilter);
      }
      
      // Apply carrier filter
      if (this.carrierFilter) {
        result = result.filter(order => order.carrier === this.carrierFilter);
      }
      
      // Apply sorting
      return this.sortOrders(result);
    }
  },
  methods: {
    validateAndAddOrder() {
      // Reset error
      this.errors.orderId = '';
      
      // Validate Order ID
      if (!this.newOrderId.trim()) {
        this.errors.orderId = 'Order ID is required';
        return;
      }
      
      // Check if Order ID already exists
      if (this.orders.some(order => order.id === this.newOrderId.trim())) {
        this.errors.orderId = 'Order ID already exists';
        return;
      }
      
      this.addOrder();
    },
    
    addOrder() {
      if (this.newOrderId.trim()) {
        const newOrder = {
          id: this.newOrderId.trim(),
          details: this.newOrderDetails.trim() || 'No details provided',
          status: 'Pending',
          location: this.locations[0],
          carrier: this.newOrderCarrier,
          eta: this.calculateETA('Pending'),
          dateAdded: new Date(),
          lastUpdated: new Date()
        };
        
        this.orders.unshift(newOrder);
        this.highlightedOrder = newOrder.id;
        
        setTimeout(() => {
          this.highlightedOrder = null;
        }, 3000);
        
        this.newOrderId = '';
        this.newOrderDetails = '';
        
        this.showToast('Shipment added successfully!', 'success');
      }
    },
    
    updateOrderStatus(orderId) {
      const order = this.orders.find(o => o.id === orderId);
      if (!order) return;
      
      const currentStatusIndex = this.statuses.indexOf(order.status);
      if (currentStatusIndex === this.statuses.length - 1) return; // Already delivered
      
      const nextStatusIndex = currentStatusIndex + 1;
      order.status = this.statuses[nextStatusIndex];
      order.location = this.locations[nextStatusIndex];
      order.eta = this.calculateETA(order.status);
      order.lastUpdated = new Date();
      
      this.highlightedOrder = order.id;
      setTimeout(() => {
        this.highlightedOrder = null;
      }, 2000);
      
      this.showToast(`Order ${orderId} updated to ${order.status}`, 'info');
    },
    
    removeOrder(orderId) {
      const index = this.orders.findIndex(o => o.id === orderId);
      if (index !== -1) {
        this.orders.splice(index, 1);
        this.showToast('Shipment removed from tracking', 'info');
      }
    },
    
    calculateETA(status) {
      const now = new Date();
      switch (status) {
        case 'Pending': 
          return new Date(now.setDate(now.getDate() + 5));
        case 'Shipped': 
          return new Date(now.setDate(now.getDate() + 3));
        case 'In Transit': 
          return new Date(now.setDate(now.getDate() + 2));
        case 'Out for Delivery': 
          return new Date(now.setHours(now.getHours() + 8));
        case 'Delivered': 
          return null;
        default: 
          return new Date(now.setDate(now.getDate() + 3));
      }
    },
    
    formatETA(order) {
      if (order.status === 'Delivered') return 'Delivered';
      if (!order.eta) return 'Unknown';
      
      const now = new Date();
      const eta = new Date(order.eta);
      const diffTime = eta - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      
      if (diffDays > 1) return `${diffDays} days`;
      if (diffHours > 1) return `${diffHours} hours`;
      return 'Less than an hour';
    },
    
    formatDate(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    },
    
    formatTimeSince(date) {
      if (!date) return 'N/A';
      
      const now = new Date();
      const past = new Date(date);
      const diffTime = now - past;
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      return `${diffDays} days ago`;
    },
    
    getProgressWidth(status) {
      const index = this.statuses.indexOf(status);
      return `${((index + 1) / this.statuses.length) * 100}%`;
    },
    
    isStatusCompleted(currentStatus, checkStatus) {
      const currentIndex = this.statuses.indexOf(currentStatus);
      const checkIndex = this.statuses.indexOf(checkStatus);
      return checkIndex <= currentIndex;
    },
    
    searchOrders() {
      const query = this.searchQuery.toLowerCase().trim();
      if (!query) {
        this.filteredOrders = [...this.orders];
        return;
      }
      
      this.filteredOrders = this.orders.filter(order => 
        order.id.toLowerCase().includes(query) || 
        order.details.toLowerCase().includes(query) ||
        order.carrier.toLowerCase().includes(query)
      );
    },
    
    sortOrders(orders) {
      switch (this.sortOption) {
        case 'dateDesc':
          return [...orders].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        case 'dateAsc':
          return [...orders].sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
        case 'etaAsc':
          return [...orders].sort((a, b) => {
            // Handle delivered orders
            if (a.status === 'Delivered' && b.status !== 'Delivered') return 1;
            if (a.status !== 'Delivered' && b.status === 'Delivered') return -1;
            if (a.status === 'Delivered' && b.status === 'Delivered') return 0;
            // Sort by ETA
            return new Date(a.eta) - new Date(b.eta);
          });
        default:
          return orders;
      }
    },
    
    showNotifications(orderId) {
      this.currentOrderId = orderId;
      this.showNotificationModal = true;
    },
    
    closeModal() {
      this.showNotificationModal = false;
    },
    
    saveNotificationSettings() {
      // In a real app, this would save to a database or local storage
      this.showToast('Notification preferences saved', 'success');
      this.closeModal();
    },
    
    showToast(message, type = 'info') {
      // Clear any existing timeout
      if (this.toast.timeout) {
        clearTimeout(this.toast.timeout);
      }
      
      // Set toast properties
      this.toast.show = true;
      this.toast.message = message;
      this.toast.type = type;
      
      // Hide after 3 seconds
      this.toast.timeout = setTimeout(() => {
        this.toast.show = false;
      }, 3000);
    }
  },
  created() {
    // Initialize filteredOrders
    this.filteredOrders = [...this.orders];
  }
};
</script>

<style scoped>
.shipping-tracking {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.page-title {
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: 600;
  text-align: center;
  position: relative;
}

.page-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 3px;
  background-color: #3498db;
  border-radius: 3px;
}

.tracking-section {
  max-width: 900px;
  margin: 0 auto;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: white;
  padding: 10px 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.search-icon {
  margin-right: 10px;
  color: #7f8c8d;
}

.search-bar input {
  flex: 1;
  border: none;
  font-size: 16px;
  outline: none;
  color: #34495e;
}

.add-order {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.add-order h3 {
  font-size: 20px;
  color: #2c3e50;
  margin-bottom: 15px;
  font-weight: 500;
}

.input-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  align-items: flex-end;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.form-field label {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 5px;
}

.form-field input, .form-field select {
  padding: 10px;
  border: 1px solid #dfe6e9;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-field input:focus, .form-field select:focus {
  border-color: #3498db;
  outline: none;
}

.error-message {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 5px;
}

.tracking-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-size: 14px;
  color: #7f8c8d;
}

.filter-group select {
  padding: 8px;
  border: 1px solid #dfe6e9;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.order-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.highlighted {
  animation: highlight 2s ease-in-out;
}

@keyframes highlight {
  0%, 100% {
    background-color: white;
  }
  50% {
    background-color: #ecf0f1;
  }
}

.order-header {
  padding: 15px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ecf0f1;
}

.order-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #2c3e50;
  flex: 1;
}

.carrier-badge {
  padding: 5px 10px;
  background-color: #f1f5f9;
  color: #64748b;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 10px;
}

.status-badge {
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.pending {
  background-color: #f1f5f9;
  color: #64748b;
}

.status-badge.shipped {
  background-color: #e0f2fe;
  color: #0ea5e9;
}

.status-badge.in-transit {
  background-color: #eff6ff;
  color: #3b82f6;
}

.status-badge.out-for-delivery {
  background-color: #fef3c7;
  color: #d97706;
}

.status-badge.delivered {
  background-color: #d1fae5;
  color: #10b981;
}

.order-info {
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

@media (min-width: 768px) {
  .order-info {
    flex-direction: row;
  }
  
  .order-details {
    flex: 1;
  }
  
  .tracking-timeline {
    flex: 1;
  }
}

.order-details p {
  margin: 5px 0;
  font-size: 14px;
  color: #4b5563;
}

.tracking-timeline {
  position: relative;
  padding: 20px 0;
}

.timeline-track {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 3px;
  background-color: #e2e8f0;
  transform: translateY(-50%);
}

.timeline-stops {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.timeline-stop {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.stop-icon {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: #e2e8f0;
  margin-bottom: 8px;
  transition: background-color 0.3s;
}

.timeline-stop.completed .stop-icon {
  background-color: #10b981;
}

.stop-label {
  font-size: 10px;
  color: #64748b;
  text-align: center;
  max-width: 70px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.animated-progress {
  height: 6px;
  background-color: #e2e8f0;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  transition: width 0.5s ease-in-out;
  border-radius: 0 3px 3px 0;
  position: relative;
}

/* .progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.2), */

    .progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.2),
    rgba(255, 255, 255, 0.3),
    rgba(255, 255, 255, 0.2),
    rgba(255, 255, 255, 0.1)
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite linear;
}

@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

.order-controls {
  display: flex;
  gap: 10px;
  padding: 15px;
  border-top: 1px solid #ecf0f1;
}

.add-btn, .update-btn, .notify-btn, .remove-btn, .save-btn, .cancel-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.add-btn {
  background-color: #3498db;
  color: white;
  margin-top: 10px;
}

.add-btn:hover:not(:disabled) {
  background-color: #2980b9;
  transform: translateY(-2px);
}

.add-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.update-btn {
  background-color: #3498db;
  color: white;
}

.update-btn:hover:not(:disabled) {
  background-color: #2980b9;
}

.update-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
  opacity: 0.7;
}

.notify-btn {
  background-color: #f39c12;
  color: white;
}

.notify-btn:hover {
  background-color: #e67e22;
}

.remove-btn {
  background-color: #e74c3c;
  color: white;
  margin-left: auto;
}

.remove-btn:hover {
  background-color: #c0392b;
}

.save-btn {
  background-color: #2ecc71;
  color: white;
}

.save-btn:hover {
  background-color: #27ae60;
}

.cancel-btn {
  background-color: #95a5a6;
  color: white;
}

.cancel-btn:hover {
  background-color: #7f8c8d;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #2c3e50;
}

.notification-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 20px 0;
}

.notification-option {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.notification-option label {
  margin-right: auto;
}

.notification-option input[type="email"],
.notification-option input[type="tel"] {
  flex: 1;
  min-width: 250px;
  padding: 8px;
  border: 1px solid #dfe6e9;
  border-radius: 4px;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 4px;
  color: white;
  font-size: 14px;
  z-index: 1000;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  max-width: 300px;
}

.toast.info {
  background-color: #3498db;
}

.toast.success {
  background-color: #2ecc71;
}

.toast.error {
  background-color: #e74c3c;
}

.toast.warning {
  background-color: #f39c12;
}

.no-orders {
  padding: 30px;
  text-align: center;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.no-orders p {
  color: #7f8c8d;
  font-size: 16px;
}

/* Animations */
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.3s ease-out;
}

.slide-fade-enter-from {
  transform: translateY(-20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.list-move {
  transition: transform 0.5s;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s;
}

.toast-enter-from {
  transform: translateY(100px);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100px);
  opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .input-group {
    grid-template-columns: 1fr;
  }
  
  .tracking-filters {
    flex-direction: column;
    gap: 10px;
  }
  
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .carrier-badge, .status-badge {
    margin-right: 0;
  }
  
  .order-controls {
    flex-wrap: wrap;
  }
  
  .remove-btn {
    margin-left: 0;
  }
  
  .timeline-stops {
    overflow-x: auto;
    padding-bottom: 10px;
  }
  
  .timeline-stop {
    min-width: 60px;
  }
}
</style>
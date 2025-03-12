<template>
  <div class="logistics-management">
    <div class="dashboard-header">
      <h1>Logistics Management Dashboard</h1>
      <div class="dashboard-stats">
        <div class="stat-card">
          <span class="stat-title">Drivers</span>
          <span class="stat-value">{{ drivers.length }}</span>
          <span class="stat-subtitle">{{ availableDrivers }} available</span>
        </div>
        <div class="stat-card">
          <span class="stat-title">Vehicles</span>
          <span class="stat-value">{{ vehicles.length }}</span>
          <span class="stat-subtitle">{{ idleVehicles }} idle</span>
        </div>
        <div class="stat-card">
          <span class="stat-title">Inventory</span>
          <span class="stat-value">{{ totalInventoryItems }}</span>
          <span class="stat-subtitle">{{ inventory.length }} types</span>
        </div>
      </div>
    </div>

    <div class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.name }}
      </button>
    </div>

    <!-- Drivers Section -->
    <div v-if="activeTab === 'drivers'" class="section drivers-section">
      <div class="section-header">
        <h2>Driver Management</h2>
        <div class="search-filter">
          <input v-model="driverSearch" placeholder="Search drivers..." />
          <select v-model="driverStatusFilter">
            <option value="">All Statuses</option>
            <option>Available</option>
            <option>Assigned</option>
            <option>Off Duty</option>
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <input v-model="newDriver.name" placeholder="Driver name" />
        <input v-model="newDriver.phone" placeholder="Phone number" />
        <select v-model="newDriver.status">
          <option value="Available">Available</option>
          <option value="Assigned">Assigned</option>
          <option value="Off Duty">Off Duty</option>
        </select>
        <button @click="addDriver" :disabled="!newDriver.name" class="add-btn">Add Driver</button>
      </div>
      
      <div class="list-container">
        <div v-if="filteredDrivers.length === 0" class="empty-state">
          <p>No drivers match your search criteria</p>
        </div>
        <div v-else class="list">
          <div v-for="(driver, index) in filteredDrivers" :key="index" class="item-card driver-card">
            <div class="card-header">
              <span class="card-title">{{ driver.name }}</span>
              <span :class="['status-badge', driver.status.toLowerCase().replace(' ', '-')]">{{ driver.status }}</span>
            </div>
            <div class="card-body">
              <div class="info-row">
                <span class="info-label">Contact:</span>
                <span>{{ driver.phone || 'Not provided' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Vehicle:</span>
                <select v-model="driver.vehicleId" :disabled="driver.status !== 'Assigned'">
                  <option value="">None assigned</option>
                  <option v-for="vehicle in availableVehiclesForAssignment(driver)" :key="vehicle.id" :value="vehicle.id">
                    {{ vehicle.name }} ({{ vehicle.type }})
                  </option>
                </select>
              </div>
              <div class="actions">
                <button @click="editDriver(index)" class="edit-btn">Edit</button>
                <button @click="confirmRemoveDriver(index)" class="remove-btn">Remove</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vehicles Section -->
    <div v-if="activeTab === 'vehicles'" class="section vehicles-section">
      <div class="section-header">
        <h2>Vehicle Fleet</h2>
        <div class="search-filter">
          <input v-model="vehicleSearch" placeholder="Search vehicles..." />
          <select v-model="vehicleStatusFilter">
            <option value="">All Statuses</option>
            <option>Idle</option>
            <option>In Transit</option>
            <option>Maintenance</option>
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <input v-model="newVehicle.name" placeholder="Vehicle name (e.g., Truck A)" />
        <select v-model="newVehicle.type">
          <option value="Truck">Truck</option>
          <option value="Van">Van</option>
          <option value="Car">Car</option>
        </select>
        <input v-model="newVehicle.capacity" type="number" placeholder="Capacity (units)" min="0" />
        <button @click="addVehicle" :disabled="!newVehicle.name" class="add-btn">Add Vehicle</button>
      </div>
      
      <div class="list-container">
        <div v-if="filteredVehicles.length === 0" class="empty-state">
          <p>No vehicles match your search criteria</p>
        </div>
        <div v-else class="list">
          <div v-for="(vehicle, index) in filteredVehicles" :key="vehicle.id" class="item-card vehicle-card">
            <div class="card-header">
              <span class="card-title">{{ vehicle.name }}</span>
              <span :class="['status-badge', vehicle.status.toLowerCase().replace(' ', '-')]">{{ vehicle.status }}</span>
            </div>
            <div class="card-body">
              <div class="info-row">
                <span class="info-label">Type:</span>
                <span>{{ vehicle.type }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Capacity:</span>
                <span>{{ vehicle.capacity }} units</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status:</span>
                <select v-model="vehicle.status" @change="updateVehicleStatus(vehicle)">
                  <option>Idle</option>
                  <option>In Transit</option>
                  <option>Maintenance</option>
                </select>
              </div>
              <div class="info-row">
                <span class="info-label">Driver:</span>
                <span>{{ getDriverName(vehicle.id) || 'None assigned' }}</span>
              </div>
              <div class="actions">
                <button @click="editVehicle(index)" class="edit-btn">Edit</button>
                <button @click="confirmRemoveVehicle(index)" class="remove-btn">Remove</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Inventory Section -->
    <div v-if="activeTab === 'inventory'" class="section inventory-section">
      <div class="section-header">
        <h2>Inventory Management</h2>
        <div class="search-filter">
          <input v-model="inventorySearch" placeholder="Search inventory..." />
          <select v-model="inventoryStockFilter">
            <option value="">All Items</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <input v-model="newItem.name" placeholder="Item name" />
        <input v-model.number="newItem.quantity" type="number" min="0" placeholder="Quantity" />
        <input v-model.number="newItem.threshold" type="number" min="0" placeholder="Low stock threshold" />
        <button @click="addItem" :disabled="!isValidNewItem" class="add-btn">Add Item</button>
      </div>
      
      <div class="list-container">
        <div v-if="filteredInventory.length === 0" class="empty-state">
          <p>No inventory items match your search criteria</p>
        </div>
        <div v-else class="list">
          <div v-for="(item, index) in filteredInventory" :key="index" class="item-card inventory-card">
            <div class="card-header">
              <span class="card-title">{{ item.name }}</span>
              <span :class="['status-badge', getInventoryStatusClass(item)]">
                {{ getInventoryStatus(item) }}
              </span>
            </div>
            <div class="card-body">
              <div class="info-row">
                <span class="info-label">Quantity:</span>
                <input 
                  v-model.number="item.quantity" 
                  type="number" 
                  min="0" 
                  class="quantity-input"
                  @change="updateInventory(index)"
                />
              </div>
              <div class="info-row">
                <span class="info-label">Threshold:</span>
                <input 
                  v-model.number="item.threshold" 
                  type="number" 
                  min="0" 
                  class="threshold-input"
                  @change="updateInventory(index)"
                />
              </div>
              <div class="info-row">
                <span class="info-label">Status:</span>
                <span :class="['stock-status', getInventoryStatusClass(item)]">
                  {{ getInventoryStatus(item) }}
                </span>
              </div>
              <div class="actions">
                <button @click="quickAddStock(item, 10)" class="quick-add-btn">+10</button>
                <button @click="quickAddStock(item, 50)" class="quick-add-btn">+50</button>
                <button @click="confirmRemoveItem(index)" class="remove-btn">Remove</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Assignments Section -->
    <div v-if="activeTab === 'assignments'" class="section assignments-section">
      <div class="section-header">
        <h2>Driver-Vehicle Assignments</h2>
      </div>
      
      <div class="form-group">
        <select v-model="newAssignment.driverId">
          <option value="">Select Driver</option>
          <option v-for="driver in availableDriversForNewAssignment" :key="driver.id" :value="driver.id">
            {{ driver.name }}
          </option>
        </select>
        <select v-model="newAssignment.vehicleId">
          <option value="">Select Vehicle</option>
          <option v-for="vehicle in availableVehiclesForNewAssignment" :key="vehicle.id" :value="vehicle.id">
            {{ vehicle.name }} ({{ vehicle.type }})
          </option>
        </select>
        <button 
          @click="createAssignment" 
          :disabled="!newAssignment.driverId || !newAssignment.vehicleId" 
          class="add-btn"
        >
          Create Assignment
        </button>
      </div>
      
      <div class="list-container">
        <div v-if="currentAssignments.length === 0" class="empty-state">
          <p>No current driver-vehicle assignments</p>
        </div>
        <div v-else class="list">
          <div v-for="(assignment, index) in currentAssignments" :key="index" class="item-card assignment-card">
            <div class="card-header">
              <span class="card-title">Assignment #{{ assignment.id }}</span>
              <span class="status-badge in-transit">Active</span>
            </div>
            <div class="card-body">
              <div class="info-row">
                <span class="info-label">Driver:</span>
                <span>{{ getDriverById(assignment.driverId).name }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Vehicle:</span>
                <span>{{ getVehicleById(assignment.vehicleId).name }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Created:</span>
                <span>{{ formatDate(assignment.createdAt) }}</span>
              </div>
              <div class="actions">
                <button @click="endAssignment(index)" class="remove-btn">End Assignment</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmation" class="modal">
      <div class="modal-content">
        <h3>Confirm Action</h3>
        <p>{{ confirmationMessage }}</p>
        <div class="modal-buttons">
          <button @click="confirmAction" class="confirm-btn">Confirm</button>
          <button @click="cancelConfirmation" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LogisticsManagement',
  data() {
    return {
      // Tabs management
      activeTab: 'drivers',
      tabs: [
        { id: 'drivers', name: 'Drivers' },
        { id: 'vehicles', name: 'Vehicles' },
        { id: 'inventory', name: 'Inventory' },
        { id: 'assignments', name: 'Assignments' }
      ],
      
      // Drivers data
      driverIdCounter: 3,
      newDriver: {
        name: '',
        phone: '',
        status: 'Available',
        vehicleId: ''
      },
      drivers: [
        { id: '1', name: 'Amit Kumar', phone: '555-1234', status: 'Available', vehicleId: '' },
        { id: '2', name: 'Priya Singh', phone: '555-5678', status: 'Assigned', vehicleId: '1' },
      ],
      driverSearch: '',
      driverStatusFilter: '',
      
      // Vehicles data
      vehicleIdCounter: 3,
      newVehicle: {
        name: '',
        type: 'Truck',
        capacity: 100,
        status: 'Idle'
      },
      vehicles: [
        { id: '1', name: 'Truck A', type: 'Truck', capacity: 200, status: 'In Transit' },
        { id: '2', name: 'Van B', type: 'Van', capacity: 50, status: 'Idle' },
      ],
      vehicleSearch: '',
      vehicleStatusFilter: '',
      
      // Inventory data
      newItem: {
        name: '',
        quantity: null,
        threshold: 10
      },
      inventory: [
        { name: 'Boxes', quantity: 50, threshold: 20 },
        { name: 'Pallets', quantity: 20, threshold: 5 },
        { name: 'Packaging Material', quantity: 1000, threshold: 200 },
        { name: 'Labels', quantity: 500, threshold: 100 }
      ],
      inventorySearch: '',
      inventoryStockFilter: '',
      
      // Assignments
      assignmentIdCounter: 1,
      newAssignment: {
        driverId: '',
        vehicleId: ''
      },
      assignments: [],
      
      // Confirmation modal
      showConfirmation: false,
      confirmationMessage: '',
      pendingAction: null,
      pendingActionData: null
    };
  },
  computed: {
    // Drivers computed properties
    filteredDrivers() {
      return this.drivers.filter(driver => {
        const matchesSearch = driver.name.toLowerCase().includes(this.driverSearch.toLowerCase());
        const matchesStatus = !this.driverStatusFilter || driver.status === this.driverStatusFilter;
        return matchesSearch && matchesStatus;
      });
    },
    availableDrivers() {
      return this.drivers.filter(driver => driver.status === 'Available').length;
    },
    availableDriversForNewAssignment() {
      return this.drivers.filter(driver => 
        driver.status === 'Available' || 
        (driver.status === 'Assigned' && driver.vehicleId === '')
      );
    },
    
    // Vehicles computed properties
    filteredVehicles() {
      return this.vehicles.filter(vehicle => {
        const matchesSearch = vehicle.name.toLowerCase().includes(this.vehicleSearch.toLowerCase());
        const matchesStatus = !this.vehicleStatusFilter || vehicle.status === this.vehicleStatusFilter;
        return matchesSearch && matchesStatus;
      });
    },
    idleVehicles() {
      return this.vehicles.filter(vehicle => vehicle.status === 'Idle').length;
    },
    availableVehiclesForNewAssignment() {
      return this.vehicles.filter(vehicle => vehicle.status === 'Idle');
    },
    
    // Inventory computed properties
    filteredInventory() {
      return this.inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(this.inventorySearch.toLowerCase());
        const matchesStock = this.matchesStockFilter(item);
        return matchesSearch && matchesStock;
      });
    },
    totalInventoryItems() {
      return this.inventory.reduce((total, item) => total + item.quantity, 0);
    },
    isValidNewItem() {
      return this.newItem.name.trim() && 
             this.newItem.quantity !== null && 
             this.newItem.quantity >= 0 && 
             this.newItem.threshold >= 0;
    },
    
    // Assignments computed properties
    currentAssignments() {
      return this.assignments.filter(assignment => !assignment.endedAt);
    }
  },
  methods: {
    // Driver methods
    addDriver() {
      if (this.newDriver.name.trim()) {
        const driverId = (this.driverIdCounter++).toString();
        this.drivers.push({
          id: driverId,
          name: this.newDriver.name.trim(),
          phone: this.newDriver.phone.trim(),
          status: this.newDriver.status,
          vehicleId: ''
        });
        // Reset form
        this.newDriver = {
          name: '',
          phone: '',
          status: 'Available',
          vehicleId: ''
        };
      }
    },
    editDriver(index) {
      const driver = this.filteredDrivers[index];
      // In a real app, this would open an edit form
      alert(`Editing driver ${driver.name} - This would open an edit form in a real application`);
    },
    confirmRemoveDriver(index) {
      const driver = this.filteredDrivers[index];
      this.confirmationMessage = `Are you sure you want to remove driver "${driver.name}"?`;
      this.pendingAction = this.removeDriver;
      this.pendingActionData = index;
      this.showConfirmation = true;
    },
    removeDriver(index) {
      const driver = this.filteredDrivers[index];
      const actualIndex = this.drivers.findIndex(d => d.id === driver.id);
      if (actualIndex !== -1) {
        this.drivers.splice(actualIndex, 1);
      }
    },
    availableVehiclesForAssignment(driver) {
      // If the driver already has a vehicle assigned, include it in the options
      return this.vehicles.filter(vehicle => 
        vehicle.status === 'Idle' || vehicle.id === driver.vehicleId
      );
    },
    
    // Vehicle methods
    addVehicle() {
      if (this.newVehicle.name.trim()) {
        const vehicleId = (this.vehicleIdCounter++).toString();
        this.vehicles.push({
          id: vehicleId,
          name: this.newVehicle.name.trim(),
          type: this.newVehicle.type,
          capacity: this.newVehicle.capacity || 0,
          status: 'Idle'
        });
        // Reset form
        this.newVehicle = {
          name: '',
          type: 'Truck',
          capacity: 100,
          status: 'Idle'
        };
      }
    },
    editVehicle(index) {
      const vehicle = this.filteredVehicles[index];
      // In a real app, this would open an edit form
      alert(`Editing vehicle ${vehicle.name} - This would open an edit form in a real application`);
    },
    confirmRemoveVehicle(index) {
      const vehicle = this.filteredVehicles[index];
      this.confirmationMessage = `Are you sure you want to remove vehicle "${vehicle.name}"?`;
      this.pendingAction = this.removeVehicle;
      this.pendingActionData = index;
      this.showConfirmation = true;
    },
    removeVehicle(index) {
      const vehicle = this.filteredVehicles[index];
      const actualIndex = this.vehicles.findIndex(v => v.id === vehicle.id);
      if (actualIndex !== -1) {
        const vehicleId = this.vehicles[actualIndex].id;
        
        // Update any drivers using this vehicle
        this.drivers.forEach(driver => {
          if (driver.vehicleId === vehicleId) {
            driver.vehicleId = '';
            driver.status = 'Available';
          }
        });
        
        // Remove any active assignments for this vehicle
        this.assignments.forEach(assignment => {
          if (assignment.vehicleId === vehicleId && !assignment.endedAt) {
            assignment.endedAt = new Date();
          }
        });
        
        // Remove the vehicle
        this.vehicles.splice(actualIndex, 1);
      }
    },
    updateVehicleStatus(vehicle) {
      // If changing from In Transit to another status, handle driver assignments
      if (vehicle.status !== 'In Transit') {
        const assignedDrivers = this.drivers.filter(driver => driver.vehicleId === vehicle.id);
        assignedDrivers.forEach(driver => {
          if (vehicle.status === 'Maintenance') {
            // Make driver available if vehicle goes to maintenance
            driver.vehicleId = '';
            driver.status = 'Available';
          }
        });
        
        // End any active assignments for this vehicle if it's in maintenance
        if (vehicle.status === 'Maintenance') {
          this.assignments.forEach(assignment => {
            if (assignment.vehicleId === vehicle.id && !assignment.endedAt) {
              assignment.endedAt = new Date();
            }
          });
        }
      }
    },
    getDriverName(vehicleId) {
      const driver = this.drivers.find(d => d.vehicleId === vehicleId);
      return driver ? driver.name : null;
    },
    
    // Inventory methods
    addItem() {
      if (this.isValidNewItem) {
        this.inventory.push({
          name: this.newItem.name.trim(),
          quantity: this.newItem.quantity,
          threshold: this.newItem.threshold
        });
        // Reset form
        this.newItem = {
          name: '',
          quantity: null,
          threshold: 10
        };
      }
    },
    updateInventory(index) {
      const item = this.filteredInventory[index];
      // Ensure values are valid
      if (item.quantity < 0) item.quantity = 0;
      if (item.threshold < 0) item.threshold = 0;
      
      // In a real app, this would likely trigger a backend update
      console.log(`Updated inventory for ${item.name}: ${item.quantity} units`);
    },
    getInventoryStatus(item) {
      if (item.quantity <= 0) return 'Out of Stock';
      if (item.quantity <= item.threshold) return 'Low Stock';
      return 'In Stock';
    },
    getInventoryStatusClass(item) {
      if (item.quantity <= 0) return 'out-of-stock';
      if (item.quantity <= item.threshold) return 'low-stock';
      return 'in-stock';
    },
    quickAddStock(item, amount) {
      item.quantity += amount;
      // In a real app, this would likely trigger a backend update
      console.log(`Added ${amount} units to ${item.name}`);
    },
    confirmRemoveItem(index) {
      const item = this.filteredInventory[index];
      this.confirmationMessage = `Are you sure you want to remove "${item.name}" from inventory?`;
      this.pendingAction = this.removeItem;
      this.pendingActionData = index;
      this.showConfirmation = true;
    },
    removeItem(index) {
      const item = this.filteredInventory[index];
      const actualIndex = this.inventory.findIndex(i => i.name === item.name);
      if (actualIndex !== -1) {
        this.inventory.splice(actualIndex, 1);
      }
    },
    matchesStockFilter(item) {
      if (!this.inventoryStockFilter) return true;
      if (this.inventoryStockFilter === 'low' && item.quantity > 0 && item.quantity <= item.threshold) return true;
      if (this.inventoryStockFilter === 'out' && item.quantity <= 0) return true;
      return false;
    },
    
    // Assignment methods
    createAssignment() {
      if (this.newAssignment.driverId && this.newAssignment.vehicleId) {
        const driver = this.drivers.find(d => d.id === this.newAssignment.driverId);
        const vehicle = this.vehicles.find(v => v.id === this.newAssignment.vehicleId);
        
        if (driver && vehicle) {
          // Update driver status
          driver.status = 'Assigned';
          driver.vehicleId = vehicle.id;
          
          // Update vehicle status
          vehicle.status = 'In Transit';
          
          // Create assignment record
          this.assignments.push({
            id: this.assignmentIdCounter++,
            driverId: driver.id,
            vehicleId: vehicle.id,
            createdAt: new Date(),
            endedAt: null
          });
          
          // Reset form
          this.newAssignment = {
            driverId: '',
            vehicleId: ''
          };
        }
      }
    },
    endAssignment(index) {
      const assignment = this.currentAssignments[index];
      const driver = this.drivers.find(d => d.id === assignment.driverId);
      const vehicle = this.vehicles.find(v => v.id === assignment.vehicleId);
      
      if (driver) {
        driver.status = 'Available';
        driver.vehicleId = '';
      }
      
      if (vehicle) {
        vehicle.status = 'Idle';
      }
      
      // Mark assignment as ended
      const actualIndex = this.assignments.findIndex(a => a.id === assignment.id);
      if (actualIndex !== -1) {
        this.assignments[actualIndex].endedAt = new Date();
      }
    },
    getDriverById(driverId) {
      return this.drivers.find(d => d.id === driverId) || { name: 'Unknown' };
    },
    getVehicleById(vehicleId) {
      return this.vehicles.find(v => v.id === vehicleId) || { name: 'Unknown' };
    },
    
    // Utility methods
    formatDate(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleString();
    },
    
    // Confirmation modal methods
    confirmAction() {
      if (this.pendingAction && this.pendingActionData !== null) {
        this.pendingAction(this.pendingActionData);
      }
      this.cancelConfirmation();
    },
    cancelConfirmation() {
      this.showConfirmation = false;
      this.confirmationMessage = '';
      this.pendingAction = null;
      this.pendingActionData = null;
    }
  }
};
</script>

<style scoped>
.logistics-management {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Dashboard Header */
.dashboard-header {
  margin-bottom: 30px;
}

.dashboard-header h1 {
  color: #334155;
  font-size: 28px;
  margin-bottom: 20px;
  font-weight: 600;
}

.dashboard-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  flex: 1;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.stat-title {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #334155;
}

.stat-subtitle {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 5px;
}

/* Tabs */
.tabs {
  display: flex;
  margin-bottom: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.tab-button {
  padding: 12px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  transition: all 0.2s;
  flex: 1;
  text-align: center;
}

.tab-button:hover {
  background-color: #f1f5f9;
}

.tab-button.active {
  color: #0ea5e9;
  border-bottom: 2px solid #0ea5e9;
  background-color: #f0f9ff;
}

/* Section Styling */
.section {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section h2 {
  font-size: 20px;
  color: #334155;
  margin: 0;
  font-weight: 600;
}

.search-filter {
  display: flex;
  gap: 10px;
}

.search-filter input,
.search-filter select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
}

/* Form Styling */
.form-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  padding: 15px;
  background-color: #f8fafc;
  border-radius: 6px;
  border: 1px dashed #cbd5e1;
}

.form-group input,
.form-group select {
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  flex: 1;
  min-width: 150px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #0ea5e9;
  box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.1);
}

/* List Container */
.list-container {
  background-color: #f8fafc;
  border-radius: 6px;
  padding: 10px;
  min-height: 200px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #94a3b8;
  font-size: 16px;
  text-align: center;
}

.list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 15px;
}

/* Card Styling */
.item-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background-color: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
}

.card-title {
  font-weight: 600;
  color: #334155;
  font-size: 16px;
}

.card-body {
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: flex;
  align-items: center;
}

.info-label {
  font-weight: 500;
  color: #64748b;
  width: 80px;
  font-size: 14px;
}

.info-row select,
.info-row input {
  padding: 6px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  flex: 1;
}

.info-row input.quantity-input,
.info-row input.threshold-input {
  width: 80px;
  text-align: center;
}

/* Status Badges */
.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.available {
  background-color: #10b981;
}

.assigned {
  background-color: #6366f1;
}

.off-duty {
  background-color: #94a3b8;
}

.idle {
  background-color: #10b981;
}

.in-transit {
  background-color: #6366f1;
}

.maintenance {
  background-color: #f59e0b;
}

.in-stock {
  background-color: #10b981;
}

.low-stock {
  background-color: #f59e0b;
}

.out-of-stock {
  background-color: #ef4444;
}

.stock-status {
  font-weight: 500;
  font-size: 14px;
}

.stock-status.in-stock {
  color: #10b981;
}

.stock-status.low-stock {
  color: #f59e0b;
}

.stock-status.out-of-stock {
  color: #ef4444;
}

/* Action Buttons */
.actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  justify-content: flex-end;
}

.add-btn {
  padding: 10px 16px;
  background-color: #0ea5e9;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.add-btn:hover:not(:disabled) {
  background-color: #0284c7;
}

.add-btn:disabled {
  background-color: #cbd5e1;
  cursor: not-allowed;
}

.edit-btn {
  padding: 6px 12px;
  background-color: #f8fafc;
  color: #64748b;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.edit-btn:hover {
  background-color: #e2e8f0;
}

.remove-btn {
  padding: 6px 12px;
  background-color: #fee2e2;
  color: #ef4444;
  border: 1px solid #fecaca;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.remove-btn:hover {
  background-color: #fecaca;
}

.quick-add-btn {
  padding: 6px 12px;
  background-color: #e0f2fe;
  color: #0ea5e9;
  border: 1px solid #bae6fd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.quick-add-btn:hover {
  background-color: #bae6fd;
}

.confirm-btn {
  padding: 8px 16px;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.cancel-btn {
  padding: 8px 16px;
  background-color: #f8fafc;
  color: #64748b;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.modal-content h3 {
  font-size: 18px;
  color: #334155;
  margin-top: 0;
  margin-bottom: 15px;
}

.modal-content p {
  margin-bottom: 20px;
  color: #64748b;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dashboard-stats {
    flex-direction: column;
  }
  
  .search-filter {
    flex-direction: column;
    width: 100%;
  }
  
  .form-group {
    flex-direction: column;
  }
  
  .form-group input,
  .form-group select {
    width: 100%;
  }
  
  .list {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
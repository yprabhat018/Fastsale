
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
      
      <div class="inventory-tabs">
        <button 
          :class="['inventory-tab', { active: inventoryActiveTab === 'current' }]"
          @click="inventoryActiveTab = 'current'"
        >
          Current Inventory
        </button>
        <button 
          :class="['inventory-tab', { active: inventoryActiveTab === 'history' }]"
          @click="inventoryActiveTab = 'history'"
        >
          Inventory History
        </button>
      </div>
      
      <!-- Current Inventory -->
      <div v-if="inventoryActiveTab === 'current'" class="list-container">
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
                <button @click="removeInventoryItem(item, index)" class="remove-btn">Remove</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Inventory History -->
      <div v-if="inventoryActiveTab === 'history'" class="list-container">
        <div v-if="inventoryHistory.length === 0" class="empty-state">
          <p>No inventory history available</p>
        </div>
        <div v-else>
          <div class="history-filters">
            <select v-model="historyActionFilter">
              <option value="">All Actions</option>
              <option value="removed">Removed</option>
              <option value="added">Added</option>
              <option value="updated">Updated</option>
            </select>
            <input 
              type="date" 
              v-model="historyDateFilter" 
              class="date-filter" 
              :max="getCurrentDate()"
            />
            <button @click="clearHistoryFilters" class="clear-filter-btn">Clear Filters</button>
          </div>
          
          <div class="history-list">
            <div v-for="(record, index) in filteredInventoryHistory" :key="index" class="history-card">
              <div class="history-header">
                <div class="history-title-container">
                  <span class="history-title">{{ record.item.name }}</span>
                  <span :class="['history-badge', record.action]">{{ record.action }}</span>
                </div>
                <span class="history-date">{{ formatDate(record.date) }}</span>
              </div>
              <div class="history-body">
                <div class="history-row">
                  <span class="history-label">Action:</span>
                  <span>{{ getActionDescription(record) }}</span>
                </div>
                <div class="history-row">
                  <span class="history-label">Quantity:</span>
                  <span>{{ getQuantityDescription(record) }}</span>
                </div>
                <div v-if="record.notes" class="history-row">
                  <span class="history-label">Notes:</span>
                  <span>{{ record.notes }}</span>
                </div>
                <div class="history-row">
                  <span class="history-label">Time:</span>
                  <span>{{ formatTime(record.date) }}</span>
                </div>
                <div class="history-actions">
                  <button 
                    v-if="record.action === 'removed'" 
                    @click="restoreInventoryItem(record)"
                    class="restore-btn"
                  >
                    Restore Item
                  </button>
                  <button 
                    @click="addHistoryNote(index)" 
                    class="edit-btn"
                  >
                    Add Note
                  </button>
                </div>
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
    
    <!-- Note Modal -->
    <div v-if="showNoteModal" class="modal">
      <div class="modal-content">
        <h3>Add Note</h3>
        <textarea 
          v-model="noteText" 
          class="note-textarea" 
          placeholder="Enter your note here..."
        ></textarea>
        <div class="modal-buttons">
          <button @click="saveNote" class="confirm-btn save-note-btn">Save Note</button>
          <button @click="cancelNote" class="cancel-btn">Cancel</button>
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
      inventoryActiveTab: 'current',
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
      
      // Inventory history
      inventoryHistory: [
        { 
          id: 1, 
          item: { name: 'Tape', quantity: 100, threshold: 20 }, 
          action: 'removed', 
          date: new Date(2025, 2, 10), 
          prevQuantity: 100, 
          newQuantity: 0,
          notes: 'Expired stock removed'
        },
        { 
          id: 2, 
          item: { name: 'Boxes', quantity: 30, threshold: 20 }, 
          action: 'updated', 
          date: new Date(2025, 2, 12), 
          prevQuantity: 30, 
          newQuantity: 50,
          notes: 'Restocked'
        },
        { 
          id: 3, 
          item: { name: 'Shipping Labels', quantity: 200, threshold: 50 }, 
          action: 'added', 
          date: new Date(2025, 2, 15), 
          prevQuantity: 0, 
          newQuantity: 200,
          notes: ''
        }
      ],
      historyActionFilter: '',
      historyDateFilter: '',
      
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
      pendingActionData: null,
      
      // Note modal
      showNoteModal: false,
      noteText: '',
      pendingNoteIndex: null
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
    
    filteredInventoryHistory() {
      return this.inventoryHistory.filter(record => {
        const matchesAction = !this.historyActionFilter || record.action === this.historyActionFilter;
        
        let matchesDate = true;
        if (this.historyDateFilter) {
          const filterDate = new Date(this.historyDateFilter);
          const recordDate = new Date(record.date);
          matchesDate = recordDate.toDateString() === filterDate.toDateString();
        }
        
        return matchesAction && matchesDate;
      }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date, newest first
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
        const newInventoryItem = {
          name: this.newItem.name.trim(),
          quantity: this.newItem.quantity,
          threshold: this.newItem.threshold
        };
        
        this.inventory.push(newInventoryItem);
        
        // Add to history
        this.addToInventoryHistory({
          item: { ...newInventoryItem },
          action: 'added',
          prevQuantity: 0,
          newQuantity: newInventoryItem.quantity
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
      const originalItem = { ...this.inventory.find(i => i.name === item.name) };
      
      // Ensure values are valid
      if (item.quantity < 0) item.quantity = 0;
      if (item.threshold < 0) item.threshold = 0;
      
      // Only add to history if quantity changed
      if (originalItem.quantity !== item.quantity) {
        this.addToInventoryHistory({
          item: { ...item },
          action: 'updated',
          prevQuantity: originalItem.quantity,
          newQuantity: item.quantity
        });
      }
      
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
   // Continuation of the methods object

   quickAddStock(item, amount) {
      const prevQuantity = item.quantity;
      item.quantity += amount;
      
      // Add to history
      this.addToInventoryHistory({
        item: { ...item },
        action: 'updated',
        prevQuantity: prevQuantity,
        newQuantity: item.quantity,
        notes: `Quick add: +${amount} units`
      });
    },
    removeInventoryItem(item, index) {
      this.confirmationMessage = `Are you sure you want to remove "${item.name}" from inventory?`;
      this.pendingAction = this.confirmRemoveInventoryItem;
      this.pendingActionData = index;
      this.showConfirmation = true;
    },
    confirmRemoveInventoryItem(index) {
      const item = this.filteredInventory[index];
      const actualIndex = this.inventory.findIndex(i => i.name === item.name);
      
      if (actualIndex !== -1) {
        const removedItem = this.inventory[actualIndex];
        
        // Add to history before removing
        this.addToInventoryHistory({
          item: { ...removedItem },
          action: 'removed',
          prevQuantity: removedItem.quantity,
          newQuantity: 0
        });
        
        // Remove the item
        this.inventory.splice(actualIndex, 1);
      }
    },
    addToInventoryHistory(record) {
      this.inventoryHistory.push({
        id: this.inventoryHistory.length + 1,
        date: new Date(),
        notes: '',
        ...record
      });
    },
    matchesStockFilter(item) {
      if (!this.inventoryStockFilter) return true;
      
      if (this.inventoryStockFilter === 'low') {
        return item.quantity > 0 && item.quantity <= item.threshold;
      }
      
      if (this.inventoryStockFilter === 'out') {
        return item.quantity <= 0;
      }
      
      return true;
    },
    clearHistoryFilters() {
      this.historyActionFilter = '';
      this.historyDateFilter = '';
    },
    restoreInventoryItem(record) {
      // Check if item already exists
      const existingIndex = this.inventory.findIndex(item => item.name === record.item.name);
      
      if (existingIndex !== -1) {
        // Item exists, just update quantity
        const prevQuantity = this.inventory[existingIndex].quantity;
        this.inventory[existingIndex].quantity += record.item.quantity;
        
        // Add history record
        this.addToInventoryHistory({
          item: { ...this.inventory[existingIndex] },
          action: 'updated',
          prevQuantity: prevQuantity,
          newQuantity: this.inventory[existingIndex].quantity,
          notes: 'Restored from history'
        });
      } else {
        // Item doesn't exist, add it back
        this.inventory.push({ ...record.item });
        
        // Add history record
        this.addToInventoryHistory({
          item: { ...record.item },
          action: 'added',
          prevQuantity: 0,
          newQuantity: record.item.quantity,
          notes: 'Restored from history'
        });
      }
    },
    addHistoryNote(index) {
      this.pendingNoteIndex = index;
      this.noteText = this.inventoryHistory[index].notes || '';
      this.showNoteModal = true;
    },
    saveNote() {
      if (this.pendingNoteIndex !== null) {
        this.inventoryHistory[this.pendingNoteIndex].notes = this.noteText;
        this.cancelNote();
      }
    },
    cancelNote() {
      this.showNoteModal = false;
      this.noteText = '';
      this.pendingNoteIndex = null;
    },
    
    // Assignment methods
    createAssignment() {
      if (this.newAssignment.driverId && this.newAssignment.vehicleId) {
        // Create the assignment
        const assignmentId = this.assignmentIdCounter++;
        const newAssignment = {
          id: assignmentId,
          driverId: this.newAssignment.driverId,
          vehicleId: this.newAssignment.vehicleId,
          createdAt: new Date(),
          endedAt: null
        };
        
        this.assignments.push(newAssignment);
        
        // Update driver status
        const driver = this.getDriverById(this.newAssignment.driverId);
        if (driver) {
          driver.status = 'Assigned';
          driver.vehicleId = this.newAssignment.vehicleId;
        }
        
        // Update vehicle status
        const vehicle = this.getVehicleById(this.newAssignment.vehicleId);
        if (vehicle) {
          vehicle.status = 'In Transit';
        }
        
        // Reset form
        this.newAssignment = {
          driverId: '',
          vehicleId: ''
        };
      }
    },
    endAssignment(index) {
      const assignment = this.currentAssignments[index];
      this.confirmationMessage = `Are you sure you want to end assignment #${assignment.id}?`;
      this.pendingAction = this.confirmEndAssignment;
      this.pendingActionData = index;
      this.showConfirmation = true;
    },
    confirmEndAssignment(index) {
      const assignment = this.currentAssignments[index];
      const actualIndex = this.assignments.findIndex(a => a.id === assignment.id);
      
      if (actualIndex !== -1) {
        // End the assignment
        this.assignments[actualIndex].endedAt = new Date();
        
        // Update driver status
        const driver = this.getDriverById(assignment.driverId);
        if (driver) {
          driver.status = 'Available';
          driver.vehicleId = '';
        }
        
        // Update vehicle status
        const vehicle = this.getVehicleById(assignment.vehicleId);
        if (vehicle) {
          vehicle.status = 'Idle';
        }
      }
    },
    
    // Utility methods
    getDriverById(driverId) {
      return this.drivers.find(driver => driver.id === driverId) || {};
    },
    getVehicleById(vehicleId) {
      return this.vehicles.find(vehicle => vehicle.id === vehicleId) || {};
    },
    formatDate(date) {
      if (!date) return 'N/A';
      const d = new Date(date);
      return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    },
    formatTime(date) {
      if (!date) return 'N/A';
      const d = new Date(date);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    },
    getCurrentDate() {
      const now = new Date();
      return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    },
    getActionDescription(record) {
      switch (record.action) {
        case 'added':
          return `Added to inventory`;
        case 'removed':
          return `Removed from inventory`;
        case 'updated':
          if (record.prevQuantity < record.newQuantity) {
            return `Increased stock by ${record.newQuantity - record.prevQuantity} units`;
          } else {
            return `Decreased stock by ${record.prevQuantity - record.newQuantity} units`;
          }
        default:
          return record.action;
      }
    },
    getQuantityDescription(record) {
      switch (record.action) {
        case 'added':
          return `Initial quantity: ${record.newQuantity}`;
        case 'removed':
          return `Final quantity: 0 (was ${record.prevQuantity})`;
        case 'updated':
          return `Changed from ${record.prevQuantity} to ${record.newQuantity}`;
        default:
          return `${record.newQuantity}`;
      }
    },
    
    // Confirmation methods
    confirmAction() {
      if (typeof this.pendingAction === 'function') {
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

<style>
/* Base styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

/* Dashboard layout */
.logistics-management {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .logistics-management {
    padding: 15px;
  }
}

@media (max-width: 768px) {
  .logistics-management {
    padding: 10px;
  }
}

/* Header styles */
.dashboard-header {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dashboard-header h1 {
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: #2c3e50;
}

.dashboard-stats {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 15px;
}

.stat-card {
  flex: 1;
  min-width: 200px;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

@media (max-width: 768px) {
  .stat-card {
    min-width: calc(50% - 15px);
  }
}

@media (max-width: 480px) {
  .stat-card {
    min-width: 100%;
  }
}

.stat-title {
  font-size: 1rem;
  color: #6c757d;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
}

.stat-subtitle {
  font-size: 0.9rem;
  color: #6c757d;
  margin-top: 5px;
}

/* Tab styles */
.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 20px;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 10px;
}

.tab-button {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px 4px 0 0;
  padding: 10px 15px;
  font-size: 1rem;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-button:hover {
  background-color: #e9ecef;
}

.tab-button.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

@media (max-width: 576px) {
  .tabs {
    justify-content: center;
  }
  
  .tab-button {
    flex: 1;
    text-align: center;
    padding: 8px 10px;
    font-size: 0.9rem;
  }
}

/* Section styles */
.section {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

.section-header h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0;
}

.search-filter {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 576px) {
  .search-filter {
    width: 100%;
  }
  
  .search-filter input,
  .search-filter select {
    flex: 1;
  }
}

/* Form styles */
.form-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.form-group input,
.form-group select,
.form-group button {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input,
.form-group select {
  flex: 1;
  min-width: 100px;
}

@media (max-width: 768px) {
  .form-group {
    flex-direction: column;
  }
  
  .form-group input,
  .form-group select,
  .form-group button {
    width: 100%;
  }
}

/* Button styles */
button {
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
}

.add-btn:hover {
  background-color: #218838;
}

.add-btn:disabled {
  background-color: #a0c7a9;
  cursor: not-allowed;
}

.edit-btn {
  background-color: #17a2b8;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
}

.edit-btn:hover {
  background-color: #138496;
}

.remove-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
}

.remove-btn:hover {
  background-color: #c82333;
}

.quick-add-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.quick-add-btn:hover {
  background-color: #5a6268;
}

.clear-filter-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
}

.restore-btn {
  background-color: #ffc107;
  color: #212529;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
}

.restore-btn:hover {
  background-color: #e0a800;
}

/* Card styles */
.list-container {
  margin-top: 20px;
}

.list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

@media (max-width: 640px) {
  .list {
    grid-template-columns: 1fr;
  }
}

.item-card {
  background-color: #fff;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 12px 15px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-weight: 600;
  font-size: 1.1rem;
  color: #2c3e50;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-body {
  padding: 15px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 5px;
}

.info-label {
  font-weight: 500;
  color: #6c757d;
  min-width: 80px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

/* Status badges */
.status-badge {
  padding: 4px 8px;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 500;
  color: white;
}

.available {
  background-color: #28a745;
}

.assigned {
  background-color: #17a2b8;
}

.off-duty {
  background-color: #6c757d;
}

.idle {
  background-color: #28a745;
}

.in-transit {
  background-color: #007bff;
}

.maintenance {
  background-color: #ffc107;
  color: #212529;
}

.in-stock {
  background-color: #28a745;
}

.low-stock {
  background-color: #ffc107;
  color: #212529;
}

.out-of-stock {
  background-color: #dc3545;
}

/* Inventory styles */
.quantity-input,
.threshold-input {
  width: 80px;
  padding: 4px 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.inventory-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #dee2e6;
}

.inventory-tab {
  background-color: transparent;
  border: none;
  padding: 10px 15px;
  font-size: 1rem;
  color: #6c757d;
  cursor: pointer;
}

.inventory-tab.active {
  color: #007bff;
  border-bottom: 2px solid #007bff;
}

/* History styles */
.history-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

@media (max-width: 576px) {
  .history-filters {
    flex-direction: column;
  }
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.history-card {
  background-color: #fff;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.history-header {
  padding: 12px 15px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-title-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.history-title {
  font-weight: 600;
  font-size: 1.1rem;
  color: #2c3e50;
}

.history-badge {
  padding: 4px 8px;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 500;
  color: white;
}

.history-badge.added {
  background-color: #28a745;
}

.history-badge.removed {
  background-color: #dc3545;
}

.history-badge.updated {
  background-color: #17a2b8;
}

.history-date {
  font-size: 0.9rem;
  color: #6c757d;
}

.history-body {
  padding: 15px;
}

.history-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

@media (min-width: 576px) {
  .history-row {
    flex-direction: row;
    gap: 10px;
  }
}

.history-label {
  font-weight: 500;
  color: #6c757d;
  min-width: 80px;
}

.history-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.confirm-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
}

.confirm-btn:hover {
  background-color: #0069d9;
}

.cancel-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
}

.cancel-btn:hover {
  background-color: #5a6268;
}

.save-note-btn {
  background-color: #28a745;
}

.save-note-btn:hover {
  background-color: #218838;
}

.note-textarea {
  width: 100%;
  height: 100px;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  resize: vertical;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 30px;
  color: #6c757d;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px dashed #dee2e6;
}

/* Additional responsive adjustments */
@media (max-width: 480px) {
  .dashboard-header h1 {
    font-size: 1.5rem;
  }
  
  .section-header h2 {
    font-size: 1.3rem;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .actions button {
    width: 100%;
  }
}

/* Print styles */
@media print {
  body {
    background-color: white;
  }
  
  .logistics-management {
    max-width: 100%;
    padding: 0;
  }
  
  .section {
    box-shadow: none;
    border: 1px solid #e9ecef;
    break-inside: avoid;
  }
  
  .tabs, 
  .form-group, 
  .actions, 
  .edit-btn, 
  .remove-btn,
  .quick-add-btn,
  .search-filter {
    display: none;
  }
  
  .list {
    display: block;
  }
  
  .item-card {
    margin-bottom: 20px;
    box-shadow: none;
    border: 1px solid #e9ecef;
  }
}
</style>
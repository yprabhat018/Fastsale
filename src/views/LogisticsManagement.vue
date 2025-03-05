
<template>
  <div class="logistics-management">
    <h2>Logistics Management</h2>

    <!-- Drivers Section -->
    <div class="section drivers-section">
      <h3>Drivers</h3>
      <input v-model="newDriver" placeholder="Add driver name" @keyup.enter="addDriver" />
      <div class="list">
        <div v-for="(driver, index) in drivers" :key="index" class="item-card">
          <span>{{ driver.name }}</span>
          <select v-model="driver.status">
            <option>Available</option>
            <option>Assigned</option>
            <option>Off Duty</option>
          </select>
          <select v-model="driver.vehicleId" :disabled="driver.status !== 'Assigned'">
            <option value="">No Vehicle</option>
            <option v-for="vehicle in vehicles" :key="vehicle.id" :value="vehicle.id">{{ vehicle.name }}</option>
          </select>
          <button @click="removeDriver(index)" class="remove-btn">Remove</button>
        </div>
      </div>
    </div>

    <!-- Vehicles Section -->
    <div class="section vehicles-section">
      <h3>Vehicles</h3>
      <input v-model="newVehicle" placeholder="Add vehicle (e.g., Truck A)" @keyup.enter="addVehicle" />
      <div class="list">
        <div v-for="(vehicle, index) in vehicles" :key="vehicle.id" class="item-card">
          <span>{{ vehicle.name }}</span>
          <select v-model="vehicle.status">
            <option>Idle</option>
            <option>In Transit</option>
            <option>Maintenance</option>
          </select>
          <span>Driver: {{ getDriverName(vehicle.id) || 'None' }}</span>
          <button @click="removeVehicle(index)" class="remove-btn">Remove</button>
        </div>
      </div>
    </div>

    <!-- Inventory Section -->
    <div class="section inventory-section">
      <h3>Inventory</h3>
      <div class="inventory-inputs">
        <input v-model="newItem" placeholder="Item name" @keyup.enter="addItem" />
        <input v-model.number="newItemQuantity" type="number" min="0" placeholder="Units" @keyup.enter="addItem" />
        <button @click="addItem" :disabled="!newItem || newItemQuantity < 0" class="add-btn">Add</button>
      </div>
      <div class="list">
        <div v-for="(item, index) in inventory" :key="index" class="item-card">
          <span>{{ item.name }} - {{ item.quantity }} units</span>
          <button @click="removeItem(index)" class="remove-btn">Remove</button>
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
      newDriver: '',
      drivers: [
        { name: 'Amit', status: 'Available', vehicleId: '' },
        { name: 'Priya', status: 'Assigned', vehicleId: '1' },
      ],
      newVehicle: '',
      vehicles: [
        { id: '1', name: 'Truck A', status: 'In Transit' },
        { id: '2', name: 'Van B', status: 'Idle' },
      ],
      newItem: '',
      newItemQuantity: null,
      inventory: [
        { name: 'Boxes', quantity: 50 },
        { name: 'Pallets', quantity: 20 },
      ],
    };
  },
  methods: {
    addDriver() {
      if (this.newDriver.trim()) {
        this.drivers.push({ name: this.newDriver.trim(), status: 'Available', vehicleId: '' });
        this.newDriver = '';
      }
    },
    removeDriver(index) {
      this.drivers.splice(index, 1);
    },
    addVehicle() {
      if (this.newVehicle.trim()) {
        this.vehicles.push({ id: Date.now().toString(), name: this.newVehicle.trim(), status: 'Idle' });
        this.newVehicle = '';
      }
    },
    removeVehicle(index) {
      const vehicleId = this.vehicles[index].id;
      this.drivers.forEach(driver => {
        if (driver.vehicleId === vehicleId) driver.vehicleId = '';
      });
      this.vehicles.splice(index, 1);
    },
    addItem() {
      if (this.newItem.trim() && this.newItemQuantity >= 0) {
        this.inventory.push({ name: this.newItem.trim(), quantity: this.newItemQuantity });
        this.newItem = '';
        this.newItemQuantity = null;
      }
    },
    removeItem(index) {
      this.inventory.splice(index, 1);
    },
    getDriverName(vehicleId) {
      const driver = this.drivers.find(d => d.vehicleId === vehicleId);
      return driver ? driver.name : null;
    },
  },
};
</script>

<style scoped>
.logistics-management {
  padding: 20px;
  background-color: #f9f9f9;
  min-height: 100vh;
}
h2 {
  color: #333;
  margin-bottom: 20px;
}
.section {
  margin-top: 20px;
  background-color: #fff;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
h3 {
  font-size: 18px;
  color: #555;
  margin-bottom: 10px;
}
input {
  width: 200px;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 3px;
}
.inventory-inputs {
  display: flex;
  gap: 10px;
  align-items: center;
}
.inventory-inputs input[type="number"] {
  width: 100px;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.item-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
}
.item-card span {
  flex: 1;
}
select {
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 3px;
}
.remove-btn {
  padding: 5px 10px;
  background-color: #ff4d4d;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}
.remove-btn:hover {
  background-color: #e60000;
}
.add-btn {
  padding: 8px 15px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}
.add-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
.add-btn:hover:not(:disabled) {
  background-color: #388e3c;
}
</style>


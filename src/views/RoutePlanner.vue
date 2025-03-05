
<template>
  <div id="route-planner">
    <div class="map-container">
      <div id="map"></div>
    </div>
    <div class="control-panel">
      <div class="saved-routes" v-if="savedRoutes.length > 0">
        <h3>Saved Routes</h3>
        <button @click="exportToCSV" class="export-btn">Export to CSV</button>
        <div v-for="(route, index) in savedRoutes" :key="index" class="saved-route">
          <div class="saved-route-info">
            <p @click="loadSavedRoute(index)">
              {{ route.summary }} ({{ route.start }} to {{ route.end }}) - 
              {{ (route.adjustedDuration || route.duration || 0).toFixed(1) }} hrs - 
              ₹{{ (route.cost || 0).toFixed(2) }}
              <span v-if="route.hazard && route.hazard !== 'None'"> - {{ route.hazard }}</span>
              <span v-if="route.priority"> - Priority: {{ route.priority }}</span>
              <span v-if="route.status"> - Status: {{ route.status }}</span>
            </p>
            <input type="text" v-model="route.notes" @blur="updateNotes" placeholder="Add/edit notes..." maxlength="100" />
          </div>
          <button @click="deleteRoute(index)" class="delete-btn" :disabled="isDeleting">
            <span v-if="!isDeleting">Delete</span>
            <span v-else class="spinner"></span>
          </button>
        </div>
      </div>
      <h2>Plan Your Route</h2>
      <input type="text" v-model="start" placeholder="Start Location" />
      <input type="text" v-model="end" placeholder="End Location" />
      <select v-model="vehicle">
        <option value="car">Car</option>
        <option value="truck">Truck</option>
      </select>
      <select v-model="optimization">
        <option value="fastest">Fastest Route</option>
        <option value="shortest">Shortest Route</option>
        <option value="eco">Least Emissions</option>
      </select>
      <button @click="calculateRoute" :disabled="isLoading">
        <span v-if="!isLoading">Calculate Route</span>
        <span v-else class="spinner"></span>
      </button>

      <div class="fuel-costs-section">
        <h3>Fuel Costs</h3>
        <input type="number" v-model.number="costRate" step="1" min="0" placeholder="Petrol Cost (₹/L)" class="cost-rate-input" />
      </div>

      <div class="time-adjustment-section">
        <h3>Time Adjustment</h3>
        <input type="number" v-model.number="timeAdjustment" step="0.1" placeholder="Time Adjust (hrs)" class="time-adjust-input" />
      </div>

      <div class="routes" v-if="routes.length > 0">
        <h3>Route Options</h3>
        <div v-for="route in routes" :key="route.index" class="route-option">
          <input type="radio" :value="route.index" v-model="selectedRoute" @change="selectRoute" />
          <label>{{ route.summary }}</label>
          <p>Time: {{ route.duration.toFixed(1) }} hrs | Distance: {{ route.distance.toFixed(1) }} km | CO2: {{ route.co2.toFixed(1) }} kg</p>
        </div>
      </div>

      <div class="metrics" v-if="distance > 0">
        <p>Distance: {{ distance.toFixed(1) }} km</p>
        <div class="metrics-time">
          <h4>Time</h4>
          <p>{{ (routes[selectedRoute].duration + timeAdjustment).toFixed(1) }} hrs (Adjusted)</p>
        </div>
        <div class="metrics-cost">
          <h4>Cost</h4>
          <p>Fuel Used: {{ fuelUsed.toFixed(1) }} L</p>
          <p>CO2 Emitted: {{ co2Emitted.toFixed(1) }} kg</p>
          <p>Estimated Cost: ₹{{ (fuelUsed * costRate).toFixed(2) }}</p>
        </div>
        <input type="text" v-model="routeNotes" placeholder="Add route notes..." maxlength="100" />
        <div class="option-group">
          <label class="option-label">Route Hazard</label>
          <select v-model="selectedHazard" class="hazard-select">
            <option v-for="option in hazardOptions" :key="option" :value="option">{{ option }}</option>
          </select>
        </div>
        <div class="option-group">
          <label class="option-label">Priority Level</label>
          <select v-model="selectedPriority" class="priority-select">
            <option v-for="option in priorityOptions" :key="option" :value="option">{{ option }}</option>
          </select>
        </div>
        <div class="option-group">
          <label class="option-label">Route Status</label>
          <select v-model="selectedStatus" class="status-select">
            <option v-for="option in statusOptions" :key="option" :value="option">{{ option }}</option>
          </select>
        </div>
        <button @click="saveRoute" :disabled="isSaving">
          <span v-if="!isSaving">Save Route</span>
          <span v-else class="spinner"></span>
        </button>
        <button @click="copyShareLink" :disabled="isCopying">
          <span v-if="!isCopying">Copy Link</span>
          <span v-else class="spinner"></span>
        </button>
      </div>

      <div class="weather" v-if="startWeather && endWeather">
        <h3>Weather Conditions</h3>
        <p>Start: {{ startWeather.weather[0].description }}, {{ startWeather.main.temp }}°C</p>
        <p>End: {{ endWeather.weather[0].description }}, {{ endWeather.main.temp }}°C</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'RoutePlanner',
  data() {
    return {
      start: '',
      end: '',
      vehicle: 'car',
      optimization: 'fastest',
      map: null,
      directionsService: null,
      directionsRenderer: null,
      distance: 0,
      fuelUsed: 0,
      co2Emitted: 0,
      startWeather: null,
      endWeather: null,
      isLoading: false,
      routes: [],
      selectedRoute: 0,
      savedRoutes: [],
      isSaving: false,
      isDeleting: false,
      isCopying: false,
      routeNotes: '',
      costRate: 100,
      timeAdjustment: 0,
      selectedHazard: 'None',
      hazardOptions: ['None', 'Roadwork', 'Heavy Traffic', 'Accident Prone', 'Bad Weather', 'Other'],
      selectedPriority: 'Medium',
      priorityOptions: ['High', 'Medium', 'Low'],
      selectedStatus: 'Planned',
      statusOptions: ['Planned', 'In Progress', 'Completed'],
    };
  },
  mounted() {
    // Wait for Google Maps to load
    if (window.google && window.google.maps) {
      this.initializeMap();
      this.loadInitialData();
    } else {
      const interval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(interval);
          this.initializeMap();
          this.loadInitialData();
        }
      }, 100);
    }
  },
  methods: {
    initializeMap() {
      this.map = new window.google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.7749, lng: -122.4194 },
        zoom: 12,
      });
      const trafficLayer = new window.google.maps.TrafficLayer();
      trafficLayer.setMap(this.map);
      this.directionsService = new window.google.maps.DirectionsService();
      this.directionsRenderer = new window.google.maps.DirectionsRenderer();
      this.directionsRenderer.setMap(this.map);
    },
    loadInitialData() {
      const storedRoutes = JSON.parse(localStorage.getItem('savedRoutes')) || [];
      this.savedRoutes = storedRoutes.map(route => ({
        ...route,
        cost: route.cost || 0,
        adjustedDuration: route.adjustedDuration || route.duration || 0,
        timeAdjustment: route.timeAdjustment || 0,
        notes: route.notes || 'No notes',
        hazard: route.hazard || 'None',
        priority: route.priority || 'Medium',
        status: route.status || 'Planned',
      }));
      this.loadRouteFromUrl();
    },
    async calculateRoute(summaryToMatch = null) {
      if (!this.start || !this.end) {
        alert('Please enter both start and end locations!');
        return;
      }
      if (!this.directionsService || !this.directionsRenderer) {
        console.error('Directions service not initialized yet!');
        return;
      }
      this.isLoading = true;
      const request = {
        origin: this.start,
        destination: this.end,
        travelMode: 'DRIVING',
        provideRouteAlternatives: true,
      };
      this.directionsService.route(request, async (result, status) => {
        if (status === 'OK') {
          let tempRoutes = result.routes.map((route, index) => {
            const distance = route.legs[0].distance.value / 1000;
            const duration = route.legs[0].duration.value / 3600;
            const fuelRates = { car: 0.1, truck: 0.3 };
            const co2PerLiter = 2.3;
            const fuel = distance * fuelRates[this.vehicle];
            const co2 = fuel * co2PerLiter;
            const cost = fuel * this.costRate;
            return {
              index,
              distance,
              duration,
              fuel,
              co2,
              cost,
              summary: route.summary || `Route ${index + 1}`,
            };
          });

          if (this.optimization === 'fastest') {
            tempRoutes = [...tempRoutes].sort((a, b) => a.duration - b.duration);
          } else if (this.optimization === 'shortest') {
            tempRoutes = [...tempRoutes].sort((a, b) => a.distance - b.distance);
          } else if (this.optimization === 'eco') {
            tempRoutes = [...tempRoutes].sort((a, b) => a.co2 - b.co2);
          }
          this.routes = tempRoutes.map((route, idx) => ({ ...route, index: idx }));

          if (summaryToMatch) {
            const matchedRoute = this.routes.find(route => route.summary === summaryToMatch);
            this.selectedRoute = matchedRoute ? matchedRoute.index : 0;
          } else {
            this.selectedRoute = 0;
          }

          this.directionsRenderer.setDirections(result);
          this.directionsRenderer.setRouteIndex(this.routes[this.selectedRoute].index);
          this.distance = this.routes[this.selectedRoute].distance;
          this.fuelUsed = this.routes[this.selectedRoute].fuel;
          this.co2Emitted = this.routes[this.selectedRoute].co2;

          const startLat = result.routes[0].legs[0].start_location.lat();
          const startLng = result.routes[0].legs[0].start_location.lng();
          const endLat = result.routes[0].legs[0].end_location.lat();
          const endLng = result.routes[0].legs[0].end_location.lng();

          const apiKey = '7b9dfa089f8262f39ad120d20b54d8d2'; // Replace with your key
          try {
            const startResponse = await axios.get(
              `https://api.openweathermap.org/data/2.5/weather?lat=${startLat}&lon=${startLng}&appid=${apiKey}&units=metric`
            );
            const endResponse = await axios.get(
              `https://api.openweathermap.org/data/2.5/weather?lat=${endLat}&lon=${endLng}&appid=${apiKey}&units=metric`
            );
            this.startWeather = startResponse.data;
            this.endWeather = endResponse.data;
          } catch (error) {
            console.error('Error fetching weather:', error);
            this.startWeather = null;
            this.endWeather = null;
          }
        } else {
          console.error('Error finding route:', status);
          alert('Couldn’t find a route. Try different locations!');
        }
        this.isLoading = false;
      });
    },
    selectRoute() {
      this.directionsRenderer.setRouteIndex(this.selectedRoute);
      const route = this.routes[this.selectedRoute];
      this.distance = route.distance;
      this.fuelUsed = route.fuel;
      this.co2Emitted = route.co2;
    },
    async saveRoute() {
      this.isSaving = true;
      const routeToSave = {
        start: this.start,
        end: this.end,
        vehicle: this.vehicle,
        optimization: this.optimization,
        distance: this.distance,
        duration: this.routes[this.selectedRoute].duration,
        adjustedDuration: this.routes[this.selectedRoute].duration + this.timeAdjustment,
        fuel: this.fuelUsed,
        co2: this.co2Emitted,
        summary: this.routes[this.selectedRoute].summary,
        notes: this.routeNotes || 'No notes',
        cost: this.fuelUsed * this.costRate,
        timeAdjustment: this.timeAdjustment,
        hazard: this.selectedHazard,
        priority: this.selectedPriority,
        status: this.selectedStatus,
      };
      this.savedRoutes.push(routeToSave);
      localStorage.setItem('savedRoutes', JSON.stringify(this.savedRoutes));
      await new Promise(resolve => setTimeout(resolve, 500));
      this.routeNotes = '';
      this.timeAdjustment = 0;
      this.selectedHazard = 'None';
      this.selectedPriority = 'Medium';
      this.selectedStatus = 'Planned';
      this.isSaving = false;
    },
    loadSavedRoute(index) {
      const saved = this.savedRoutes[index];
      this.start = saved.start;
      this.end = saved.end;
      this.vehicle = saved.vehicle;
      this.optimization = saved.optimization;
      this.routeNotes = saved.notes;
      this.timeAdjustment = saved.timeAdjustment || 0;
      this.selectedHazard = saved.hazard || 'None';
      this.selectedPriority = saved.priority || 'Medium';
      this.selectedStatus = saved.status || 'Planned';
      this.calculateRoute(saved.summary);
    },
    async deleteRoute(index) {
      this.isDeleting = true;
      this.savedRoutes.splice(index, 1);
      localStorage.setItem('savedRoutes', JSON.stringify(this.savedRoutes));
      await new Promise(resolve => setTimeout(resolve, 500));
      this.isDeleting = false;
    },
    getShareLink() {
      const baseUrl = window.location.origin + '/route-planner';
      const params = new URLSearchParams({
        start: this.start,
        end: this.end,
        vehicle: this.vehicle,
        optimization: this.optimization,
        summary: this.routes[this.selectedRoute].summary,
        notes: this.routeNotes || '',
        costRate: this.costRate,
        timeAdjustment: this.timeAdjustment,
        hazard: this.selectedHazard,
        priority: this.selectedPriority,
        status: this.selectedStatus,
      }).toString();
      return `${baseUrl}?${params}`;
    },
    loadRouteFromUrl() {
      const urlParams = new URLSearchParams(window.location.search);
      const start = urlParams.get('start');
      const end = urlParams.get('end');
      const vehicle = urlParams.get('vehicle');
      const optimization = urlParams.get('optimization');
      const summary = urlParams.get('summary');
      const notes = urlParams.get('notes');
      const costRate = urlParams.get('costRate');
      const timeAdjustment = urlParams.get('timeAdjustment');
      const hazard = urlParams.get('hazard');
      const priority = urlParams.get('priority');
      const status = urlParams.get('status');
      if (start && end) {
        this.start = start;
        this.end = end;
        this.vehicle = vehicle || 'car';
        this.optimization = optimization || 'fastest';
        this.routeNotes = notes || '';
        this.costRate = parseFloat(costRate) || 100;
        this.timeAdjustment = parseFloat(timeAdjustment) || 0;
        this.selectedHazard = hazard || 'None';
        this.selectedPriority = priority || 'Medium';
        this.selectedStatus = status || 'Planned';
        this.calculateRoute(summary);
      }
    },
    async copyShareLink() {
      this.isCopying = true;
      const link = this.getShareLink();
      try {
        await navigator.clipboard.writeText(link);
      } catch (error) {
        console.error('Failed to copy link:', error);
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      this.isCopying = false;
    },
    async updateNotes() {
      localStorage.setItem('savedRoutes', JSON.stringify(this.savedRoutes));
    },
    exportToCSV() {
      if (this.savedRoutes.length === 0) {
        alert('No saved routes to export!');
        return;
      }
      const headers = [
        'Start', 'End', 'Vehicle', 'Optimization', 'Summary', 
        'Distance (km)', 'Duration (hrs)', 'Adjusted Duration (hrs)', 
        'Fuel Used (L)', 'CO2 Emitted (kg)', 'Cost (₹)', 
        'Time Adjustment (hrs)', 'Notes', 'Hazard', 'Priority', 'Status'
      ];
      const rows = this.savedRoutes.map(route => [
        `"${route.start}"`,
        `"${route.end}"`,
        route.vehicle,
        route.optimization,
        `"${route.summary}"`,
        route.distance.toFixed(1),
        route.duration.toFixed(1),
        (route.adjustedDuration || route.duration || 0).toFixed(1),
        route.fuel.toFixed(1),
        route.co2.toFixed(1),
        route.cost.toFixed(2),
        route.timeAdjustment.toFixed(1),
        `"${route.notes}"`,
        route.hazard,
        route.priority,
        route.status,
      ].join(','));
      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `saved_routes_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  },
};
</script>

<style scoped>
#route-planner {
  display: flex;
  min-height: 100vh;
  height: 100%;
}
.map-container {
  flex: 7;
}
#map {
  width: 100%;
  height: 100%;
  min-height: 100vh;
}
.control-panel {
  flex: 3;
  padding: 20px;
  background-color: #f0f0f0;
  box-sizing: border-box;
}
input, select, button {
  width: 100%;
  margin: 10px 0;
  padding: 10px;
}
button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-top: 2px solid #333;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.fuel-costs-section, .time-adjustment-section {
  margin-top: 15px;
}
.fuel-costs-section h3, .time-adjustment-section h3 {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #333;
}
.cost-rate-input, .time-adjust-input {
  width: 120px;
  margin: 0;
  padding: 5px;
  font-size: 12px;
}
.hazard-select, .priority-select, .status-select {
  width: 150px;
  margin: 5px 0;
  padding: 5px;
  font-size: 12px;
}
.routes {
  margin-top: 20px;
  background-color: #f0f8ff;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.routes h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
}
.route-option {
  margin: 10px 0;
}
.route-option label {
  margin-left: 5px;
  font-weight: bold;
}
.route-option p {
  margin: 5px 0 0 20px;
  font-size: 14px;
}
.metrics {
  margin-top: 20px;
  background-color: #e0f0e0;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.metrics p {
  margin: 8px 0;
  font-weight: bold;
  color: #333;
}
.metrics-time, .metrics-cost {
  margin-top: 10px;
}
.metrics-time h4, .metrics-cost h4 {
  margin: 0 0 5px 0;
  font-size: 13px;
  color: #555;
  font-weight: bold;
}
.metrics input[type="text"] {
  margin: 5px 0;
  padding: 5px;
  font-size: 12px;
}
.option-group {
  margin: 5px 0;
}
.option-label {
  display: block;
  font-size: 12px;
  font-weight: bold;
  color: #555;
  margin-bottom: 2px;
}
.weather {
  margin-top: 20px;
  background-color: #e0f0ff;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.weather h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
}
.weather p {
  margin: 5px 0;
  color: #333;
}
.saved-routes {
  margin-bottom: 20px;
  background-color: #fff8e1;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.saved-routes h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
}
.saved-route {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 5px 0;
}
.saved-route-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.saved-route p {
  margin: 0 0 5px 0;
  cursor: pointer;
}
.saved-route p.status-planned { color: #007bff; }
.saved-route p.status-in-progress { color: #ff9800; }
.saved-route p.status-completed { color: #4caf50; }
.saved-route p:hover { text-decoration: underline; }
.saved-route input[type="text"] {
  width: 100%;
  margin: 0;
  padding: 5px;
  font-size: 12px;
  border: 1px solid #ccc;
  border-radius: 3px;
}
.delete-btn {
  width: auto;
  padding: 5px 10px;
  background-color: #ff4d4d;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
}
.delete-btn:disabled { background-color: #ff9999; cursor: not-allowed; }
.delete-btn .spinner { vertical-align: middle; }
.metrics button {
  width: auto;
  padding: 5px 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  margin: 5px 5px 0 0;
}
.metrics button:nth-child(6) { background-color: #007bff; }
.metrics button:disabled { background-color: #ccc; }
.metrics button .spinner { vertical-align: middle; }
.export-btn {
  width: auto;
  padding: 5px 10px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  margin: 5px 0 10px 0;
}
.export-btn:hover { background-color: #1976d2; }
</style>
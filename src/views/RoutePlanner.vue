<template>
  <div id="route-planner">
    <div class="map-container">
      <div id="map"></div>
    </div>
    <div class="control-panel">
      <div class="saved-routes" v-if="savedRoutes.length > 0">
        <h3><i class="fas fa-bookmark"></i> Saved Routes</h3>
        <button @click="exportToCSV" class="export-btn"><i class="fas fa-file-export"></i> Export to CSV</button>
        <div v-for="(route, index) in savedRoutes" :key="index" class="saved-route">
          <div class="saved-route-info">
            <p @click="loadSavedRoute(index)">
              <i class="fas fa-route"></i> {{ route.summary }} ({{ route.start }} to {{ route.end }}) - 
              {{ (route.adjustedDuration || route.duration || 0).toFixed(1) }} hrs - 
              ₹{{ (route.cost || 0).toFixed(2) }}
              <span v-if="route.hazard && route.hazard !== 'None'" class="badge hazard-badge">{{ route.hazard }}</span>
              <span v-if="route.priority" class="badge priority-badge">Priority: {{ route.priority }}</span>
              <span v-if="route.status" class="badge status-badge">{{ route.status }}</span>
            </p>
            <input type="text" v-model="route.notes" @blur="updateNotes" placeholder="Add/edit notes..." maxlength="100" />
          </div>
          <button @click="deleteRoute(index)" class="delete-btn" :disabled="isDeleting">
            <span v-if="!isDeleting"><i class="fas fa-trash-alt"></i></span>
            <span v-else class="spinner"></span>
          </button>
        </div>
      </div>
      <div class="section-card main-form">
        <h2><i class="fas fa-map-marked-alt"></i> Plan Your Route</h2>
        <div class="input-group">
          <i class="fas fa-play-circle icon"></i>
          <input type="text" v-model="start" placeholder="Start Location" />
        </div>
        <div class="input-group">
          <i class="fas fa-flag-checkered icon"></i>
          <input type="text" v-model="end" placeholder="End Location" />
        </div>
        <div class="form-row">
          <div class="input-group half">
            <i class="fas fa-truck icon"></i>
            <select v-model="vehicle">
              <option value="car">Car</option>
              <option value="truck">Truck</option>
            </select>
          </div>
          <div class="input-group half">
            <i class="fas fa-chart-line icon"></i>
            <select v-model="optimization">
              <option value="fastest">Fastest Route</option>
              <option value="shortest">Shortest Route</option>
              <option value="eco">Least Emissions</option>
            </select>
          </div>
        </div>
        <button @click="calculateRoute" :disabled="isLoading" class="primary-btn">
          <span v-if="!isLoading"><i class="fas fa-calculator"></i> Calculate Route</span>
          <span v-else class="spinner"></span>
        </button>
      </div>

      <div class="form-row">
        <div class="section-card half fuel-costs-section">
          <h3><i class="fas fa-gas-pump"></i> Fuel Costs</h3>
          <div class="input-group">
            <input type="number" v-model.number="costRate" step="1" min="0" placeholder="Petrol Cost (₹/L)" class="cost-rate-input" />
            <span class="unit">₹/L</span>
          </div>
        </div>

        <div class="section-card half time-adjustment-section">
          <h3><i class="fas fa-clock"></i> Time Adjustment</h3>
          <div class="input-group">
            <input type="number" v-model.number="timeAdjustment" step="0.1" placeholder="Time Adjust (hrs)" class="time-adjust-input" />
            <span class="unit">hrs</span>
          </div>
        </div>
      </div>

      <div class="section-card routes" v-if="routes.length > 0">
        <h3><i class="fas fa-road"></i> Route Options</h3>
        <div v-for="route in routes" :key="route.index" class="route-option">
          <input type="radio" :id="'route-'+route.index" :value="route.index" v-model="selectedRoute" @change="selectRoute" />
          <label :for="'route-'+route.index">{{ route.summary }}</label>
          <div class="route-metrics">
            <span><i class="fas fa-clock"></i> {{ route.duration.toFixed(1) }} hrs</span>
            <span><i class="fas fa-ruler"></i> {{ route.distance.toFixed(1) }} km</span>
            <span><i class="fas fa-leaf"></i> {{ route.co2.toFixed(1) }} kg CO₂</span>
          </div>
        </div>
      </div>

      <div class="section-card metrics" v-if="distance > 0">
        <div class="metrics-header">
          <h3><i class="fas fa-chart-bar"></i> Route Analytics</h3>
          <span class="distance-badge"><i class="fas fa-road"></i> {{ distance.toFixed(1) }} km</span>
        </div>
        
        <div class="metrics-grid">
          <div class="metrics-time">
            <h4><i class="fas fa-hourglass-half"></i> Time</h4>
            <p class="metric-value">{{ (routes[selectedRoute].duration + timeAdjustment).toFixed(1) }} hrs</p>
            <p class="metric-label">Adjusted Duration</p>
          </div>
          
          <div class="metrics-cost">
            <h4><i class="fas fa-rupee-sign"></i> Cost</h4>
            <p class="metric-value">₹{{ (fuelUsed * costRate).toFixed(2) }}</p>
            <p class="metric-label">Estimated Cost</p>
          </div>
          
          <div class="metrics-fuel">
            <h4><i class="fas fa-gas-pump"></i> Fuel</h4>
            <p class="metric-value">{{ fuelUsed.toFixed(1) }} L</p>
            <p class="metric-label">Fuel Consumption</p>
          </div>
          
          <div class="metrics-emissions">

            <h4><i class="fas fa-cloud"></i> Emissions</h4>
            <p class="metric-value">{{ co2Emitted.toFixed(1) }} kg</p>
            <p class="metric-label">CO₂ Emissions</p>
          </div>
        </div>
        
        <div class="notes-input">
          <i class="fas fa-sticky-note icon"></i>
          <input type="text" v-model="routeNotes" placeholder="Add route notes..." maxlength="100" />
        </div>
        
        <div class="options-grid">
          <div class="option-group">
            <label class="option-label"><i class="fas fa-exclamation-triangle"></i> Route Hazard</label>
            <select v-model="selectedHazard" class="hazard-select">
              <option v-for="option in hazardOptions" :key="option" :value="option">{{ option }}</option>
            </select>
          </div>
          
          <div class="option-group">
            <label class="option-label"><i class="fas fa-flag"></i> Priority Level</label>
            <select v-model="selectedPriority" class="priority-select">
              <option v-for="option in priorityOptions" :key="option" :value="option">{{ option }}</option>
            </select>
          </div>
          
          <div class="option-group">
            <label class="option-label"><i class="fas fa-tasks"></i> Route Status</label>
            <select v-model="selectedStatus" class="status-select">
              <option v-for="option in statusOptions" :key="option" :value="option">{{ option }}</option>
            </select>
          </div>
        </div>
        
        <div class="button-group">
          <button @click="saveRoute" :disabled="isSaving" class="save-btn">
            <span v-if="!isSaving"><i class="fas fa-save"></i> Save Route</span>
            <span v-else class="spinner"></span>
          </button>
          <button @click="copyShareLink" :disabled="isCopying" class="share-btn">
            <span v-if="!isCopying"><i class="fas fa-share-alt"></i> Copy Link</span>
            <span v-else class="spinner"></span>
          </button>
        </div>
      </div>

      <div class="section-card weather" v-if="startWeather && endWeather">
        <h3><i class="fas fa-cloud-sun"></i> Weather Conditions</h3>
        <div class="weather-grid">
          <div class="weather-location">
            <h4><i class="fas fa-play-circle"></i> Start Location</h4>
            <div class="weather-info">
              <i :class="getWeatherIcon(startWeather.weather[0].main)"></i>
              <div>
                <p class="weather-desc">{{ startWeather.weather[0].description }}</p>
                <p class="weather-temp">{{ startWeather.main.temp }}°C</p>
              </div>
            </div>
          </div>
          
          <div class="weather-location">
            <h4><i class="fas fa-flag-checkered"></i> End Location</h4>
            <div class="weather-info">
              <i :class="getWeatherIcon(endWeather.weather[0].main)"></i>
              <div>
                <p class="weather-desc">{{ endWeather.weather[0].description }}</p>
                <p class="weather-temp">{{ endWeather.main.temp }}°C</p>
              </div>
            </div>
          </div>
        </div>
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
    
    // Load Font Awesome if not already loaded
    if (!document.getElementById('fontawesome-css')) {
      const link = document.createElement('link');
      link.id = 'fontawesome-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
      document.head.appendChild(link);
    }
  },
  methods: {
    initializeMap() {
      this.map = new window.google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.7749, lng: -122.4194 },
        zoom: 12,
        styles: [
          {
            featureType: "administrative",
            elementType: "geometry",
            stylers: [{ visibility: "simplified" }]
          },
          {
            featureType: "poi",
            stylers: [{ visibility: "simplified" }]
          },
          {
            featureType: "road",
            elementType: "labels",
            stylers: [{ visibility: "on" }]
          }
        ]
      });
      const trafficLayer = new window.google.maps.TrafficLayer();
      trafficLayer.setMap(this.map);
      this.directionsService = new window.google.maps.DirectionsService();
      this.directionsRenderer = new window.google.maps.DirectionsRenderer({
        polylineOptions: {
          strokeColor: "#4285F4",
          strokeWeight: 5
        }
      });
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
          alert("Couldn't find a route.  Try different locations!");
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
      const baseUrl = window.location.origin + '/app/route-planner';
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
    getWeatherIcon(weatherMain) {
      const iconMap = {
        'Clear': 'fas fa-sun',
        'Clouds': 'fas fa-cloud',
        'Rain': 'fas fa-cloud-rain',
        'Drizzle': 'fas fa-cloud-rain',
        'Thunderstorm': 'fas fa-bolt',
        'Snow': 'fas fa-snowflake',
        'Mist': 'fas fa-smog',
        'Smoke': 'fas fa-smog',
        'Haze': 'fas fa-smog',
        'Dust': 'fas fa-smog',
        'Fog': 'fas fa-smog',
        'Sand': 'fas fa-smog',
        'Ash': 'fas fa-smog',
        'Squall': 'fas fa-wind',
        'Tornado': 'fas fa-wind'
      };
      return iconMap[weatherMain] || 'fas fa-cloud';
    }
  },
};
</script>

<style scoped>
#route-planner {
  display: flex;
  min-height: 100vh;
  height: 100%;
  font-family: 'Roboto', Arial, sans-serif;
}

.map-container {
  flex: 7;
  position: relative;
}

#map {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  border-radius: 0;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.control-panel {
  flex: 3;
  padding: 20px;
  background-color: #f8f9fa;
  box-sizing: border-box;
  overflow-y: auto;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.05);
}

.section-card {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.main-form {
  border-top: 4px solid #4285F4;
}

h2 {
  color: #1a73e8;
  font-size: 20px;
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 15px;
}

h3 {
  color: #202124;
  font-size: 16px;
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 15px;
}

h4 {
  color: #5f6368;
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 5px 0;
}

.form-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.half {
  flex: 1;
}

.input-group {
  position: relative;
  margin-bottom: 15px;
}

.input-group .icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #5f6368;
}

input, select, button {
  width: 100%;
  padding: 12px 12px 12px 35px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-size: 14px;
  color: #202124;
  background-color: white;
  transition: all 0.2s ease;
}

input:focus, select:focus {
  outline: none;
  border-color: #4285F4;
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
}

.primary-btn {
  background-color: #4285F4;
  color: white;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
}

.primary-btn:hover {
  background-color: #3367d6;
}

.primary-btn:disabled {
  background-color: #b3ccff;
  cursor: not-allowed;
}

.unit {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #5f6368;
  font-size: 12px;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.fuel-costs-section, .time-adjustment-section {
  background-color: #f8f9fa;
}

.routes {
  background-color: #e8f0fe;
}

.route-option {
  margin: 12px 0;
  padding: 10px;
  background-color: white;
  border-radius: 6px;
  border-left: 3px solid #4285F4;
}

.route-option input[type="radio"] {
  width: auto;
  margin-right: 10px;
}

.route-option label {
  font-weight: 500;
  color: #202124;
}

.route-metrics {
  margin-top: 5px;
  margin-left: 25px;
  display: flex;
  gap: 15px;
}

.route-metrics span {
  font-size: 13px;
  color: #5f6368;
}

.route-metrics i {
  margin-right: 5px;
  color: #4285F4;
}

.metrics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.distance-badge {
  background-color: #e8f0fe;
  color: #1a73e8;
  padding: 6px 10px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.metrics-time, .metrics-cost, .metrics-fuel, .metrics-emissions {
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 8px;
  text-align: center;
}

.metric-value {
  font-size: 20px;
  font-weight: 700;
  color: #202124;
  margin: 8px 0 5px;
}

.metric-label {
  font-size: 12px;
  color: #5f6368;
  margin: 0;
}

.metrics-time h4 i, .metrics-time .metric-value {
  color: #fbbc04;
}

.metrics-cost h4 i, .metrics-cost .metric-value {
  color: #34a853;
}

.metrics-fuel h4 i, .metrics-fuel .metric-value {
  color: #ea4335;
}

.metrics-emissions h4 i, .metrics-emissions .metric-value {
  color: #4285F4;
}

.notes-input {
  position: relative;
  margin-bottom: 15px;
}

.notes-input .icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #5f6368;
}

.notes-input input {
  width: 100%;
  padding: 12px 12px 12px 35px;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  margin-bottom: 15px;
}

.option-group {
  display: flex;
  flex-direction: column;
}

.option-label {
  font-size: 12px;
  color: #5f6368;
  margin-bottom: 5px;
}

.option-label i {
  margin-right: 5px;
}

.button-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.save-btn, .share-btn, .export-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn {
  background-color: #34a853;
  color: white;
  border: none;
}

.save-btn:hover {
  background-color: #2e7d32;
}

.share-btn {
  background-color: #1a73e8;
  color: white;
  border: none;
}

.share-btn:hover {
  background-color: #1967d2;
}

.export-btn {
  background-color: #f8f9fa;
  color: #3c4043;
  border: 1px solid #dadce0;
  padding: 8px 16px;
  margin-bottom: 10px;
}

.export-btn:hover {
  background-color: #f1f3f4;
}

.weather-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.weather-location {
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
}

.weather-info {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.weather-info i {
  font-size: 28px;
  margin-right: 15px;
  color: #4285F4;
}

.weather-desc {
  font-size: 14px;
  margin: 0;
  color: #5f6368;
  text-transform: capitalize;
}

.weather-temp {
  font-size: 16px;
  font-weight: 700;
  margin: 3px 0 0;
  color: #202124;
}

.saved-routes {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.saved-route {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px;
  margin-bottom: 10px;
  background-color: #f8f9fa;
  border-radius: 6px;
  transition: all 0.2s;
}

.saved-route:hover {
  background-color: #e8f0fe;
}

.saved-route-info {
  flex: 1;
}

.saved-route-info p {
  margin: 0 0 8px;
  cursor: pointer;
  color: #1a73e8;
  font-weight: 500;
}

.saved-route-info input {
  font-size: 13px;
  color: #5f6368;
  border: none;
  background-color: transparent;
  width: 100%;
  padding: 5px 0;
}

.saved-route-info input:focus {
  outline: none;
  border-bottom: 1px solid #dadce0;
  box-shadow: none;
}

.delete-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  margin-left: 10px;
  background-color: #f8f9fa;
  color: #ea4335;
  border: 1px solid #dadce0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn:hover {
  background-color: #fce8e6;
  color: #d93025;
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  margin-left: 5px;
}

.hazard-badge {
  background-color: #fce8e6;
  color: #d93025;
}

.priority-badge {
  background-color: #e8f0fe;
  color: #1a73e8;
}

.status-badge {
  background-color: #e6f4ea;
  color: #137333;
}

@media (max-width: 992px) {
  #route-planner {
    flex-direction: column;
  }
  
  .map-container {
    height: 60vh;
    min-height: 400px;
  }
  
  #map {
    height: 100%;
    min-height: 400px;
  }
  
  .options-grid, .metrics-grid {
    grid-template-columns: 1fr;
  }
}

/* Enhancements for better visual appeal */
.section-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.section-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

input::placeholder, select {
  color: #80868b;
}

/* Animation for saved routes */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.saved-route {
  animation: fadeIn 0.3s ease-out;
}

/* Enhanced visual hierarchy */
.primary-btn, .save-btn, .share-btn {
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 13px;
}

/* Custom scrollbar for control panel */
.control-panel::-webkit-scrollbar {
  width: 8px;
}

.control-panel::-webkit-scrollbar-track {
  background: #f1f3f4;
}

.control-panel::-webkit-scrollbar-thumb {
  background: #dadce0;
  border-radius: 4px;
}

.control-panel::-webkit-scrollbar-thumb:hover {
  background: #80868b;
}

</style>
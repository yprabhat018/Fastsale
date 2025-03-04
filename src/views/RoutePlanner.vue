<template>
  <div id="route-planner">
    <div class="map-container">
      <div id="map"></div>
    </div>
    <div class="control-panel">
      <div class="saved-routes" v-if="savedRoutes.length > 0">
        <h3>Saved Routes</h3>
        <div v-for="(route, index) in savedRoutes" :key="index" class="saved-route">
          <div class="saved-route-info">
            <p @click="loadSavedRoute(index)">
              {{ route.summary }} ({{ route.start }} to {{ route.end }}) - 
              {{ (route.adjustedDuration || route.duration || 0).toFixed(1) }} hrs - 
              ₹{{ (route.cost || 0).toFixed(2) }}
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

      <!-- Fuel Costs Section -->
      <div class="fuel-costs-section">
        <h3>Fuel Costs</h3>
        <input type="number" v-model.number="costRate" step="1" min="0" placeholder="Petrol Cost (₹/L)" class="cost-rate-input" />
      </div>

      <!-- Time Adjustment Section -->
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

      <!-- Metrics with Subsections -->
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
<style>
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
input,
select,
button {
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
.fuel-costs-section,
.time-adjustment-section {
  margin-top: 15px;
}
.fuel-costs-section h3,
.time-adjustment-section h3 {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #333;
}
.cost-rate-input,
.time-adjust-input {
  width: 120px;
  margin: 0;
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
.metrics-time,
.metrics-cost {
  margin-top: 10px;
}
.metrics-time h4,
.metrics-cost h4 {
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
  color: #007bff;
}
.saved-route p:hover {
  text-decoration: underline;
}
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
.delete-btn:disabled {
  background-color: #ff9999;
  cursor: not-allowed;
}
.delete-btn .spinner {
  vertical-align: middle;
}
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
.metrics button:nth-child(6) {
  background-color: #007bff;
}
.metrics button:disabled {
  background-color: #ccc;
}
.metrics button .spinner {
  vertical-align: middle;
}
</style>


<!-- <template>
  <div id="route-planner">
    <div class="map-container">
      <div id="map"></div>
    </div>
    <div class="control-panel">
      <div class="saved-routes" v-if="savedRoutes.length > 0">
        <h3>Saved Routes</h3>
        <div v-for="(route, index) in savedRoutes" :key="index" class="saved-route">
          <div class="saved-route-info">
            <p @click="loadSavedRoute(index)">{{ route.summary }} ({{ route.start }} to {{ route.end }}) - ₹{{ route.cost.toFixed(2) }}</p>
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
      <input type="number" v-model.number="costRate" step="1" min="0" placeholder="Petrol Cost (₹/L)" class="cost-rate-input" />
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
        <p>Time: {{ routes[selectedRoute].duration.toFixed(1) }} hrs</p>
        <p>Fuel Used: {{ fuelUsed.toFixed(1) }} L</p>
        <p>CO2 Emitted: {{ co2Emitted.toFixed(1) }} kg</p>
        <p>Estimated Cost: ₹{{ (fuelUsed * costRate).toFixed(2) }}</p>
        <input type="text" v-model="routeNotes" placeholder="Add route notes..." maxlength="100" />
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


 <template>
  <div id="route-planner">
    <div class="map-container">
      <div id="map"></div>
    </div>
    <div class="control-panel">
      <div class="saved-routes" v-if="savedRoutes.length > 0">
  <h3>Saved Routes</h3>
  <div v-for="(route, index) in savedRoutes" :key="index" class="saved-route">
    <div class="saved-route-info">
      <p @click="loadSavedRoute(index)">{{ route.summary }} ({{ route.start }} to {{ route.end }}) - ${{ route.cost.toFixed(2) }}</p>
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
      <input type="number" v-model.number="costRate" step="0.1" min="0" placeholder="Fuel Cost ($/L)" class="cost-rate-input" />
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
        <p>Time: {{ routes[selectedRoute].duration.toFixed(1) }} hrs</p>
        <p>Fuel Used: {{ fuelUsed.toFixed(1) }} L</p>
        <p>CO2 Emitted: {{ co2Emitted.toFixed(1) }} kg</p>
        <p>Estimated Cost: ${{ (fuelUsed * costRate).toFixed(2) }}</p>
        <input type="text" v-model="routeNotes" placeholder="Add route notes..." maxlength="100" />
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
</template> -->
<!-- <template>
  <div id="route-planner">
    <div class="map-container">
      <div id="map"></div>
    </div>
    <div class="control-panel">
      <div class="saved-routes" v-if="savedRoutes.length > 0">
    <h3>Saved Routes</h3>
    <div v-for="(route, index) in savedRoutes" :key="index" class="saved-route">
      <div class="saved-route-info">
        <p @click="loadSavedRoute(index)">{{ route.summary }} ({{ route.start }} to {{ route.end }})</p>
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
        <p>Time: {{ routes[selectedRoute].duration.toFixed(1) }} hrs</p>
        <p>Fuel Used: {{ fuelUsed.toFixed(1) }} L</p>
        <p>CO2 Emitted: {{ co2Emitted.toFixed(1) }} kg</p>
        <input type="text" v-model="routeNotes" placeholder="Add route notes..." maxlength="100" />
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
</template> -->
<!-- <template>
  <div id="route-planner">
    <div class="map-container">
      <div id="map"></div>
    </div>
    <div class="control-panel">
      <div class="saved-routes" v-if="savedRoutes.length > 0">
        <h3>Saved Routes</h3>
        <div v-for="(route, index) in savedRoutes" :key="index" class="saved-route">
          <p @click="loadSavedRoute(index)">{{ route.summary }} ({{ route.start }} to {{ route.end }})</p>
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
        <p>Time: {{ routes[selectedRoute].duration.toFixed(1) }} hrs</p>
        <p>Fuel Used: {{ fuelUsed.toFixed(1) }} L</p>
        <p>CO2 Emitted: {{ co2Emitted.toFixed(1) }} kg</p>
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
</template> -->

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
      savedRoutes: [], // Initialize empty, load below
      isSaving: false,
      isDeleting: false,
      isCopying: false,
      routeNotes: '',
      costRate: 100,
      timeAdjustment: 0,
    };
  },
  mounted() {
    // Load saved routes with fallback for missing fields
    const storedRoutes = JSON.parse(localStorage.getItem('savedRoutes')) || [];
    this.savedRoutes = storedRoutes.map(route => ({
      ...route,
      cost: route.cost || 0, // Default cost if missing
      adjustedDuration: route.adjustedDuration || route.duration || 0, // Default adjusted if missing
      timeAdjustment: route.timeAdjustment || 0, // Default adjustment if missing
      notes: route.notes || 'No notes', // Ensure notes exist
    }));

    if (this.$google) {
      this.map = new this.$google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.7749, lng: -122.4194 },
        zoom: 12,
      });
      const trafficLayer = new this.$google.maps.TrafficLayer();
      trafficLayer.setMap(this.map);
      this.directionsService = new this.$google.maps.DirectionsService();
      this.directionsRenderer = new this.$google.maps.DirectionsRenderer();
      this.directionsRenderer.setMap(this.map);
      this.loadRouteFromUrl();
    } else {
      console.error('Google Maps not loaded yet!');
    }
  },
  methods: {
    async calculateRoute(summaryToMatch = null) {
      if (!this.start || !this.end) {
        alert('Please enter both start and end locations!');
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

          const apiKey = '7b9dfa089f8262f39ad120d20b54d8d2';
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
      };
      this.savedRoutes.push(routeToSave);
      localStorage.setItem('savedRoutes', JSON.stringify(this.savedRoutes));
      await new Promise(resolve => setTimeout(resolve, 500));
      this.routeNotes = '';
      this.timeAdjustment = 0;
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
      if (start && end) {
        this.start = start;
        this.end = end;
        this.vehicle = vehicle || 'car';
        this.optimization = optimization || 'fastest';
        this.routeNotes = notes || '';
        this.costRate = parseFloat(costRate) || 100;
        this.timeAdjustment = parseFloat(timeAdjustment) || 0;
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
  },
};
</script>

<!-- <script>
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
      savedRoutes: JSON.parse(localStorage.getItem('savedRoutes')) || [],
      isSaving: false,
      isDeleting: false,
      isCopying: false,
      routeNotes: '',
      costRate: 100, // Default ₹100 per liter (adjust based on local rates)
    };
  },
  mounted() {
    if (this.$google) {
      this.map = new this.$google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.7749, lng: -122.4194 },
        zoom: 12,
      });
      const trafficLayer = new this.$google.maps.TrafficLayer();
      trafficLayer.setMap(this.map);
      this.directionsService = new this.$google.maps.DirectionsService();
      this.directionsRenderer = new this.$google.maps.DirectionsRenderer();
      this.directionsRenderer.setMap(this.map);
      this.loadRouteFromUrl();
    } else {
      console.error('Google Maps not loaded yet!');
    }
  },
  methods: {
    async calculateRoute(summaryToMatch = null) {
      if (!this.start || !this.end) {
        alert('Please enter both start and end locations!');
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
            const cost = fuel * this.costRate; // Calculate cost
            return {
              index,
              distance,
              duration,
              fuel,
              co2,
              cost, // Add cost to route data
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

          const apiKey = '7b9dfa089f8262f39ad120d20b54d8d2';
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
        fuel: this.fuelUsed,
        co2: this.co2Emitted,
        summary: this.routes[this.selectedRoute].summary,
        notes: this.routeNotes || 'No notes',
        cost: this.fuelUsed * this.costRate, // Add cost to saved route
      };
      this.savedRoutes.push(routeToSave);
      localStorage.setItem('savedRoutes', JSON.stringify(this.savedRoutes));
      await new Promise(resolve => setTimeout(resolve, 500));
      this.routeNotes = '';
      this.isSaving = false;
    },
    loadSavedRoute(index) {
      const saved = this.savedRoutes[index];
      this.start = saved.start;
      this.end = saved.end;
      this.vehicle = saved.vehicle;
      this.optimization = saved.optimization;
      this.routeNotes = saved.notes;
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
        costRate: this.costRate, // Include cost rate in share link
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
      if (start && end) {
        this.start = start;
        this.end = end;
        this.vehicle = vehicle || 'car';
        this.optimization = optimization || 'fastest';
        this.routeNotes = notes || '';
        this.costRate = parseFloat(costRate) || 1.5; // Load cost rate, default to 1.5
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
  },
};
</script> -->



<!-- <script>
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
      savedRoutes: JSON.parse(localStorage.getItem('savedRoutes')) || [],
      isSaving: false,
      isDeleting: false,
      isCopying: false,
      routeNotes: '', // Add this for the notes input
    };
  },
  mounted() {
    if (this.$google) {
      this.map = new this.$google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.7749, lng: -122.4194 },
        zoom: 12,
      });
      const trafficLayer = new this.$google.maps.TrafficLayer();
      trafficLayer.setMap(this.map);
      this.directionsService = new this.$google.maps.DirectionsService();
      this.directionsRenderer = new this.$google.maps.DirectionsRenderer();
      this.directionsRenderer.setMap(this.map);
      this.loadRouteFromUrl();
    } else {
      console.error('Google Maps not loaded yet!');
    }
  },
  methods: {
    async calculateRoute(summaryToMatch = null) {
  if (!this.start || !this.end) {
    alert('Please enter both start and end locations!');
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
        return {
          index,
          distance,
          duration,
          fuel,
          co2,
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
      this.routes = tempRoutes.map((route, idx) => ({ ...route, index: idx })); // Fixed: idx, not index

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

      const apiKey = '7b9dfa089f8262f39ad120d20b54d8d2';
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
    // async calculateRoute(summaryToMatch = null) {
    //   if (!this.start || !this.end) {
    //     alert('Please enter both start and end locations!');
    //     return;
    //   }
    //   this.isLoading = true;
    //   const request = {
    //     origin: this.start,
    //     destination: this.end,
    //     travelMode: 'DRIVING',
    //     provideRouteAlternatives: true,
    //   };
    //   this.directionsService.route(request, async (result, status) => {
    //     if (status === 'OK') {
    //       let tempRoutes = result.routes.map((route, index) => {
    //         const distance = route.legs[0].distance.value / 1000;
    //         const duration = route.legs[0].duration.value / 3600;
    //         const fuelRates = { car: 0.1, truck: 0.3 };
    //         const co2PerLiter = 2.3;
    //         const fuel = distance * fuelRates[this.vehicle];
    //         const co2 = fuel * co2PerLiter;
    //         return {
    //           index,
    //           distance,
    //           duration,
    //           fuel,
    //           co2,
    //           summary: route.summary || `Route ${index + 1}`,
    //         };
    //       });

    //       if (this.optimization === 'fastest') {
    //         tempRoutes = [...tempRoutes].sort((a, b) => a.duration - b.duration);
    //       } else if (this.optimization === 'shortest') {
    //         tempRoutes = [...tempRoutes].sort((a, b) => a.distance - b.distance);
    //       } else if (this.optimization === 'eco') {
    //         tempRoutes = [...tempRoutes].sort((a, b) => a.co2 - b.co2);
    //       }
    //       this.routes = tempRoutes.

    //   map((route, idx) => ({ ...route, index: idx }));

    //       if (summaryToMatch) {
    //         const matchedRoute = this.routes.find(route => route.summary === summaryToMatch);
    //         this.selectedRoute = matchedRoute ? matchedRoute.index : 0;
    //       } else {
    //         this.selectedRoute = 0;
    //       }

    //       this.directionsRenderer.setDirections(result);
    //       this.directionsRenderer.setRouteIndex(this.routes[this.selectedRoute].index);
    //       this.distance = this.routes[this.selectedRoute].distance;
    //       this.fuelUsed = this.routes[this.selectedRoute].fuel;
    //       this.co2Emitted = this.routes[this.selectedRoute].co2;

    //       const startLat = result.routes[0].legs[0].start_location.lat();
    //       const startLng = result.routes[0].legs[0].start_location.lng();
    //       const endLat = result.routes[0].legs[0].end_location.lat();
    //       const endLng = result.routes[0].legs[0].end_location.lng();

    //       const apiKey = '7b9dfa089f8262f39ad120d20b54d8d2';
    //       try {
    //         const startResponse = await axios.get(
    //           `https://api.openweathermap.org/data/2.5/weather?lat=${startLat}&lon=${startLng}&appid=${apiKey}&units=metric`
    //         );
    //         const endResponse = await axios.get(
    //           `https://api.openweathermap.org/data/2.5/weather?lat=${endLat}&lon=${endLng}&appid=${apiKey}&units=metric`
    //         );
    //         this.startWeather = startResponse.data;
    //         this.endWeather = endResponse.data;
    //       } catch (error) {
    //         console.error('Error fetching weather:', error);
    //         this.startWeather = null;
    //         this.endWeather = null;
    //       }
    //     } else {
    //       console.error('Error finding route:', status);
    //       alert('Couldn’t find a route. Try different locations!');
    //     }
    //     this.isLoading = false;
    //   });
    // },
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
        fuel: this.fuelUsed,
        co2: this.co2Emitted,
        summary: this.routes[this.selectedRoute].summary,
        notes: this.routeNotes || 'No notes', // Include notes, default to 'No notes'
      };
      this.savedRoutes.push(routeToSave);
      localStorage.setItem('savedRoutes', JSON.stringify(this.savedRoutes));
      await new Promise(resolve => setTimeout(resolve, 500));
      this.routeNotes = ''; // Clear the input after saving
      this.isSaving = false;
    },
    loadSavedRoute(index) {
      const saved = this.savedRoutes[index];
      this.start = saved.start;
      this.end = saved.end;
      this.vehicle = saved.vehicle;
      this.optimization = saved.optimization;
      this.routeNotes = saved.notes; // Load notes too
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
        notes: this.routeNotes || '', // Include notes in the share link
      }).toString();
      return `${baseUrl}?${params}`;
    },
    async updateNote() {
    // Update local storage when notes change
    localStorage.setItem('savedRoutes', JSON.stringify(this.savedRoutes));
  },
    loadRouteFromUrl() {
      const urlParams = new URLSearchParams(window.location.search);
      const start = urlParams.get('start');
      const end = urlParams.get('end');
      const vehicle = urlParams.get('vehicle');
      const optimization = urlParams.get('optimization');
      const summary = urlParams.get('summary');
      const notes = urlParams.get('notes');
      if (start && end) {
        this.start = start;
        this.end = end;
        this.vehicle = vehicle || 'car';
        this.optimization = optimization || 'fastest';
        this.routeNotes = notes || ''; // Load notes from URL
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
  //   async updateNotes(index) {
  //   // Update local storage when notes change
  //   localStorage.setItem('savedRoutes', JSON.stringify(this.savedRoutes));
  // },
  },
};
</script> -->

<!-- <script>
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
      savedRoutes: JSON.parse(localStorage.getItem('savedRoutes')) || [],
      isSaving: false,
      isDeleting: false,
      isCopying: false,
    };
  },
  mounted() {
    if (this.$google) {
      this.map = new this.$google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.7749, lng: -122.4194 },
        zoom: 12,
      });
      const trafficLayer = new this.$google.maps.TrafficLayer();
      trafficLayer.setMap(this.map);
      this.directionsService = new this.$google.maps.DirectionsService();
      this.directionsRenderer = new this.$google.maps.DirectionsRenderer();
      this.directionsRenderer.setMap(this.map);
      this.loadRouteFromUrl();
    } else {
      console.error('Google Maps not loaded yet!');
    }
  },
  methods: {
    async calculateRoute(summaryToMatch = null) { // Add optional param to match summary
      if (!this.start || !this.end) {
        alert('Please enter both start and end locations!');
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
            return {
              index,
              distance,
              duration,
              fuel,
              co2,
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

          // Match the route by summary if provided
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

          const apiKey = '7b9dfa089f8262f39ad120d20b54d8d2';
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
        fuel: this.fuelUsed,
        co2: this.co2Emitted,
        summary: this.routes[this.selectedRoute].summary,
      };
      this.savedRoutes.push(routeToSave);
      localStorage.setItem('savedRoutes', JSON.stringify(this.savedRoutes));
      await new Promise(resolve => setTimeout(resolve, 500));
      this.isSaving = false;
    },
    loadSavedRoute(index) {
      const saved = this.savedRoutes[index];
      this.start = saved.start;
      this.end = saved.end;
      this.vehicle = saved.vehicle;
      this.optimization = saved.optimization;
      this.calculateRoute(saved.summary); // Pass summary to match
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
    summary: this.routes[this.selectedRoute].summary, // Add selected route’s summary
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
      if (start && end) {
        this.start = start;
        this.end = end;
        this.vehicle = vehicle || 'car';
        this.optimization = optimization || 'fastest';
        this.calculateRoute(summary); // Pass summary to match
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
  },
};
</script> -->


<!-- <style>
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
input,
select,
button {
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
.saved-route p {
  margin: 0;
  cursor: pointer;
  color: #007bff;
}
.saved-route p:hover {
  text-decoration: underline;
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
.delete-btn:disabled {
  background-color: #ff9999;
  cursor: not-allowed;
}
.delete-btn .spinner {
  vertical-align: middle;
}
.metrics button { /* Style both Save and Copy buttons */
  width: auto;
  padding: 5px 10px;
  background-color: #4CAF50; /* Green for save */
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  margin: 5px 5px 0 0;
}
.metrics button:nth-child(6) { /* Copy Link button */
  background-color: #007bff; /* Blue for copy */
}
.metrics button:disabled {
  background-color: #ccc;
}
.metrics button .spinner {
  vertical-align: middle;
}
</style> -->


<!-- <style>
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
input,
select,
button {
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
.cost-rate-input {
  width: 100px; /* Smaller width for cost rate */
  margin: 10px 0 0 0;
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
.metrics input[type="text"] {
  margin: 5px 0;
  padding: 5px;
  font-size: 12px;
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
  color: #007bff;
}
.saved-route p:hover {
  text-decoration: underline;
}
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
.delete-btn:disabled {
  background-color: #ff9999;
  cursor: not-allowed;
}
.delete-btn .spinner {
  vertical-align: middle;
}
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
.metrics button:nth-child(6) {
  background-color: #007bff;
}
.metrics button:disabled {
  background-color: #ccc;
}
.metrics button .spinner {
  vertical-align: middle;
}

.cost-rate-input {
  width: 120px; /* Slightly wider for ₹/L label */
  margin: 10px 0 0 0;
  padding: 5px;
  font-size: 12px;
}
</style> -->

<!-- <style>
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
input,
select,
button {
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
.metrics input[type="text"] { /* Style the notes input */
  margin: 5px 0;
  padding: 5px;
  font-size: 12px;
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
  color: #007bff;
}
.saved-route p:hover {
  text-decoration: underline;
}
.saved-route input[type="text"] { /* Style the editable notes */
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
.delete-btn:disabled {
  background-color: #ff9999;
  cursor: not-allowed;
}
.delete-btn .spinner {
  vertical-align: middle;
}
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
.metrics button:nth-child(6) {
  background-color: #007bff;
}
.metrics button:disabled {
  background-color: #ccc;
}
.metrics button .spinner {
  vertical-align: middle;
}
</style> -->


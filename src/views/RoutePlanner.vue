
<template>
  <div id="route-planner">
    <div class="map-container">
      <div id="map"></div> <!-- Remove inline styles, we’ll handle in CSS -->
    </div>
    <div class="control-panel">
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
    } else {
      console.error('Google Maps not loaded yet!');
    }
  },
  methods: {
    async calculateRoute() {
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
          console.log('Raw routes from Google:', result.routes); // Debug line
          this.routes = result.routes.map((route, index) => {
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
            this.routes.sort((a, b) => a.duration - b.duration);
          } else if (this.optimization === 'shortest') {
            this.routes.sort((a, b) => a.distance - b.distance);
          } else if (this.optimization === 'eco') {
            this.routes.sort((a, b) => a.co2 - b.co2);
          }

          this.routes = this.routes.map((route, idx) => ({ ...route, index: idx }));

          this.selectedRoute = 0;
          this.directionsRenderer.setDirections(result);
          this.directionsRenderer.setRouteIndex(this.routes[0].index);
          this.distance = this.routes[0].distance;
          this.fuelUsed = this.routes[0].fuel;
          this.co2Emitted = this.routes[0].co2;

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
  },
};
</script>

<style>
#route-planner {
  display: flex;
  height: 100%; /* Stretch to fit content */
  min-height: 100vh; /* At least full viewport height */
}
.map-container {
  flex: 7;
  height: auto; /* Let it grow with content */
}
#map {
  width: 100%;
  height: 100%; /* Fill the map-container fully */
  min-height: 100vh; /* Ensure it’s at least full screen */
}
.control-panel {
  flex: 3;
  padding: 20px;
  background-color: #f0f0f0;
  box-sizing: border-box; /* Include padding in height */
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
  width: 20px;
  height: 20px;
  border: 3px solid #fff;
  border-top: 3px solid #333;
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
</style>
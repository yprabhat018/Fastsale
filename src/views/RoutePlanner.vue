<template>
  <div id="route-planner">
    <div class="map-container">
      <div id="map" style="width: 100%; height: 100vh;"></div>
    </div>
    <div class="control-panel">
      <h2>Plan Your Route</h2>
      <input type="text" v-model="start" placeholder="Start Location" />
      <input type="text" v-model="end" placeholder="End Location" />
      <select v-model="vehicle">
        <option value="car">Car</option>
        <option value="truck">Truck</option>
      </select>
      <button @click="calculateRoute" :disabled="isLoading">
        <span v-if="!isLoading">Calculate Route</span>
        <span v-else class="spinner"></span>
      </button>
      <div class="metrics" v-if="distance > 0">
        <p>Distance: {{ distance.toFixed(1) }} km</p>
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
<!-- <template>
  <div id="route-planner">
    <div class="map-container">
      <div id="map" style="width: 100%; height: 100vh;"></div>
    </div>
    <div class="control-panel">
      <h2>Plan Your Route</h2>
      <input type="text" v-model="start" placeholder="Start Location" />
      <input type="text" v-model="end" placeholder="End Location" />
      <select v-model="vehicle">
        <option value="car">Car</option>
        <option value="truck">Truck</option>
      </select>
      <button @click="calculateRoute">Calculate Route</button>
      <div class="metrics" v-if="distance > 0">
        <p>Distance: {{ distance.toFixed(1) }} km</p>
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
</template> -->
<!-- <template>
    <div id="route-planner">
      <div class="map-container">
        <div id="map" style="width: 100%; height: 100vh;"></div>
      </div>
      <div class="control-panel">
        <h2>Plan Your Route</h2>
        <input type="text" v-model="start" placeholder="Start Location" />
        <input type="text" v-model="end" placeholder="End Location" />
        <select v-model="vehicle">
          <option value="car">Car</option>
          <option value="truck">Truck</option>
        </select>
        <button @click="calculateRoute">Calculate Route</button>
        <div class="metrics" v-if="distance > 0">
          <p>Distance: {{ distance.toFixed(1) }} km</p>
          <p>Fuel Used: {{ fuelUsed.toFixed(1) }} L</p>
          <p>CO2 Emitted: {{ co2Emitted.toFixed(1) }} kg</p>
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
        map: null,
        directionsService: null,
        directionsRenderer: null,
        distance: 0,
        fuelUsed: 0,
        co2Emitted: 0,
        startWeather: null,
        endWeather: null,
        isLoading: false, // Add this for loading state
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
        this.isLoading = true; // Start loading
        const request = {
          origin: this.start,
          destination: this.end,
          travelMode: 'DRIVING',
          provideRouteAlternatives: true,
        };
        this.directionsService.route(request, async (result, status) => {
          if (status === 'OK') {
            this.directionsRenderer.setDirections(result);
            this.distance = result.routes[0].legs[0].distance.value / 1000;
            const fuelRates = { car: 0.1, truck: 0.3 };
            const co2PerLiter = 2.3;
            this.fuelUsed = this.distance * fuelRates[this.vehicle];
            this.co2Emitted = this.fuelUsed * co2PerLiter;
  
            const startLat = result.routes[0].legs[0].start_location.lat();
            const startLng = result.routes[0].legs[0].start_location.lng();
            const endLat = result.routes[0].legs[0].end_location.lat();
            const endLng = result.routes[0].legs[0].end_location.lng();
  
            const apiKey = '7b9dfa089f8262f39ad120d20b54d8d2'; // Your key here
            try {
              const startResponse = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?lat=${startLat}&lon=${startLng}&appid=${apiKey}&units=metric`
              );
              const endResponse = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?lat=${endLat}&lon=${endLng}&appid=${apiKey}&units=metric`
              );
              this.startWeather = startResponse.data;
              this.endWeather = endResponse.data;
              console.log('Start Weather:', JSON.stringify(this.startWeather, null, 2));
              console.log('End Weather:', JSON.stringify(this.endWeather, null, 2));
            } catch (error) {
              console.error('Error fetching weather:', error);
              this.startWeather = null;
              this.endWeather = null;
            }
          } else {
            console.error('Error finding route:', status);
            alert('Couldn’t find a route. Try different locations!');
          }
          this.isLoading = false; // Stop loading
        });
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
      map: null,
      directionsService: null,
      directionsRenderer: null,
      distance: 0,
      fuelUsed: 0,
      co2Emitted: 0,
      startWeather: null,
      endWeather: null,
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
      const request = {
        origin: this.start,
        destination: this.end,
        travelMode: 'DRIVING',
        provideRouteAlternatives: true,
      };
      this.directionsService.route(request, async (result, status) => {
        if (status === 'OK') {
          this.directionsRenderer.setDirections(result);
          this.distance = result.routes[0].legs[0].distance.value / 1000;
          const fuelRates = { car: 0.1, truck: 0.3 };
          const co2PerLiter = 2.3;
          this.fuelUsed = this.distance * fuelRates[this.vehicle];
          this.co2Emitted = this.fuelUsed * co2PerLiter;

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
            console.log('Start Weather:', JSON.stringify(this.startWeather, null, 2));
            console.log('End Weather:', JSON.stringify(this.endWeather, null, 2));
          } catch (error) {
            console.error('Error fetching weather:', error);
            this.startWeather = null; // Reset if it fails
            this.endWeather = null;
          }
        } else {
          console.error('Error finding route:', status);
          alert('Couldn’t find a route. Try different locations!');
        }
      });
    },
  },
};
</script> -->
  <!-- <script>
  import axios from 'axios'; // Add this at the top
  
  export default {
    name: 'RoutePlanner',
    data() {
      return {
        start: '',
        end: '',
        vehicle: 'car',
        map: null,
        directionsService: null,
        directionsRenderer: null,
        distance: 0,
        fuelUsed: 0,
        co2Emitted: 0,
        startWeather: null, // Add this for start point weather
        endWeather: null, // Add this for end point weather
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
        const request = {
          origin: this.start,
          destination: this.end,
          travelMode: 'DRIVING',
          provideRouteAlternatives: true,
        };
        this.directionsService.route(request, async (result, status) => {
          if (status === 'OK') {
            this.directionsRenderer.setDirections(result);
            this.distance = result.routes[0].legs[0].distance.value / 1000;
            const fuelRates = { car: 0.1, truck: 0.3 };
            const co2PerLiter = 2.3;
            this.fuelUsed = this.distance * fuelRates[this.vehicle];
            this.co2Emitted = this.fuelUsed * co2PerLiter;
  
            // Get coordinates from the route
            const startLat = result.routes[0].legs[0].start_location.lat();
            const startLng = result.routes[0].legs[0].start_location.lng();
            const endLat = result.routes[0].legs[0].end_location.lat();
            const endLng = result.routes[0].legs[0].end_location.lng();
  
            // Fetch weather data
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
              console.log('Start Weather:', JSON.stringify(this.startWeather, null, 2));
              console.log('End Weather:', JSON.stringify(this.endWeather, null, 2));
              // console.log('Start Weather:', this.startWeather);
              // console.log('End Weather:', this.endWeather);
            } catch (error) {
              console.error('Error fetching weather:', error);
            }
          } else {
            console.error('Error finding route:', status);
            alert('Couldn’t find a route. Try different locations!');
          }
        });
      },
    },
  };
  </script> -->

  <!-- <script>
  export default {
    name: 'RoutePlanner',
    data() {
      return {
        start: '',
        end: '',
        vehicle: 'car',
        map: null,
        directionsService: null,
        directionsRenderer: null,
        distance: 0,
        fuelUsed: 0, // Fuel in liters
        co2Emitted: 0, // CO2 in kilograms
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
      calculateRoute() {
        if (!this.start || !this.end) {
          alert('Please enter both start and end locations!');
          return;
        }
        const request = {
          origin: this.start,
          destination: this.end,
          travelMode: 'DRIVING',
          provideRouteAlternatives: true,
        };
        this.directionsService.route(request, (result, status) => {
          if (status === 'OK') {
            this.directionsRenderer.setDirections(result);
            this.distance = result.routes[0].legs[0].distance.value / 1000;
  
            // Fuel use (liters per km) and CO2 (kg per liter)
            const fuelRates = { car: 0.1, truck: 0.3 }; // Car: 10L/100km, Truck: 30L/100km
            const co2PerLiter = 2.3; // Rough average for gasoline/diesel
            this.fuelUsed = this.distance * fuelRates[this.vehicle];
            this.co2Emitted = this.fuelUsed * co2PerLiter;
  
            console.log('Fuel used:', this.fuelUsed.toFixed(1), 'L');
            console.log('CO2 emitted:', this.co2Emitted.toFixed(1), 'kg');
          } else {
            console.error('Error finding route:', status);
            alert('Couldn’t find a route. Try different locations!');
          }
        });
      },
    },
  };
  </script> -->
  <!-- <style>
#route-planner {
  display: flex;
}
.map-container {
  flex: 7;
}
.control-panel {
  flex: 3;
  padding: 20px;
  background-color: #f0f0f0;
}
input,
select,
button {
  width: 100%;
  margin: 10px 0;
  padding: 10px;
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
  background-color: #e0f0ff; /* Light blue for weather vibe */
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
</style> -->

<style>
#route-planner {
  display: flex;
}
.map-container {
  flex: 7;
}
.control-panel {
  flex: 3;
  padding: 20px;
  background-color: #f0f0f0;
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
  <!-- <style>
  #route-planner {
    display: flex;
  }
  .map-container {
    flex: 7;
  }
  .control-panel {
    flex: 3;
    padding: 20px;
    background-color: #f0f0f0;
  }
  input,
  select,
  button {
    width: 100%;
    margin: 10px 0;
    padding: 10px;
  }
  /* .metrics {
    margin-top: 20px;
    background-color: #e0e0e0;
    padding: 10px;
    border-radius: 5px;
  }
  .metrics p {
    margin: 5px 0;
  } */

  .metrics {
  margin-top: 20px;
  background-color: #e0f0e0; /* Light green for eco vibe */
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.metrics p {
  margin: 8px 0;
  font-weight: bold;
  color: #333;
}
  </style> -->

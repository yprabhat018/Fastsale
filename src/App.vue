<!-- 
<template>
  <div id="app">
    <nav class="navbar">
      <router-link to="/route-planner" class="nav-link">Route Optimization</router-link>
      <router-link to="/logistics-management" class="nav-link">Logistics Management</router-link>
      <router-link to="/shipping-tracking" class="nav-link">Shipping Tracking</router-link>
      <router-link to="/crowdsourced-alerts" class="nav-link">Crowdsourced Alerts</router-link>
    </nav>
    <router-view></router-view>
  </div>
</template> -->

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
#app {
  font-family: Arial, sans-serif;
  min-height: 100vh;
}
</style>
<!-- <style>
#app {
  font-family: Arial, sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.navbar {
  background-color: #333;
  padding: 10px;
  display: flex;
  justify-content: space-around;
}
.nav-link {
  color: white;
  text-decoration: none;
  font-size: 16px;
  padding: 5px 10px;
}
.nav-link:hover {
  background-color: #555;
  border-radius: 3px;
}
.router-link-active {
  background-color: #4CAF50;
  border-radius: 3px;
}
</style> -->

<!-- <template>
  <div id="app">
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
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      start: '',
      end: '',
      vehicle: 'car',
      map: null, // Store the map
      directionsService: null, // To calculate routes
      directionsRenderer: null, // To draw routes
    };
  },
  mounted() {
    if (this.$google) {
      // Set up the map
      this.map = new this.$google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.7749, lng: -122.4194 }, // San Francisco
        zoom: 12,
      });
      // Set up Directions Service and Renderer
      this.directionsService = new this.$google.maps.DirectionsService();
      this.directionsRenderer = new this.$google.maps.DirectionsRenderer();
      this.directionsRenderer.setMap(this.map); // Link renderer to the map
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

      // Create a request for the Directions Service
      const request = {
        origin: this.start,
        destination: this.end,
        travelMode: 'DRIVING', // We’ll tweak this based on vehicle later
      };

      // Use Directions Service to get the route
      this.directionsService.route(request, (result, status) => {
        if (status === 'OK') {
          // Draw the route on the map
          this.directionsRenderer.setDirections(result);
          console.log('Route drawn successfully!');
        } else {
          console.error('Error finding route:', status);
          alert('Couldn’t find a route. Try different locations!');
        }
      });
    },
  },
};
</script>

<style>
#app {
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
</style> -->

<!-- <template>
  <div id="app">
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
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      start: '',
      end: '',
      vehicle: 'car',
      map: null, // To store the map object
    };
  },
  mounted() {
    // Use the global $google object
    if (this.$google) {
      this.map = new this.$google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.7749, lng: -122.4194 }, // San Francisco
        zoom: 12,
      });
    } else {
      console.error('Google Maps not loaded yet!');
    }
  },
  methods: {
    calculateRoute() {
      console.log('Calculating route from', this.start, 'to', this.end, 'with', this.vehicle);
    },
  },
};
</script>

<style>
#app {
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
input, select, button {
  width: 100%;
  margin: 10px 0;
  padding: 10px;
}
</style> -->
<!-- <template>
  <div id="app">
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
    </div>
  </div>
</template>

<script>
import { Loader } from '@googlemaps/js-api-loader';

export default {
  name: 'App',
  data() {
    return {
      start: '',
      end: '',
      vehicle: 'car',
      map: null, // Store the map here
    };
  },
  mounted() {
    // Load Google Maps when the component mounts
    const loader = new Loader({
      apiKey: 'AIzaSyCOrCd4askrLzy3Ml2LGzsX1a1pHmuLC6k', // Replace with your Google Maps API key
      version: 'weekly',
      libraries: ['places'],
    });

    loader.load().then(() => {
      console.log('Google Maps loaded in App.vue');
      this.map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.7749, lng: -122.4194 }, // San Francisco
        zoom: 12,
      });
    }).catch(error => {
      console.error('Error loading Google Maps:', error);
    });
  },
  methods: {
    calculateRoute() {
      console.log('Calculating route from', this.start, 'to', this.end, 'with', this.vehicle);
    },
  },
};
</script>

<style>
#app {
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
input, select, button {
  width: 100%;
  margin: 10px 0;
  padding: 10px;
}
</style> -->
<!-- 

<template>
  <div id="app">
    <h1>Hello, Logistics App!</h1>
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
}
</style> --> 

<!-- <template>
  <div id="app">
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
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      start: '',
      end: '',
      vehicle: 'car',
      map: null, // To store the map object
    };
  },
  mounted() {
    // Wait for Google Maps to load
    if (window.google) {
      this.initMap();
    } else {
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle);
          this.initMap();
        }
      }, 100);
    }
  },
  methods: {
    initMap() {
      // Create the map once Google is ready
      this.map = new window.google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.7749, lng: -122.4194 }, // San Francisco
        zoom: 12,
      });
    },
    calculateRoute() {
      console.log('Calculating route from', this.start, 'to', this.end, 'with', this.vehicle);
    },
  },
};
</script>

<style>
#app {
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
</style>  -->
<!-- <template>
  <img alt="Vue logo" src="./assets/logo.png">
  <HelloWorld msg="Welcome to Your Vue.js App"/>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {
    HelloWorld
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>-->
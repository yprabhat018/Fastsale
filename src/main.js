// import { createApp } from 'vue';
// import App from './App.vue';
// import router from './router';

// // Function to load Google Maps script dynamically
// function loadGoogleMapsScript(apiKey) {
//   return new Promise((resolve, reject) => {
//     if (window.google && window.google.maps) {
//       resolve(); // Already loaded
//       return;
//     }
//     const script = document.createElement('script');
//     script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
//     script.async = true;
//     script.defer = true;
//     script.onload = () => resolve();
//     script.onerror = () => reject(new Error('Failed to load Google Maps API'));
//     document.head.appendChild(script);
//   });
// }

// // Your Google Maps API key (replace with your actual key)
// const GOOGLE_MAPS_API_KEY = 'AIzaSyCOrCd4askrLzy3Ml2LGzsX1a1pHmuLC6k';

// // Create the Vue app
// const app = createApp(App);

// // Load Google Maps, then mount the app
// loadGoogleMapsScript(GOOGLE_MAPS_API_KEY)
//   .then(() => {
//     app.use(router);
//     app.mount('#app');
//   })
//   .catch(error => {
//     console.error(error);
//   });

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// Function to load Google Maps script dynamically
function loadGoogleMapsScript(apiKey) {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps API'));
    document.head.appendChild(script);
  });
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyCOrCd4askrLzy3Ml2LGzsX1a1pHmuLC6k'; // Replace with your key

const app = createApp(App);
loadGoogleMapsScript(GOOGLE_MAPS_API_KEY)
  .then(() => {
    app.use(router);
    app.mount('#app');
  })
  .catch(error => {
    console.error(error);
  });

// import { createApp } from 'vue'
// import App from './App.vue'


// import Vue from 'vue';
// import * as VueGoogleMaps from 'vue-google-maps';
// // createApp(App).mount('#app')
// Vue.use(VueGoogleMaps, {
//     load: {
//       key: 'AIzaSyCOrCd4askrLzy3Ml2LGzsX1a1pHmuLC6k', // Put your key here
//       libraries: 'places', // Helps with addresses later
//     },
//   });

// 
// import Vue from 'vue';
// import App from './App.vue';
// import { Loader } from '@googlemaps/js-api-loader';

// // Set up the Google Maps loader
// const loader = new Loader({
//   apiKey: 'AIzaSyCOrCd4askrLzy3Ml2LGzsX1a1pHmuLC6k', // Replace with your Google Maps API key
//   version: 'weekly',
//   libraries: ['places'] // For address features later
// });

// // Load Google Maps, then start Vue
// loader.load().then(() => {
//   console.log('Google Maps is ready!');
//   new Vue({
//     render: h => h(App),
//   }).$mount('#app');
// }).catch(error => {
//   console.error('Error loading Google Maps:', error);
// });
// import { createApp } from 'vue';
// import App from './App.vue';
// import { Loader } from '@googlemaps/js-api-loader';
// import router from './router'; // Add this line

// const loader = new Loader({
//   apiKey: 'AIzaSyCOrCd4askrLzy3Ml2LGzsX1a1pHmuLC6k', // Your key here
//   version: 'weekly',
//   libraries: ['places'],
// });

// loader.load().then((google) => {
//   console.log('Google Maps is ready!');
//   const app = createApp(App);
//   app.config.globalProperties.$google = google;
//   app.use(router); // Add this line
//   app.mount('#app');
// }).catch(error => {
//   console.error('Error loading Google Maps:', error);
// });
 
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>

// import { createApp } from 'vue';
// import App from './App.vue';
// import { Loader } from '@googlemaps/js-api-loader';

// // Set up Google Maps loader
// const loader = new Loader({
//   apiKey: 'AIzaSyCOrCd4askrLzy3Ml2LGzsX1a1pHmuLC6k', // Replace with your Google Maps API key
//   version: 'weekly',
//   libraries: ['places'] // For address autocomplete later
// });

// // Load Google Maps, then start the app
// loader.load().then((google) => {
//   console.log('Google Maps is ready!');
//   const app = createApp(App);
//   app.config.globalProperties.$google = google; // Store google for the app to use
//   app.mount('#app');
// }).catch(error => {
//   console.error('Error loading Google Maps:', error);
// });
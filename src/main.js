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
import { createApp } from 'vue';
import App from './App.vue';
import { Loader } from '@googlemaps/js-api-loader';
import router from './router'; // Add this line

const loader = new Loader({
  apiKey: 'AIzaSyCOrCd4askrLzy3Ml2LGzsX1a1pHmuLC6k', // Your key here
  version: 'weekly',
  libraries: ['places'],
});

loader.load().then((google) => {
  console.log('Google Maps is ready!');
  const app = createApp(App);
  app.config.globalProperties.$google = google;
  app.use(router); // Add this line
  app.mount('#app');
}).catch(error => {
  console.error('Error loading Google Maps:', error);
});


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

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
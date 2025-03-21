
// import { createApp } from 'vue';
// import App from './App.vue';
// import router from './router';

// import firebase from 'firebase/compat/app'; // Correct compat 
// import 'firebase/compat/auth'; // Compat auth module

// // Your Firebase config from Firebase Console > Project Settings > Web App
// const firebaseConfig = {
//   apiKey: "AIzaSyBWL6upXE9ddyg316YjKEP3uhqD94zzZ6o",
//   authDomain: "logisticsapp-452114.firebaseapp.com",
//   projectId: "logisticsapp-452114",
//   storageBucket: "logisticsapp-452114.firebasestorage.app",
//   messagingSenderId: "141761337686",
//   appId: "1:141761337686:web:e69c9aa6087f414571def7"
// };

// // Initialize Firebase
// firebase.initializeApp(firebaseConfig);

// firebase.auth().onAuthStateChanged(user => {
//   console.log('Auth state changed:', user ? 'Logged in' : 'Logged out');
// });

// const app = createApp(App);
// app.use(router);
// app.mount('#app');


import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBWL6upXE9ddyg316YjKEP3uhqD94zzZ6o",
  authDomain: "logisticsapp-452114.firebaseapp.com",
  projectId: "logisticsapp-452114",
  storageBucket: "logisticsapp-452114.firebasestorage.app",
  messagingSenderId: "141761337686",
  appId: "1:141761337686:web:e69c9aa6087f414571def7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

firebase.auth().onAuthStateChanged(user => {
  console.log('Auth state changed:', user ? 'Logged in' : 'Logged out');
});

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

const GOOGLE_MAPS_API_KEY = 'AIzaSyCOrCd4askrLzy3Ml2LGzsX1a1pHmuLC6k';

const app = createApp(App);

loadGoogleMapsScript(GOOGLE_MAPS_API_KEY)
  .then(() => {
    app.use(router);
    app.mount('#app');
  })
  .catch(error => {
    console.error(error);
  });

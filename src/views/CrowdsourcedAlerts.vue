<template>
  <div class="crowdsourced-alerts">
    <div class="header">
      <h2><i class="fas fa-broadcast-tower"></i> Crowdsourced Delivery Alerts</h2>
    </div>
    <div class="map-container">
      <div id="map" ref="mapContainer"></div>
      <div class="map-overlay">
        <div class="alert-actions">
          <p><i class="fas fa-mouse-pointer"></i> Click the map to report an issue</p>
        </div>
      </div>
    </div>
    
    <transition name="fade">
      <div v-if="showReportModal" class="modal-backdrop" @click.self="cancelReport"></div>
    </transition>
    
    <transition name="slide-fade">
      <div v-if="showReportModal" class="modal">
        <div class="modal-header">
          <h3><i class="fas fa-exclamation-triangle"></i> Report an Issue</h3>
          <button @click="cancelReport" class="close-btn"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-content">
          <div v-if="newAlert.location" class="location-info">
            <i class="fas fa-map-marker-alt"></i> Location: {{ formatCoordinates(newAlert.location.lat) }}, {{ formatCoordinates(newAlert.location.lng) }}
          </div>
          <div class="form-group">
            <label>Issue Type <span class="required">*</span></label>
            <select v-model="newAlert.type" class="form-control" required>
              <option value="" disabled selected>Select issue type</option>
              <option value="Accident">Accident</option>
              <option value="Roadwork">Roadwork</option>
              <option value="Traffic Jam">Traffic Jam</option>
              <option value="Road Closure">Road Closure</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label>Description</label>
            <input 
              v-model="newAlert.description" 
              class="form-control" 
              placeholder="Brief description (optional)" 
              maxlength="100" 
              @keydown.enter="submitIfValid"
            />
            <small class="char-count" :class="{ 'warning': newAlert.description.length > 80 }">
              {{ newAlert.description.length }}/100
            </small>
          </div>
          <div class="form-actions">
            <button 
              @click="postAlert" 
              :disabled="!isAlertValid" 
              class="submit-btn"
              :class="{ 'disabled': !isAlertValid }"
            >
              <i class="fas fa-paper-plane"></i> Submit
            </button>
            <button @click="cancelReport" class="cancel-btn">
              <i class="fas fa-ban"></i> Cancel
            </button>
          </div>
        </div>
      </div>
    </transition>
    
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner">
        <i class="fas fa-circle-notch fa-spin"></i>
      </div>
      <p>Loading alerts...</p>
    </div>
    
    <div class="community-feed">
      <h3><i class="fas fa-bullhorn"></i> Community Alerts</h3>
      
      <div class="filters">
        <select v-model="activeFilter" class="filter-select">
          <option value="all">All Alerts</option>
          <option value="Accident">Accidents</option>
          <option value="Roadwork">Roadwork</option>
          <option value="Traffic Jam">Traffic Jams</option>
          <option value="Road Closure">Road Closures</option>
          <option value="Other">Other</option>
        </select>
        <select v-model="sortOption" class="sort-select">
          <option value="newest">Newest First</option>
          <option value="votes">Most Upvoted</option>
        </select>
      </div>
      
      <transition-group name="list" tag="ul" class="alerts-list">
        <li v-for="alert in filteredAlerts" :key="alert.id" class="alert-item">
          <div class="alert-info">
            <div class="alert-type" :class="getAlertClass(alert.type)">
              {{ alert.type }}
            </div>
            <div class="alert-description">
              {{ alert.description || 'No description' }}
            </div>
            <div class="alert-time">
              {{ formatTimestamp(alert.timestamp) }}
              <span class="location-link" @click="centerMapOn(alert)">
                <i class="fas fa-map-marker-alt"></i> Show on map
              </span>
            </div>
          </div>
          <div class="alert-controls">
            <span class="votes" :class="{'positive': alert.votes > 0, 'negative': alert.votes < 0}">
              <i class="fas" :class="getVoteIcon(alert.votes)"></i>
              {{ Math.abs(alert.votes) }}
            </span>
            <button 
              @click="upvote(alert)" 
              class="vote-btn upvote-btn" 
              title="Upvote"
              :disabled="alert.userVoted === 'up'"
              :class="{ 'active': alert.userVoted === 'up' }"
            >
              <i class="fas fa-thumbs-up"></i>
            </button>
            <button 
              @click="downvote(alert)" 
              class="vote-btn downvote-btn" 
              title="Downvote"
              :disabled="alert.userVoted === 'down'"
              :class="{ 'active': alert.userVoted === 'down' }"
            >
              <i class="fas fa-thumbs-down"></i>
            </button>
            <button 
              v-if="canDeleteAlert(alert)" 
              @click="confirmDeleteAlert(alert.id)" 
              class="delete-btn" 
              title="Delete"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </li>
      </transition-group>
      
      <div v-if="filteredAlerts.length === 0 && !isLoading" class="no-alerts">
        <i class="fas fa-info-circle"></i> 
        {{ activeFilter === 'all' ? 'No alerts reported yet. Be the first to report an issue!' : 'No alerts found for the selected filter.' }}
      </div>
    </div>
    
    <transition name="fade">
      <div v-if="showConfirmDialog" class="modal-backdrop">
        <div class="confirm-modal">
          <div class="confirm-header">
            <h3><i class="fas fa-question-circle"></i> Confirm Delete</h3>
          </div>
          <div class="confirm-content">
            <p>Are you sure you want to delete this alert?</p>
          </div>
          <div class="confirm-actions">
            <button @click="deleteAlert" class="confirm-btn">Yes, Delete</button>
            <button @click="cancelDeleteConfirmation" class="cancel-btn">Cancel</button>
          </div>
        </div>
      </div>
    </transition>
    
    <div v-if="notification.show" class="notification" :class="notification.type">
      <i :class="getNotificationIcon()"></i>
      {{ notification.message }}
    </div>
  </div>
</template>

<script>
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

export default {
  name: 'CrowdsourcedAlerts',
  
  data() {
    return {
      map: null,
      markers: {},
      alerts: [],
      filteredAlerts: [],
      showReportModal: false,
      isLoading: true,
      tempMarker: null,
      newAlert: {
        type: '',
        description: '',
        location: null,
        votes: 0,
        userVoted: null,
      },
      activeFilter: 'all',
      sortOption: 'newest',
      notification: {
        show: false,
        message: '',
        type: 'info'
      },
      showConfirmDialog: false,
      alertToDelete: null,
      userId: null,
      mapInitialized: false,
    };
  },
  
  computed: {
    isAlertValid() {
      return this.newAlert.type && this.newAlert.location;
    },
  },
  
  watch: {
  isLoading(newVal) {
    console.log('Loading state changed:', newVal);
  },

    activeFilter() {
      this.filterAlerts();
    },
    sortOption() {
      this.sortAlerts();
    },
    alerts: {
      handler() {
        this.filterAlerts();
      },
      deep: true
    }
  },
  
  async created() {
    // Generate anonymous user ID if not logged in
    this.userId = localStorage.getItem('alertUserId') || this.generateUserId();
    localStorage.setItem('alertUserId', this.userId);
    
    // Load FontAwesome
    this.loadFontAwesome();
  },
  
  mounted() {
    // Initialize map with a delay to ensure DOM is ready
    this.$nextTick(() => {
      this.initializeGoogleMaps();
    });
  },
  
  methods: {
    loadFontAwesome() {
      if (!document.getElementById('font-awesome-css')) {
        const link = document.createElement('link');
        link.id = 'font-awesome-css';
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
        document.head.appendChild(link);
      }
    },
    
    initializeGoogleMaps() {
      // Check if Google Maps API is loaded
      if (window.google && window.google.maps) {
        this.initMap();
        this.fetchAlerts();
      } else {
        // Poll for Google Maps API availability
        const checkGoogleMaps = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkGoogleMaps);
            this.initMap();
            this.fetchAlerts();
          }
        }, 100);
        
        // Timeout after 10 seconds
        setTimeout(() => {
          if (!this.mapInitialized) {
            clearInterval(checkGoogleMaps);
            this.showNotification('Error loading Google Maps. Please refresh the page.', 'error');
            this.isLoading = false;
          }
        }, 10000);
      }
    },
    
    initMap() {
      console.log('Initializing map');
      const mapStyles = [
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#e9e9e9" }] },
        { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
        { featureType: "poi", elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
        { featureType: "transit", elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
      ];
      
      // Get user's location if available
      const defaultCenter = { lat: 37.7749, lng: -122.4194 };
      
      this.map = new window.google.maps.Map(this.$refs.mapContainer, {
        center: defaultCenter,
        zoom: 12,
        styles: mapStyles,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: 'greedy',
      });
      
      // Add click listener for adding new alerts
      this.map.addListener('click', (event) => {
        this.pinpointLocation(event.latLng);
      });
      
      // Try to get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            this.map.setCenter(userLocation);
            
            // Add a marker for user's location
            new window.google.maps.Marker({
              position: userLocation,
              map: this.map,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2
              },
              title: 'Your Location'
            });
          },
          () => {
            // Error handling - use default location
            console.log('Unable to get current location. Using default.');
          }
        );
        this.mapInitialized = true;
       console.log('Map initialized successfully');
      }
      
      this.mapInitialized = true;
    },
    async fetchAlerts() {
  try {
    this.isLoading = true;
    console.log('Starting to fetch alerts');
    
    // Get user's previously voted on alerts
    const userVotes = JSON.parse(localStorage.getItem('userVotes') || '{}');
    
    firebase.firestore().collection('alerts')
      .orderBy('timestamp', 'desc')
      .onSnapshot(snapshot => {
        console.log('Snapshot received:', snapshot.docs.length, 'documents');
        // Process alerts
        this.alerts = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            userVoted: userVotes[doc.id] || null
          };
        });
        
        console.log('Processed alerts:', this.alerts.length);
        this.filterAlerts();
        this.displayAlertsOnMap();
        this.isLoading = false;
      }, err => {
        console.error('Error fetching alerts:', err);
        this.showNotification('Error loading alerts. Please try again.', 'error');
        this.isLoading = false;
      });
  } catch (err) {
    console.error('Error in fetch alerts:', err);
    this.showNotification('An error occurred. Please try again.', 'error');
    this.isLoading = false;
  }
},

    filterAlerts() {
      if (this.activeFilter === 'all') {
        this.filteredAlerts = [...this.alerts];
      } else {
        this.filteredAlerts = this.alerts.filter(alert => alert.type === this.activeFilter);
      }
      
      this.sortAlerts();
    },
    
    sortAlerts() {
      if (this.sortOption === 'newest') {
        this.filteredAlerts.sort((a, b) => {
          if (!a.timestamp || !b.timestamp) return 0;
          return b.timestamp.seconds - a.timestamp.seconds;
        });
      } else if (this.sortOption === 'votes') {
        this.filteredAlerts.sort((a, b) => b.votes - a.votes);
      }
    },
    
    clearMarkers() {
      // Clear existing markers
      for (const markerId in this.markers) {
        if (this.markers[markerId]) {
          this.markers[markerId].setMap(null);
        }
      }
      this.markers = {};
    },
    
    displayAlertsOnMap() {
      this.clearMarkers();
      
      this.alerts.forEach(alert => {
        if (!alert.location) return;
        
        const marker = new window.google.maps.Marker({
          position: alert.location,
          map: this.map,
          title: `${alert.type} - ${alert.description || 'No description'}`,
          icon: this.getMarkerIcon(alert.type),
          animation: window.google.maps.Animation.DROP,
        });
        
        this.markers[alert.id] = marker;
        
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="map-info-window">
              <div class="info-window-header ${this.getAlertClass(alert.type)}">
                ${alert.type}
              </div>
              <div class="info-window-content">
                <div class="info-window-description">${alert.description || 'No description'}</div>
                <div class="info-window-votes">
                  <strong>Votes:</strong> ${alert.votes}
                </div>
                <div class="info-window-time">
                  <strong>Reported:</strong> ${this.formatTimestamp(alert.timestamp)}
                </div>
              </div>
            </div>
          `,
        });
        
        marker.addListener('click', () => {
          // Close any open info windows
          for (const markerId in this.markers) {
            if (this.markers[markerId].infoWindow) {
              this.markers[markerId].infoWindow.close();
            }
          }
          
          infoWindow.open(this.map, marker);
          marker.infoWindow = infoWindow;
        });
      });
    },
    
    getMarkerIcon(type) {
      const icons = {
        'Accident': 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
        'Roadwork': 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png',
        'Traffic Jam': 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
        'Road Closure': 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png',
        'Other': 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
      };
      
      return icons[type] || icons['Other'];
    },
    
    pinpointLocation(latLng) {
      if (this.tempMarker) {
        this.tempMarker.setMap(null);
      }
      
      this.tempMarker = new window.google.maps.Marker({
        position: latLng,
        map: this.map,
        icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
        animation: window.google.maps.Animation.BOUNCE,
        draggable: true, // Allow marker to be dragged for position adjustment
      });
      
      // Add drag listener to update location
      this.tempMarker.addListener('dragend', (event) => {
        this.newAlert.location = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        };
      });
      
      this.newAlert.location = {
        lat: latLng.lat(),
        lng: latLng.lng(),
      };
      
      // Stop bouncing after 2 seconds
      setTimeout(() => {
        if (this.tempMarker) {
          this.tempMarker.setAnimation(null);
        }
      }, 2000);
      
      this.showReportModal = true;
    },
    
    cancelReport() {
      if (this.tempMarker) {
        this.tempMarker.setMap(null);
        this.tempMarker = null;
      }
      
      this.newAlert = {
        type: '',
        description: '',
        location: null,
        votes: 0,
        userVoted: null,
      };
      
      this.showReportModal = false;
    },
    
    submitIfValid(event) {
      if (this.isAlertValid) {
        event.preventDefault();
        this.postAlert();
      }
    },
    
async postAlert() {
  if (!this.isAlertValid) return;

  // Capture alert data before resetting
  const alertData = {
    ...this.newAlert,
    createdBy: this.userId,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  };

  // Close modal and clean up UI immediately
  if (this.tempMarker) {
    this.tempMarker.setMap(null);
    this.tempMarker = null;
  }
  this.showReportModal = false;
  
  // Reset newAlert
  this.newAlert = {
    type: '',
    description: '',
    location: null,
    votes: 0,
    userVoted: null,
  };

  try {
    // Save to Firestore
    const docRef = await firebase.firestore().collection('alerts').add(alertData);
    console.log('Alert created with ID:', docRef.id);
    this.showNotification('Alert successfully reported!', 'success');
  } catch (err) {
    console.error('Error posting alert:', err);
    this.showNotification('Failed to post alert. Please try again.', 'error');
  }
},

    async upvote(alert) {
      try {
        const userVotes = JSON.parse(localStorage.getItem('userVotes') || '{}');
        
        // If user already upvoted, don't allow another upvote
        if (userVotes[alert.id] === 'up') return;
        
        // Calculate new vote value
        let voteChange = 1;
        if (userVotes[alert.id] === 'down') {
          // If user previously downvoted, remove downvote and add upvote (+2 total)
          voteChange = 2;
        }
        
        // Update in Firestore
        // await firebase.firestore().collection('alerts').add(alertData);
        await firebase.firestore().collection('alerts').doc(alert.id).update({
          votes: firebase.firestore.FieldValue.increment(voteChange)
        });
        
        // Save user vote locally
        userVotes[alert.id] = 'up';
        localStorage.setItem('userVotes', JSON.stringify(userVotes));
        
        // Update local state
        alert.userVoted = 'up';
        
        this.showNotification('Vote recorded', 'success');
      } catch (err) {
        console.error('Error upvoting alert:', err);
        this.showNotification('Failed to record vote', 'error');
      }
    },
    
    async downvote(alert) {
      try {
        const userVotes = JSON.parse(localStorage.getItem('userVotes') || '{}');
        
        // If user already downvoted, don't allow another downvote
        if (userVotes[alert.id] === 'down') return;
        
        // Calculate new vote value
        let voteChange = -1;
        if (userVotes[alert.id] === 'up') {
          // If user previously upvoted, remove upvote and add downvote (-2 total)
          voteChange = -2;
        }
        
        // Update in Firestore
        await firebase.firestore().collection('alerts').doc(alert.id).update({
          votes: firebase.firestore.FieldValue.increment(voteChange)
        });
        
        // Save user vote locally
        userVotes[alert.id] = 'down';
        localStorage.setItem('userVotes', JSON.stringify(userVotes));
        
        // Update local state
        alert.userVoted = 'down';
        
        this.showNotification('Vote recorded', 'success');
      } catch (err) {
        console.error('Error downvoting alert:', err);
        this.showNotification('Failed to record vote', 'error');
      }
    },
    
    canDeleteAlert(alert) {
      // Can delete if votes are zero or if the current user created it
      return alert.votes === 0 || alert.createdBy === this.userId;
    },
    
    confirmDeleteAlert(alertId) {
      this.alertToDelete = alertId;
      this.showConfirmDialog = true;
    },
    
    cancelDeleteConfirmation() {
      this.alertToDelete = null;
      this.showConfirmDialog = false;
    },
    

    async deleteAlert() {
  if (!this.alertToDelete) return;

  // Close dialog immediately
  const alertId = this.alertToDelete;
  this.alertToDelete = null;
  this.showConfirmDialog = false;

  try {
    await firebase.firestore().collection('alerts').doc(alertId).delete();
    
    // Remove from user votes if exists
    const userVotes = JSON.parse(localStorage.getItem('userVotes') || '{}');
    if (userVotes[alertId]) {
      delete userVotes[alertId];
      localStorage.setItem('userVotes', JSON.stringify(userVotes));
    }
    
    this.showNotification('Alert deleted successfully', 'success');
  } catch (err) {
    console.error('Error deleting alert:', err);
    this.showNotification('Failed to delete alert', 'error');
  }
},
//     async deleteAlert() {
//   if (!this.alertToDelete) return;

//   try {
//     await firebase.firestore().collection('alerts').doc(this.alertToDelete).delete();
    
//     // Remove from user votes if exists
//     const userVotes = JSON.parse(localStorage.getItem('userVotes') || '{}');
//     if (userVotes[this.alertToDelete]) {
//       delete userVotes[this.alertToDelete];
//       localStorage.setItem('userVotes', JSON.stringify(userVotes));
//     }
    
//     this.showNotification('Alert deleted successfully', 'success');
//   } catch (err) {
//     console.error('Error deleting alert:', err);
//     this.showNotification('Failed to delete alert', 'error');
//   } finally {
//     // Ensure cleanup happens no matter what
//     this.alertToDelete = null;
//     this.showConfirmDialog = false;
//   }
// },
    
    centerMapOn(alert) {
      if (alert.location && this.map) {
        this.map.setCenter(alert.location);
        this.map.setZoom(15);
        
        // Open the info window for this alert
        if (this.markers[alert.id]) {
          window.google.maps.event.trigger(this.markers[alert.id], 'click');
        }
      }
    },
    
    formatTimestamp(timestamp) {
      if (!timestamp) return 'N/A';
      
      // Handle both Firebase Timestamp objects and date objects
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString();
    },
    
    formatCoordinates(coord) {
      return coord.toFixed(4);
    },
    
    getAlertClass(type) {
      return type.toLowerCase().replace(/\s+/g, '-');
    },
    
    getVoteIcon(votes) {
      if (votes > 0) return 'fa-arrow-up';
      if (votes < 0) return 'fa-arrow-down';
      return 'fa-minus';
    },
    
    showNotification(message, type = 'info') {
      this.notification = {
        show: true,
        message,
        type
      };
      
      // Hide after 3 seconds
      setTimeout(() => {
        this.notification.show = false;
      }, 3000);
    },
    
    getNotificationIcon() {
      const icons = {
        'success': 'fas fa-check-circle',
        'error': 'fas fa-exclamation-circle',
        'info': 'fas fa-info-circle',
        'warning': 'fas fa-exclamation-triangle'
      };
      
      return icons[this.notification.type] || icons.info;
    },
    
    generateUserId() {
      return 'user_' + Math.random().toString(36).substr(2, 9);
    }
  }
};
</script>

<style scoped>
/* Base styling */
.crowdsourced-alerts {
  padding: 0;
  background-color: #f8f9fa;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
}

.header {
  background: linear-gradient(135deg, #3a7bd5, #00d2ff);
  color: white;
  padding: 20px;
  text-align: center;
  border-radius: 0 0 15px 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

.header h2 i {
  margin-right: 10px;
}

/* Loading state */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 100;
  backdrop-filter: blur(3px);
}

.spinner {
  font-size: 36px;
  color: #3a7bd5;
  margin-bottom: 15px;
}

.loading-overlay p {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

/* Map container styling */
.map-container {
  position: relative;
  margin: 0 20px 20px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.map-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

#map {
  height: 400px;
  width: 100%;
}

.map-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.8);
  padding: 10px 15px;
  backdrop-filter: blur(4px);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.alert-actions {
  text-align: center;
}

.alert-actions p {
  margin: 0;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.alert-actions p i {
  color: #3a7bd5;
  margin-right: 5px;
}

/* Modal styling */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(2px);
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  width: 90%;
  max-width: 450px;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  overflow: hidden;
}

.modal-header {
  background: linear-gradient(135deg, #3a7bd5, #00d2ff);
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.modal-header i {
  margin-right: 8px;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.close-btn:hover {
  transform: scale(1.2);
}

.modal-content {
  padding: 20px;
}

.location-info {
  background-color: #f0f8ff;
  padding: 10px 15px;
  border-radius: 5px;
  margin-bottom: 15px;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.location-info i {
  color: #3a7bd5;
  margin-right: 8px;
  font-size: 16px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  font-size: 14px;
  color: #333;
}

.required {
  color: #e74c3c;
  font-weight: bold;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-control:focus {
  border-color: #3a7bd5;
  box-shadow: 0 0 0 3px rgba(58, 123, 213, 0.1);
  outline: none;
}

.char-count {
  float: right;
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.char-count.warning {
  color: #e74c3c;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.submit-btn, .cancel-btn {
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

.submit-btn {
  background-color: #3a7bd5;
  color: white;
  border: none;
}

.submit-btn:hover {
  background-color: #2e5eb3;
  transform: translateY(-2px);
}

.submit-btn.disabled {
  background-color: #b3c4e0;
  cursor: not-allowed;
}

.submit-btn i, .cancel-btn i {
  margin-right: 8px;
}

.cancel-btn {
  background-color: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
}

.cancel-btn:hover {
  background-color: #eaecef;
  transform: translateY(-2px);
}

/* Community feed styling */
.community-feed {
  padding: 0 20px 20px;
}

.community-feed h3 {
  display: flex;
  align-items: center;
  font-size: 20px;
  margin-bottom: 15px;
  color: #333;
}

.community-feed h3 i {
  margin-right: 10px;
  color: #3a7bd5;
}

.filters {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.filter-select, .sort-select {
  padding: 8px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: white;
  font-size: 14px;
  min-width: 120px;
  cursor: pointer;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.filter-select:focus, .sort-select:focus {
  border-color: #3a7bd5;
  box-shadow: 0 0 0 3px rgba(58, 123, 213, 0.1);
  outline: none;
}

.alerts-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.alert-item {
  background-color: white;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.alert-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.alert-info {
  flex: 1;
  padding: 15px;
  position: relative;
}

.alert-type {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 10px;
  color: white;
}

.accident {
  background-color: #e74c3c;
}

.roadwork {
  background-color: #f39c12;
}

.traffic-jam {
  background-color: #f1c40f;
  color: #333;
}

.road-closure {
  background-color: #9b59b6;
}

.other {
  background-color: #3498db;
}

.alert-description {
  font-size: 15px;
  margin-bottom: 10px;
  color: #333;
  word-break: break-word;
}

.alert-time {
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
}

.location-link {
  margin-left: 15px;
  color: #3a7bd5;
  cursor: pointer;
  transition: color 0.2s ease;
  display: inline-flex;
  align-items: center;
}

.location-link:hover {
  color: #2e5eb3;
  text-decoration: underline;
}

.location-link i {
  margin-right: 4px;
}

.alert-controls {
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
  padding: 12px;
  justify-content: center;
  align-items: center;
  border-left: 1px solid #eee;
  min-width: 60px;
}

.votes {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #777;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.votes i {
  margin-bottom: 3px;
}

.votes.positive {
  color: #27ae60;
}

.votes.negative {
  color: #e74c3c;
}

.vote-btn {
  background: none;
  border: none;
  font-size: 16px;
  color: #888;
  cursor: pointer;
  margin: 2px 0;
  padding: 5px;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.vote-btn:hover {
  background-color: #eee;
}

.vote-btn.active {
  color: white;
}

.upvote-btn.active {
  background-color: #27ae60;
}

.downvote-btn.active {
  background-color: #e74c3c;
}

.delete-btn {
  background: none;
  border: none;
  font-size: 16px;
  color: #888;
  cursor: pointer;
  margin-top: 10px;
  padding: 5px;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background-color: #fff1f0;
  color: #e74c3c;
}

.no-alerts {
  text-align: center;
  padding: 30px 0;
  color: #777;
  background-color: white;
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.no-alerts i {
  font-size: 24px;
  color: #3a7bd5;
  margin-bottom: 10px;
}

/* Confirm dialog */
.confirm-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  width: 90%;
  max-width: 350px;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  z-index: 1001;
  overflow: hidden;
}

.confirm-header {
  background-color: #e74c3c;
  color: white;
  padding: 15px 20px;
}

.confirm-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.confirm-header i {
  margin-right: 8px;
}

.confirm-content {
  padding: 20px;
  text-align: center;
}

.confirm-actions {
  display: flex;
  justify-content: space-between;
  padding: 0 20px 20px;
}

.confirm-btn {
  padding: 10px 20px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.confirm-btn:hover {
  background-color: #c0392b;
}

/* Notification styling */
.notification {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 20px;
  border-radius: 5px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  z-index: 1000;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  min-width: 250px;
  max-width: 80%;
}

.notification i {
  margin-right: 10px;
  font-size: 16px;
}

.notification.success {
  background-color: #27ae60;
}

.notification.error {
  background-color: #e74c3c;
}

.notification.info {
  background-color: #3498db;
}

.notification.warning {
  background-color: #f39c12;
}

/* Map info window customizations */
.map-info-window {
  max-width: 250px;
  min-width: 200px;
}

.info-window-header {
  font-weight: bold;
  color: white;
  padding: 5px 10px;
  border-radius: 3px 3px 0 0;
  text-align: center;
}

.info-window-content {
  padding: 10px;
}

.info-window-description {
  margin-bottom: 5px;
  font-weight: 500;
}

.info-window-votes,
.info-window-time {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s;
}

.list-enter,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* Responsive design adjustments */
@media screen and (max-width: 768px) {
  #map {
    height: 300px;
  }
  
  .alert-item {
    flex-direction: column;
  }
  
  .alert-controls {
    flex-direction: row;
    border-left: none;
    border-top: 1px solid #eee;
    padding: 10px;
    min-width: auto;
  }
  
  .votes {
    margin-bottom: 0;
    margin-right: 15px;
    flex-direction: row;
  }
  
  .votes i {
    margin-bottom: 0;
    margin-right: 5px;
  }
  
  .delete-btn {
    margin-top: 0;
    margin-left: auto;
  }
}

@media screen and (max-width: 480px) {
  .header h2 {
    font-size: 20px;
  }
  
  .community-feed h3 {
    font-size: 18px;
  }
  
  .filters {
    flex-direction: column;
  }
  
  .filter-select {
    margin-bottom: 10px;
  }
}
</style>

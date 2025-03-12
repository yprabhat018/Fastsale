<template>
  <div class="crowdsourced-alerts">
    <div class="header">
      <h2><i class="fas fa-broadcast-tower"></i> Crowdsourced Delivery Alerts</h2>
    </div>
    <div class="map-container">
      <div id="map"></div>
      <div class="map-overlay">
        <div class="alert-actions">
          <p><i class="fas fa-mouse-pointer"></i> Click the map to report an issue</p>
        </div>
      </div>
    </div>
    
    <transition name="fade">
      <div v-if="showReportModal" class="modal-backdrop" @click="cancelReport"></div>
    </transition>
    
    <transition name="slide-fade">
      <div v-if="showReportModal" class="modal">
        <div class="modal-header">
          <h3><i class="fas fa-exclamation-triangle"></i> Report an Issue</h3>
          <button @click="cancelReport" class="close-btn"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-content">
          <div v-if="newAlert.location" class="location-info">
            <i class="fas fa-map-marker-alt"></i> Location: {{ newAlert.location.lat.toFixed(4) }}, {{ newAlert.location.lng.toFixed(4) }}
          </div>
          <div class="form-group">
            <label>Issue Type</label>
            <select v-model="newAlert.type" class="form-control">
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
            <input v-model="newAlert.description" class="form-control" placeholder="Brief description (optional)" maxlength="100" />
          </div>
          <div class="form-actions">
            <button @click="submitReport" :disabled="!newAlert.type" class="submit-btn">
              <i class="fas fa-paper-plane"></i> Submit
            </button>
            <button @click="cancelReport" class="cancel-btn">
              <i class="fas fa-ban"></i> Cancel
            </button>
          </div>
        </div>
      </div>
    </transition>
    
    <div class="community-feed">
      <h3><i class="fas fa-bullhorn"></i> Community Alerts</h3>
      <transition-group name="list" tag="ul">
        <li v-for="alert in alerts" :key="alert.id" class="alert-item">
          <div class="alert-info">
            <div class="alert-type" :class="alert.type.toLowerCase().replace(' ', '-')">
              {{ alert.type }}
            </div>
            <div class="alert-description">
              {{ alert.description || 'No description' }}
            </div>
            <div class="alert-time">
              {{ formatTimestamp(alert.timestamp) }}
            </div>
          </div>
          <div class="alert-controls">
            <span class="votes" :class="{'positive': alert.votes > 0, 'negative': alert.votes < 0}">
              <i class="fas" :class="[alert.votes > 0 ? 'fa-arrow-up' : (alert.votes < 0 ? 'fa-arrow-down' : 'fa-minus')]"></i>
              {{ Math.abs(alert.votes) }}
            </span>
            <button @click="upvote(alert)" class="vote-btn upvote-btn" title="Upvote">
              <i class="fas fa-thumbs-up"></i>
            </button>
            <button @click="downvote(alert)" class="vote-btn downvote-btn" title="Downvote">
              <i class="fas fa-thumbs-down"></i>
            </button>
            <button v-if="alert.votes === 0" @click="deleteAlert(alert.id)" class="delete-btn" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </li>
      </transition-group>
      <div v-if="alerts.length === 0" class="no-alerts">
        <i class="fas fa-info-circle"></i> No alerts reported yet. Be the first to report an issue!
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CrowdsourcedAlerts',
  data() {
    return {
      map: null,
      alerts: [],
      showReportModal: false,
      tempMarker: null,
      newAlert: {
        type: '',
        description: '',
        location: null,
        votes: 0,
      },
    };
  },
  mounted() {
    this.loadFontAwesome();
    if (window.google && window.google.maps) {
      this.initMap();
      this.loadAlerts();
    } else {
      const interval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(interval);
          this.initMap();
          this.loadAlerts();
        }
      }, 100);
    }
  },
  methods: {
    loadFontAwesome() {
      // Load Font Awesome if not already loaded
      if (!document.getElementById('font-awesome-css')) {
        const link = document.createElement('link');
        link.id = 'font-awesome-css';
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
        document.head.appendChild(link);
      }
    },
    initMap() {
      const mapStyles = [
        {
          "featureType": "road",
          "elementType": "geometry",
          "stylers": [
            { "color": "#ffffff" }
          ]
        },
        {
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [
            { "color": "#e9e9e9" }
          ]
        }
      ];
      
      this.map = new window.google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.7749, lng: -122.4194 },
        zoom: 12,
        styles: mapStyles,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });
      
      this.map.addListener('click', (event) => {
        this.pinpointLocation(event.latLng);
      });
    },
    loadAlerts() {
      this.alerts = JSON.parse(localStorage.getItem('crowdsourcedAlerts')) || [
        { id: 1, type: 'Accident', description: 'Crash on I-80', location: { lat: 37.7749, lng: -122.4194 }, votes: 3, timestamp: new Date() },
        { id: 2, type: 'Roadwork', description: 'Lane closed near bridge', location: { lat: 37.7849, lng: -122.4294 }, votes: 1, timestamp: new Date() },
      ];
      this.displayAlertsOnMap();
    },
    displayAlertsOnMap() {
      this.alerts.forEach(alert => {
        const marker = new window.google.maps.Marker({
          position: alert.location,
          map: this.map,
          title: `${alert.type} - ${alert.description || 'No description'}`,
          icon: this.getMarkerIcon(alert.type),
          animation: window.google.maps.Animation.DROP,
        });
        
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="map-info-window">
              <div class="info-window-header ${alert.type.toLowerCase().replace(' ', '-')}">
                ${alert.type}
              </div>
              <div class="info-window-content">
                ${alert.description || 'No description'}
                <div class="info-window-votes">
                  <strong>Votes:</strong> ${alert.votes}
                </div>
              </div>
            </div>
          `
        });
        
        marker.addListener('click', () => {
          infoWindow.open(this.map, marker);
        });
      });
    },
    getMarkerIcon(type) {
      switch (type) {
        case 'Accident': return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
        case 'Roadwork': return 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png';
        case 'Traffic Jam': return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
        case 'Road Closure': return 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png';
        default: return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
      }
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
      });
      
      this.newAlert.location = {
        lat: latLng.lat(),
        lng: latLng.lng(),
      };
      
      // Stop the animation after 2 seconds
      setTimeout(() => {
        if (this.tempMarker) {
          this.tempMarker.setAnimation(null);
        }
      }, 2000);
      
      this.showReportModal = true;
    },
    submitReport() {
      if (!this.newAlert.type || !this.newAlert.location) return;
      
      const alert = {
        id: Date.now(), // Use timestamp as ID to ensure uniqueness
        type: this.newAlert.type,
        description: this.newAlert.description,
        location: this.newAlert.location,
        votes: 0,
        timestamp: new Date(),
      };
      
      this.alerts.unshift(alert); // Add to beginning of array
      localStorage.setItem('crowdsourcedAlerts', JSON.stringify(this.alerts));
      
      if (this.tempMarker) {
        this.tempMarker.setMap(null);
        this.tempMarker = null;
      }
      
      // Refresh the map
      this.refreshMap();
      
      this.newAlert = { type: '', description: '', location: null, votes: 0 };
      this.showReportModal = false;
    },
    cancelReport() {
      if (this.tempMarker) {
        this.tempMarker.setMap(null);
        this.tempMarker = null;
      }
      this.newAlert = { type: '', description: '', location: null, votes: 0 };
      this.showReportModal = false;
    },
    upvote(alert) {
      alert.votes++;
      localStorage.setItem('crowdsourcedAlerts', JSON.stringify(this.alerts));
    },
    downvote(alert) {
      alert.votes--;
      localStorage.setItem('crowdsourcedAlerts', JSON.stringify(this.alerts));
    },
    deleteAlert(alertId) {
      const index = this.alerts.findIndex(alert => alert.id === alertId);
      if (index !== -1 && this.alerts[index].votes === 0) {
        this.alerts.splice(index, 1);
        localStorage.setItem('crowdsourcedAlerts', JSON.stringify(this.alerts));
        // Refresh the map
        this.refreshMap();
      }
    },
    refreshMap() {
      // Clear the existing map and re-initialize
      const mapCenter = this.map.getCenter();
      const mapZoom = this.map.getZoom();
      
      this.map = new window.google.maps.Map(document.getElementById('map'), {
        center: mapCenter,
        zoom: mapZoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });
      
      this.map.addListener('click', (event) => {
        this.pinpointLocation(event.latLng);
      });
      
      this.displayAlertsOnMap();
    },
    formatTimestamp(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString();
    }
  },
};
</script>

<style scoped>
/* Base styling */
.crowdsourced-alerts {
  padding: 0;
  background-color: #f8f9fa;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #3a7bd5, #00d2ff);
  color: white;
  padding: 15px 20px;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.modal-header h3 i {
  margin-right: 8px;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
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
  color: #3a7bd5;
  border-left: 4px solid #3a7bd5;
}

.location-info i {
  margin-right: 5px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
  font-size: 14px;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 5px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: #3a7bd5;
  box-shadow: 0 0 0 3px rgba(58, 123, 213, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.submit-btn, .cancel-btn {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.submit-btn {
  background-color: #3a7bd5;
  color: white;
}

.submit-btn:hover {
  background-color: #2a6cbf;
  transform: translateY(-2px);
}

.submit-btn:disabled {
  background-color: #b3c7e6;
  cursor: not-allowed;
  transform: none;
}

.cancel-btn {
  background-color: #f44336;
  color: white;
}

.cancel-btn:hover {
  background-color: #e53935;
  transform: translateY(-2px);
}

/* Community feed styling */
.community-feed {
  margin: 0 20px 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.community-feed h3 {
  margin: 0;
  padding: 15px 20px;
  font-size: 18px;
  color: #333;
  background-color: #f2f6ff;
  border-bottom: 1px solid #e6eefa;
}

.community-feed h3 i {
  margin-right: 8px;
  color: #3a7bd5;
}

.community-feed ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.alert-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.alert-item:hover {
  background-color: #f9fbff;
}

.alert-info {
  flex: 1;
}

.alert-type {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 6px;
  color: white;
}

.alert-type.accident {
  background-color: #f44336;
}

.alert-type.roadwork {
  background-color: #ff9800;
}

.alert-type.traffic-jam {
  background-color: #ffc107;
  color: #333;
}

.alert-type.road-closure {
  background-color: #9c27b0;
}

.alert-type.other {
  background-color: #607d8b;
}

.alert-description {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.alert-time {
  font-size: 12px;
  color: #888;
}

.alert-controls {
  display: flex;
  align-items: center;
  gap: 5px;
}

.votes {
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: #777;
  margin-right: 5px;
}

.votes i {
  margin-right: 4px;
  font-size: 12px;
}

.votes.positive {
  color: #4caf50;
}

.votes.negative {
  color: #f44336;
}

.vote-btn {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #f0f0f0;
  color: #555;
}

.vote-btn:hover {
  transform: scale(1.1);
}

.upvote-btn:hover {
  background-color: #e8f5e9;
  color: #4caf50;
}

.downvote-btn:hover {
  background-color: #ffebee;
  color: #f44336;
}

.delete-btn {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #f0f0f0;
  color: #555;
}

.delete-btn:hover {
  background-color: #ffebee;
  color: #f44336;
  transform: scale(1.1);
}

.no-alerts {
  padding: 20px;
  text-align: center;
  color: #888;
  font-size: 14px;
}

.no-alerts i {
  margin-right: 5px;
  color: #3a7bd5;
}

/* Map info window customization */
.map-info-window {
  min-width: 200px;
}

.info-window-header {
  padding: 8px 12px;
  color: white;
  font-weight: bold;
  border-radius: 4px 4px 0 0;
}

.info-window-header.accident {
  background-color: #f44336;
}

.info-window-header.roadwork {
  background-color: #ff9800;
}

.info-window-header.traffic-jam {
  background-color: #ffc107;
  color: #333;
}

.info-window-header.road-closure {
  background-color: #9c27b0;
}

.info-window-header.other {
  background-color: #607d8b;
}

.info-window-content {
  padding: 10px 12px;
  font-size: 13px;
}

.info-window-votes {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}

/* Animations */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter, .slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

.list-enter-active, .list-leave-active {
  transition: all 0.5s;
}

.list-enter {
  opacity: 0;
  transform: translateY(30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .header {
    padding: 15px;
  }
  
  .map-container {
    margin: 0 15px 15px;
  }
  
  #map {
    height: 350px;
  }
  
  .community-feed {
    margin: 0 15px 15px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .submit-btn, .cancel-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>

<!-- 

 <template>
  <div class="crowdsourced-alerts">
    <h2>Crowdsourced Delivery Alerts</h2>
    <div class="map-container">
      <div id="map"></div>
    </div>
    <div class="alert-actions">
      <p>Click the map to report an issue</p>
    </div>
    <div v-if="showReportModal" class="modal">
      <h3>Report an Issue</h3>
      <p v-if="newAlert.location">Location: {{ newAlert.location.lat.toFixed(4) }}, {{ newAlert.location.lng.toFixed(4) }}</p>
      <select v-model="newAlert.type">
        <option value="Accident">Accident</option>
        <option value="Roadwork">Roadwork</option>
        <option value="Traffic Jam">Traffic Jam</option>
        <option value="Road Closure">Road Closure</option>
        <option value="Other">Other</option>
      </select>
      <input v-model="newAlert.description" placeholder="Brief description (optional)" maxlength="100" />
      <button @click="submitReport" :disabled="!newAlert.type">Submit</button>
      <button @click="cancelReport" class="cancel-btn">Cancel</button>
    </div>
    <div class="community-feed">
      <h3>Community Alerts</h3>
      <ul>
        <li v-for="alert in alerts" :key="alert.id">
          <span>{{ alert.type }} - {{ alert.description || 'No description' }}</span>
          <div class="alert-controls">
            <span class="votes">Votes: {{ alert.votes }}</span>
            <button @click="upvote(alert)" class="vote-btn">👍</button>
            <button @click="downvote(alert)" class="vote-btn">👎</button>
            <button v-if="alert.votes === 0" @click="deleteAlert(alert.id)" class="delete-btn">Delete</button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CrowdsourcedAlerts',
  data() {
    return {
      map: null,
      alerts: [],
      showReportModal: false,
      tempMarker: null,
      newAlert: {
        type: '',
        description: '',
        location: null,
        votes: 0,
      },
    };
  },
  mounted() {
    if (window.google && window.google.maps) {
      this.initMap();
      this.loadAlerts();
    } else {
      const interval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(interval);
          this.initMap();
          this.loadAlerts();
        }
      }, 100);
    }
  },
  methods: {
    initMap() {
      this.map = new window.google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.7749, lng: -122.4194 },
        zoom: 12,
      });
      this.map.addListener('click', (event) => {
        this.pinpointLocation(event.latLng);
      });
    },
    loadAlerts() {
      this.alerts = JSON.parse(localStorage.getItem('crowdsourcedAlerts')) || [
        { id: 1, type: 'Accident', description: 'Crash on I-80', location: { lat: 37.7749, lng: -122.4194 }, votes: 3, timestamp: new Date() },
        { id: 2, type: 'Roadwork', description: 'Lane closed near bridge', location: { lat: 37.7849, lng: -122.4294 }, votes: 1, timestamp: new Date() },
      ];
      this.displayAlertsOnMap();
    },
    displayAlertsOnMap() {
      this.alerts.forEach(alert => {
        const marker = new window.google.maps.Marker({
          position: alert.location,
          map: this.map,
          title: `${alert.type} - ${alert.description || 'No description'}`,
          icon: this.getMarkerIcon(alert.type),
        });
        const infoWindow = new window.google.maps.InfoWindow({
          content: `<b>${alert.type}</b><br>${alert.description || 'No description'}<br>Votes: ${alert.votes}`,
        });
        marker.addListener('click', () => {
          infoWindow.open(this.map, marker);
        });
      });
    },
    getMarkerIcon(type) {
      switch (type) {
        case 'Accident': return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
        case 'Roadwork': return 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png';
        case 'Traffic Jam': return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
        case 'Road Closure': return 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png';
        default: return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
      }
    },
    pinpointLocation(latLng) {
      if (this.tempMarker) {
        this.tempMarker.setMap(null);
      }
      this.tempMarker = new window.google.maps.Marker({
        position: latLng,
        map: this.map,
        icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
      });
      this.newAlert.location = {
        lat: latLng.lat(),
        lng: latLng.lng(),
      };
      this.showReportModal = true;
    },
    submitReport() {
      if (!this.newAlert.type || !this.newAlert.location) return;
      const alert = {
        id: this.alerts.length + 1,
        type: this.newAlert.type,
        description: this.newAlert.description,
        location: this.newAlert.location,
        votes: 0,
        timestamp: new Date(),
      };
      this.alerts.push(alert);
      localStorage.setItem('crowdsourcedAlerts', JSON.stringify(this.alerts));
      this.tempMarker.setMap(null);
      this.tempMarker = null;
      this.displayAlertsOnMap();
      this.newAlert = { type: '', description: '', location: null, votes: 0 };
      this.showReportModal = false;
    },
    cancelReport() {
      if (this.tempMarker) {
        this.tempMarker.setMap(null);
        this.tempMarker = null;
      }
      this.newAlert = { type: '', description: '', location: null, votes: 0 };
      this.showReportModal = false;
    },
    upvote(alert) {
      alert.votes++;
      localStorage.setItem('crowdsourcedAlerts', JSON.stringify(this.alerts));
    },
    downvote(alert) {
      alert.votes--;
      localStorage.setItem('crowdsourcedAlerts', JSON.stringify(this.alerts));
    },
    deleteAlert(alertId) {
      const index = this.alerts.findIndex(alert => alert.id === alertId);
      if (index !== -1 && this.alerts[index].votes === 0) {
        this.alerts.splice(index, 1);
        localStorage.setItem('crowdsourcedAlerts', JSON.stringify(this.alerts));
        // Refresh the map by clearing and re-displaying markers
        this.map = new window.google.maps.Map(document.getElementById('map'), {
          center: { lat: 37.7749, lng: -122.4194 },
          zoom: 12,
        });
        this.map.addListener('click', (event) => {
          this.pinpointLocation(event.latLng);
        });
        this.displayAlertsOnMap();
      }
    },
  },
};
</script>

<style scoped>
.crowdsourced-alerts {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}
h2 {
  color: #333;
  margin-bottom: 15px;
}
.map-container {
  margin-bottom: 20px;
}
#map {
  height: 400px;
  width: 100%;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.alert-actions {
  margin-bottom: 20px;
}
.alert-actions p {
  font-size: 14px;
  color: #555;
}
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}
.modal h3 {
  margin: 0 0 15px;
  font-size: 18px;
  color: #333;
}
.modal p {
  margin: 0 0 10px;
  font-size: 14px;
  color: #666;
}
.modal select,
.modal input {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  font-size: 14px;
}
.modal button {
  padding: 8px 15px;
  margin-right: 10px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}
.modal button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
.modal .cancel-btn {
  background-color: #ff4d4d;
}
.modal .cancel-btn:hover {
  background-color: #e60000;
}
.community-feed {
  background-color: #fff;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.community-feed h3 {
  margin: 0 0 10px;
  font-size: 16px;
  color: #555;
}
.community-feed ul {
  list-style: none;
  padding: 0;
}
.community-feed li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}
.alert-controls {
  display: flex;
  align-items: center;
  gap: 5px;
}
.community-feed .votes {
  margin: 0 10px;
}
.vote-btn {
  padding: 5px 10px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
}
.vote-btn:hover {
  background-color: #1976d2;
}
.delete-btn {
  padding: 5px 10px;
  background-color: #ff4d4d;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
}
.delete-btn:hover {
  background-color: #e60000;
}
</style>  -->

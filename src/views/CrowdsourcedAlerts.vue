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
</style>
<!-- <template>
  <div class="crowdsourced-alerts">
    <h2>Crowdsourced Delivery Alerts</h2>
    <div class="map-container">
      <div id="map"></div>
    </div>
    <div class="alert-actions">
      <button @click="showReportModal = true" class="report-btn">Report New Issue</button>
    </div>
    <div v-if="showReportModal" class="modal">
      <h3>Report an Issue</h3>
      <select v-model="newAlert.type">
        <option value="Accident">Accident</option>
        <option value="Roadwork">Roadwork</option>
        <option value="Traffic Jam">Traffic Jam</option>
        <option value="Road Closure">Road Closure</option>
        <option value="Other">Other</option>
      </select>
      <input v-model="newAlert.description" placeholder="Brief description (optional)" maxlength="100" />
      <button @click="submitReport" :disabled="!newAlert.type || isSubmitting">Submit</button>
      <button @click="showReportModal = false" class="cancel-btn">Cancel</button>
      <p v-if="locationError" class="error">{{ locationError }}</p>
    </div>
    <div class="community-feed">
      <h3>Community Alerts</h3>
      <ul>
        <li v-for="alert in alerts" :key="alert.id">
          <span>{{ alert.type }} - {{ alert.description || 'No description' }}</span>
          <span class="votes">Votes: {{ alert.votes }}</span>
          <button @click="upvote(alert)" class="vote-btn">👍</button>
          <button @click="downvote(alert)" class="vote-btn">👎</button>
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
      isSubmitting: false,
      locationError: '',
      newAlert: {
        type: '',
        description: '',
        location: null, // Will be set dynamically
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
    // Add click listener to the map
    this.map.addListener('click', (event) => {
      if (this.showReportModal) {
        this.newAlert.location = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        };
        this.locationError = `Location set to ${event.latLng.lat().toFixed(4)}, ${event.latLng.lng().toFixed(4)}`;
      }
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
    submitReport() {
    if (!this.newAlert.type) return;
    if (!this.newAlert.location) {
      this.locationError = 'Please click the map to set a location.';
      return;
    }
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
    this.displayAlertsOnMap();
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
.report-btn {
  padding: 8px 15px;
  background-color: #ff9800;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 14px;
}
.report-btn:hover {
  background-color: #f57c00;
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
.modal .error {
  color: #ff4d4d;
  font-size: 12px;
  margin-top: 10px;
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
</style> -->
<template>
    <div class="main-layout">
      <nav class="navbar">
        <router-link to="/app/route-planner" class="nav-link">Route Optimization</router-link>
        <router-link to="/app/logistics-management" class="nav-link">Logistics Management</router-link>
        <router-link to="/app/shipping-tracking" class="nav-link">Shipping Tracking</router-link>
        <router-link to="/app/crowdsourced-alerts" class="nav-link">Crowdsourced Alerts</router-link>
      </nav>
      <router-view />
    </div>
  </template>
  
  <style scoped>
  .main-layout {
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
    background-color: #4caf50;
    border-radius: 3px;
  }
  </style>
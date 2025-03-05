<template>
    <div id="home">
      <h1>Welcome to LogisticsApp</h1>
      <p>Plan smarter, greener, and faster deliveries!</p>
      <ul>
        <li><router-link to="/route-planner">Route Optimization</router-link></li>
        
      </ul>
    </div>
  </template>
  
  <script>
  export default {
    name: 'HomePage',
  };
  </script>
  
  <style>
  #home {
    text-align: center;
    padding: 20px;
  }
  ul {
    list-style-type: none;
    padding: 0;
  }
  li {
    margin: 10px 0;
  }
  </style>
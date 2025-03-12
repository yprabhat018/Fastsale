<!-- <template>
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
  </style> -->

  <template>
    <div class="main-layout">
      <nav class="navbar">
        <div class="nav-container">
          <router-link to="/app/route-planner" class="nav-link">
            <span class="nav-icon">🗺️</span>
            <span class="nav-text">Route Optimization</span>
          </router-link>
          <router-link to="/app/logistics-management" class="nav-link">
            <span class="nav-icon">📦</span>
            <span class="nav-text">Logistics Management</span>
          </router-link>
          <router-link to="/app/shipping-tracking" class="nav-link">
            <span class="nav-icon">🚚</span>
            <span class="nav-text">Shipping Tracking</span>
          </router-link>
          <router-link to="/app/crowdsourced-alerts" class="nav-link">
            <span class="nav-icon">🔔</span>
            <span class="nav-text">Crowdsourced Alerts</span>
          </router-link>
        </div>
        <div class="nav-indicator"></div>
      </nav>
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </template>
  
  <script>
  export default {
    mounted() {
      this.setupNavIndicator();
      window.addEventListener('resize', this.setupNavIndicator);
    },
    beforeUnmount() {
      window.removeEventListener('resize', this.setupNavIndicator);
    },
    methods: {
      setupNavIndicator() {
        const navLinks = document.querySelectorAll('.nav-link');
        const indicator = document.querySelector('.nav-indicator');
        
        function updateIndicator(el) {
          indicator.style.width = `${el.offsetWidth}px`;
          indicator.style.left = `${el.offsetLeft}px`;
        }
        
        navLinks.forEach(link => {
          link.addEventListener('mouseenter', () => {
            updateIndicator(link);
          });
          
          if (link.classList.contains('router-link-active')) {
            updateIndicator(link);
          }
        });
        
        const navbar = document.querySelector('.navbar');
        navbar.addEventListener('mouseleave', () => {
          const activeLink = document.querySelector('.router-link-active');
          if (activeLink) {
            updateIndicator(activeLink);
          }
        });
      }
    }
  }
  </script>
  
  <style scoped>
  .main-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #f5f7fa;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  
  .navbar {
    background: linear-gradient(to right, #2c3e50, #4ca1af);
    padding: 12px 20px;
    position: relative;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 100;
  }
  
  .nav-container {
    display: flex;
    justify-content: space-around;
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
  }
  
  .nav-link {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    font-size: 16px;
    font-weight: 500;
    padding: 10px 16px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  
  .nav-icon {
    margin-right: 8px;
    font-size: 18px;
    opacity: 0.9;
  }
  
  .nav-link:hover {
    color: white;
    transform: translateY(-2px);
  }
  
  .nav-link::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background-color: white;
    transition: all 0.3s ease;
    transform: translateX(-50%);
  }
  
  .nav-link:hover::after {
    width: 70%;
  }
  
  .router-link-active {
    color: white;
    background-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }
  
  .router-link-active::after {
    width: 70%;
  }
  
  .nav-indicator {
    position: absolute;
    bottom: 0;
    height: 3px;
    background-color: #4caf50;
    border-radius: 3px 3px 0 0;
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  }
  
  /* Page transition animations */
  .page-fade-enter-active,
  .page-fade-leave-active {
    transition: opacity 0.3s, transform 0.3s;
  }
  
  .page-fade-enter-from,
  .page-fade-leave-to {
    opacity: 0;
    transform: translateY(10px);
  }
  
  /* Add responsive styles */
  @media (max-width: 768px) {
    .nav-container {
      flex-direction: column;
      align-items: center;
    }
    
    .nav-link {
      margin: 5px 0;
      width: 100%;
      text-align: center;
      justify-content: center;
    }
    
    .nav-indicator {
      display: none;
    }
  }
  </style>
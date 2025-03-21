

  <template>
    <div class="main-layout">
      <nav class="navbar">
        <div class="nav-brand">
          <span class="brand-icon">🚚</span>
          <span class="brand-name">LogiTrack</span>
        </div>
        
        <div class="nav-links" :class="{ 'active': menuOpen }">
          <router-link to="/app/route-planner" class="nav-link" v-slot="{ isActive }">
            <div class="link-content">
              <i class="nav-icon">📍</i>
              <span :class="{ 'active': isActive }">Route Optimization</span>
            </div>
          </router-link>
          <router-link to="/app/logistics-management" class="nav-link" v-slot="{ isActive }">
            <div class="link-content">
              <i class="nav-icon">📦</i>
              <span :class="{ 'active': isActive }">Logistics Management</span>
            </div>
          </router-link>
          <router-link to="/app/shipping-tracking" class="nav-link" v-slot="{ isActive }">
            <div class="link-content">
              <i class="nav-icon">🔍</i>
              <span :class="{ 'active': isActive }">Shipping Tracking</span>
            </div>
          </router-link>
          <router-link to="/app/crowdsourced-alerts" class="nav-link" v-slot="{ isActive }">
            <div class="link-content">
              <i class="nav-icon">🔔</i>
              <span :class="{ 'active': isActive }">Crowdsourced Alerts</span>
            </div>
          </router-link>
        </div>
        
        <div class="nav-actions">
          <button @click="logout" class="logout-btn">
            <span class="btn-text">Log Out</span>
            <i class="btn-icon">→</i>
          </button>
          <button class="menu-toggle" @click="toggleMenu">
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
          </button>
        </div>
      </nav>
      
      <main class="content">
        <transition name="fade" mode="out-in">
          <router-view />
        </transition>
      </main>
      
      <footer class="app-footer">
        <p>© 2025 LogiTrack - Smart Logistics Solutions</p>
      </footer>
    </div>
  </template>
  
  <script>
  import firebase from 'firebase/compat/app';
  import 'firebase/compat/auth';
  
  export default {
    name: 'MainLayout',
    data() {
      return {
        menuOpen: false
      };
    },
    methods: {
      toggleMenu() {
        this.menuOpen = !this.menuOpen;
      },
      logout() {
        // Add a small visual feedback before actual logout
        const logoutBtn = document.querySelector('.logout-btn');
        logoutBtn.classList.add('logging-out');
        
        setTimeout(() => {
          firebase.auth().signOut()
            .then(() => {
              this.$router.push('/login'); // Redirect to login page
              console.log('Logged out successfully');
            })
            .catch(err => {
              console.error('Logout error:', err);
              // Remove animation class if error
              logoutBtn.classList.remove('logging-out');
            });
        }, 300);
      },
      async postAlert(alertData) {
        try {
          await firebase.firestore().collection('alerts').add({
            ...alertData, // Spread the alert data (type, location, etc.)
            timestamp: firebase.firestore.FieldValue.serverTimestamp(), // Auto timestamp
          });
          console.log('Alert posted to public collection!');
        } catch (err) {
          console.error('Error posting alert:', err);
        }
      },
    },
    created() {
      // Close mobile menu when route changes
      this.$router.afterEach(() => {
        this.menuOpen = false;
      });
      
      // Close mobile menu when clicking outside
      document.addEventListener('click', (e) => {
        const navbar = document.querySelector('.navbar');
        const menuToggle = document.querySelector('.menu-toggle');
        
        if (this.menuOpen && !navbar.contains(e.target) || menuToggle.contains(e.target)) {
          return;
        }
        
        if (this.menuOpen) {
          this.menuOpen = false;
        }
      });
    }
  };
  </script>
  
  <style scoped>
  /* Base Styles */
  .main-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #f8f9fa;
    font-family: 'Arial', sans-serif;
  }
  
  /* Navbar Styles */
  .navbar {
    background: linear-gradient(135deg, #2c3e50, #1a252f);
    padding: 0.75rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
    transition: all 0.3s ease;
  }
  
  .nav-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: white;
    cursor: pointer;
    transition: transform 0.3s ease;
  }
  
  .nav-brand:hover {
    transform: scale(1.05);
  }
  
  .brand-icon {
    font-size: 1.5rem;
  }
  
  .brand-name {
    font-weight: bold;
    font-size: 1.25rem;
    letter-spacing: 0.5px;
  }
  
  .nav-links {
    display: flex;
    gap: 1rem;
    align-items: center;
    transition: all 0.3s ease;
  }
  
  .nav-link {
    color: rgba(255, 255, 255, 0.85);
    text-decoration: none;
    font-size: 1rem;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: all 0.3s ease;
    position: relative;
  }
  
  .link-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .nav-icon {
    font-size: 1.2rem;
  }
  
  .nav-link:hover {
    color: white;
    background-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }
  
  .nav-link span.active {
    color: white;
    font-weight: bold;
  }
  
  .nav-link::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background-color: #4caf50;
    transition: all 0.3s ease;
    transform: translateX(-50%);
  }
  
  .nav-link:hover::after,
  .nav-link span.active + .nav-link::after {
    width: 70%;
  }
  
  .nav-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .logout-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: #e74c3c;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  .logout-btn:hover {
    background-color: #c0392b;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  .btn-icon {
    font-size: 1rem;
    transition: transform 0.3s ease;
  }
  
  .logout-btn:hover .btn-icon {
    transform: translateX(3px);
  }
  
  .logging-out {
    opacity: 0.7;
    pointer-events: none;
    transform: scale(0.95);
  }
  
  /* Menu Toggle (for mobile) */
  .menu-toggle {
    display: none;
    flex-direction: column;
    justify-content: space-between;
    width: 30px;
    height: 21px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
  }
  
  .bar {
    display: block;
    width: 100%;
    height: 3px;
    background-color: white;
    border-radius: 3px;
    transition: all 0.3s ease;
  }
  
  /* Content Area */
  .content {
    flex: 1;
    padding: 2rem;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
  }
  
  /* Footer */
  .app-footer {
    background-color: #2c3e50;
    color: white;
    text-align: center;
    padding: 1rem;
    margin-top: auto;
    font-size: 0.9rem;
  }
  
  /* Animations */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s, transform 0.3s;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
    transform: translateY(10px);
  }
  
  /* Responsive Design */
  @media (max-width: 768px) {
    .navbar {
      padding: 0.75rem 1rem;
    }
    
    .menu-toggle {
      display: flex;
    }
    
    .nav-links {
      position: fixed;
      top: 60px;
      left: 0;
      right: 0;
      flex-direction: column;
      background-color: #2c3e50;
      padding: 1rem;
      gap: 0.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      clip-path: polygon(0 0, 100% 0, 100% 0, 0 0);
      opacity: 0;
      pointer-events: none;
      transition: all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
    }
    
    .nav-links.active {
      clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
      opacity: 1;
      pointer-events: auto;
    }
    
    .nav-link {
      width: 100%;
      padding: 0.75rem;
    }
    
    .nav-link::after {
      display: none;
    }
    
    .link-content {
      justify-content: flex-start;
    }
    
    .content {
      padding: 1rem;
    }
    
    /* Animate hamburger menu */
    .menuOpen .bar:nth-child(1) {
      transform: translateY(9px) rotate(45deg);
    }
    
    .menuOpen .bar:nth-child(2) {
      opacity: 0;
    }
    
    .menuOpen .bar:nth-child(3) {
      transform: translateY(-9px) rotate(-45deg);
    }
  }
  </style>

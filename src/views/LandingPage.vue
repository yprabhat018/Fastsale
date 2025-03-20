
<template>
  <div class="landing-page">
    <div class="map-background">
      <div class="route-animation"></div>
      <div class="vehicle-animation"></div>
      <div class="pin-container">
        <div class="map-pin pin1"></div>
        <div class="map-pin pin2"></div>
        <div class="map-pin pin3"></div>
      </div>
      <div class="dots-overlay"></div>
    </div>
    
    <header>
      <div class="logo-container">
        <div class="logo-icon">
          <i class="fas fa-truck-loading"></i>
        </div>
        <h1>Logistics <span>Master</span></h1>
      </div>
      <p class="tagline">Streamline Your Shipping, Master Your Routes</p>
      <div class="header-cta">
        <button @click="scrollToFeatures" class="scroll-btn">Discover How</button>
      </div>
    </header>
    
    <section ref="features" class="features">
      <h2>What We Offer</h2>
      <div class="feature-grid">
        <div class="feature-card" v-for="(feature, index) in features" :key="index" :style="{ '--index': index }">
          <div class="feature-icon">
            <i :class="feature.icon"></i>
          </div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </div>
      </div>
    </section>
    
    <section class="stats">
      <h2>Our Impact</h2>
      <div class="stats-grid">
        <div class="stat-item" v-for="(stat, index) in stats" :key="index">
          <div class="stat-circle">
            <svg viewBox="0 0 36 36">
              <path class="stat-circle-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path class="stat-circle-fill"
                :stroke-dasharray="`${stat.percentage}, 100`"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div class="stat-text">{{ stat.value }}</div>
          </div>
          <p>{{ stat.label }}</p>
        </div>
      </div>
    </section>
    
    <section class="customers">
  <h2>Trusted By</h2>
  <div class="logo-slider">
    <div class="logo-slide">
      <div class="customer-logo" v-for="i in 6" :key="i">
        <div class="placeholder-logo">Client {{ i }}</div>
      </div>
    </div>
    <div class="logo-slide">
      <div class="customer-logo" v-for="i in 5" :key="i + 6"> <!-- Changed from `i + 5` to `i + 6` -->
        <div class="placeholder-logo">Client {{ i + 6 }}</div>
      </div>
    </div>
  </div>
</section>
    
    <section class="cta">
      <div class="cta-content">
        <h2>Ready to Transform Your Logistics?</h2>
        <p>Join thousands of companies optimizing their supply chain with Logistics Master</p>
        <button @click="getStarted" class="start-btn">Get Started</button>
      </div>
      <div class="cta-shape"></div>
    </section>
    
    <footer>
      <div class="footer-content">
        <div class="footer-section">
          <h3>Logistics Master</h3>
          <p>Streamlining global supply chains since 2023</p>
        </div>
        <div class="footer-section">
          <h3>Contact Us</h3>
          <p>info@logisticsmaster.com</p>
          <p>1-800-LOGISTICS</p>
        </div>
        <div class="footer-section">
          <h3>Follow Us</h3>
          <div class="social-icons">
            <i class="fab fa-linkedin"></i>
            <i class="fab fa-twitter"></i>
            <i class="fab fa-facebook"></i>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>Built with 💪 by Team Thinksync 2025</p>
        <p>© 2025 Logistics Master. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'LandingPage',
  data() {
    return {
      features: [
        { 
          title: 'Route Optimization', 
          description: 'AI-powered algorithms find the fastest routes with real-time traffic data, reducing fuel costs by up to 20%.',
          icon: 'fas fa-route'
        },
        { 
          title: 'Logistics Management', 
          description: 'Centralized platform for managing drivers, vehicles, and inventory with intuitive dashboards.',
          icon: 'fas fa-tasks'
        },
        { 
          title: 'Shipment Tracking', 
          description: 'Real-time GPS tracking with accurate ETAs, keeping you and your customers informed at every step.',
          icon: 'fas fa-truck'
        },
        { 
          title: 'Crowdsourced Alerts', 
          description: 'Community-driven road updates, weather conditions, and delivery constraints in real-time.',
          icon: 'fas fa-bell'
        },
        { 
          title: 'Analytics Dashboard', 
          description: 'Comprehensive data visualization and insights to optimize your logistics operations.',
          icon: 'fas fa-chart-line'
        },
        { 
          title: 'Smart Warehousing', 
          description: 'Intelligent inventory management and warehouse optimization tools.',
          icon: 'fas fa-warehouse'
        },
      ],
      stats: [
        { value: '20%', percentage: 20, label: 'Fuel Cost Savings' },
        { value: '15%', percentage: 15, label: 'Faster Deliveries' },
        { value: '30%', percentage: 30, label: 'Reduced Planning Time' },
        { value: '100+', percentage: 75, label: 'Driver Alerts Daily' },
      ]
    };
  },
  mounted() {
    window.addEventListener('scroll', this.animateOnScroll);
    this.initializeStatsAnimation();
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.animateOnScroll);
  },
  methods: {
    getStarted() {
      // Safe routing with error handling
      if (this.$router) {
        this.$router.push('/app').catch(err => {
          console.error('Routing error:', err);
        });
      } else {
        console.error('Router not available! Check router setup in main.js');
      }
    },
    scrollToFeatures() {
      this.$refs.features.scrollIntoView({ behavior: 'smooth' });
    },
    animateOnScroll() {
      const elements = document.querySelectorAll('.animate-on-scroll');
      elements.forEach(element => {
        const position = element.getBoundingClientRect();
        
        // If element is in viewport
        if(position.top < window.innerHeight && position.bottom >= 0) {
          element.classList.add('animated');
        }
      });
    },
    initializeStatsAnimation() {
      // Add animation to stat circles when they come into view
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
          }
        });
      }, { threshold: 0.1 });
      
      const statCircles = document.querySelectorAll('.stat-circle');
      statCircles.forEach(circle => {
        observer.observe(circle);
      });
    }
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Poppins:wght@300;400;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

:root {
  --primary-color: #2563eb;
  --secondary-color: #0284c7;
  --accent-color: #4ade80;
  --dark-color: #172554;
  --light-color: #f8fafc;
  --shadow: 0 10px 30px -10px rgba(2, 12, 27, 0.7);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.landing-page {
  min-height: 100vh;
  position: relative;
  font-family: 'Poppins', sans-serif;
  overflow-x: hidden;
  color: #334155;
}

/* Map Background with Overlay */
.map-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('https://images.unsplash.com/photo-1562504208-03d85cc8c23e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D') no-repeat center center;
  background-size: cover;
  opacity: 0.8;
  z-index: 0;
}

.dots-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(var(--dark-color) 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.1;
}

/* Animated Route Lines */
.route-animation {
  position: absolute;
  top: 20%;
  left: 10%;
  width: 80%;
  height: 60%;
  border: 2px dashed var(--accent-color);
  border-radius: 50%;
  animation: drawRoute 12s linear infinite;
  opacity: 0.5;
}

.vehicle-animation {
  position: absolute;
  width: 20px;
  height: 20px;
  background-color: var(--primary-color);
  border-radius: 50%;
  top: calc(20% + 30%);
  left: 10%;
  animation: moveVehicle 12s linear infinite;
  z-index: 2;
}

.pin-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.map-pin {
  position: absolute;
  width: 15px;
  height: 15px;
  background-color: var(--accent-color);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.7);
  animation: pinPulse 2s infinite;
}

.pin1 {
  top: 30%;
  left: 20%;
}

.pin2 {
  top: 60%;
  left: 70%;
  animation-delay: 0.7s;
}

.pin3 {
  top: 40%;
  left: 85%;
  animation-delay: 1.4s;
}

@keyframes drawRoute {
  0% { clip-path: inset(0 100% 0 0); opacity: 0.9; }
  50% { clip-path: inset(0 0 0 0); opacity: 0.6; }
  100% { clip-path: inset(0 0 0 100%); opacity: 0.9; }
}

@keyframes moveVehicle {
  0% { 
    transform: translate(0, 0) scale(1); 
    box-shadow: 0 0 10px var(--primary-color);
  }
  25% { 
    transform: translate(20vw, -10vh) scale(1.2); 
    box-shadow: 0 0 15px var(--primary-color);
  }
  50% { 
    transform: translate(40vw, 0vh) scale(1); 
    box-shadow: 0 0 10px var(--primary-color);
  }
  75% { 
    transform: translate(60vw, 15vh) scale(1.2); 
    box-shadow: 0 0 15px var(--primary-color);
  }
  100% { 
    transform: translate(80vw, 0) scale(1); 
    box-shadow: 0 0 10px var(--primary-color);
  }
}

@keyframes pinPulse {
  0% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.4); opacity: 1; }
  100% { transform: scale(1); opacity: 0.7; }
}

/* Header Styles */
header {
  padding: 60px 20px;
  position: relative;
  z-index: 1;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  backdrop-filter: blur(5px);
  text-align: center;
  clip-path: polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%);
  padding-bottom: 120px;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  animation: fadeInDown 1s ease-out;
}

.logo-icon {
  font-size: 40px;
  color: var(--primary-color);
  margin-right: 15px;
  animation: bounceIn 1.5s both;
}

h1 {
  font-size: 48px;
  font-weight: 700;
  font-family: 'Montserrat', sans-serif;
  color: var(--dark-color);
  letter-spacing: -1px;
}

h1 span {
  color: var(--primary-color);
  position: relative;
}

h1 span::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -5px;
  width: 100%;
  height: 3px;
  background-color: var(--accent-color);
  animation: widthExpand 1.5s ease-out;
}

.tagline {
  font-size: 22px;
  color: #475569;
  margin-bottom: 40px;
  animation: fadeIn 1.5s ease-in;
  font-weight: 300;
}

.header-cta {
  margin-top: 30px;
  animation: fadeInUp 1.5s ease-out;
}

.scroll-btn {
  padding: 12px 30px;
  background-color: transparent;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
  border-radius: 30px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.scroll-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 100%;
  background-color: var(--primary-color);
  transition: width 0.3s ease;
  z-index: -1;
}

.scroll-btn:hover {
  color: white;
}

.scroll-btn:hover::before {
  width: 100%;
}

/* Features Section */
.features {
  padding: 80px 20px;
  position: relative;
  z-index: 1;
  background-color: rgba(255, 255, 255, 0.9);
}

h2 {
  font-size: 36px;
  color: var(--dark-color);
  margin-bottom: 50px;
  text-align: center;
  font-family: 'Montserrat', sans-serif;
  position: relative;
  display: inline-block;
  left: 50%;
  transform: translateX(-50%);
}

h2::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 60px;
  height: 4px;
  background-color: var(--accent-color);
  transition: width 0.3s;
  left: 50%;
  transform: translateX(-50%);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transform: translateY(30px);
  animation: slideUp 0.6s ease-out forwards;
  animation-delay: calc(0.15s * var(--index));
  transition: all 0.4s ease-out;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 0;
  background-color: var(--primary-color);
  transition: height 0.3s ease;
  z-index: -1;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.feature-card:hover::before {
  height: 100%;
}

.feature-icon {
  font-size: 36px;
  color: var(--primary-color);
  margin-bottom: 20px;
  transition: transform 0.3s;
}

.feature-card:hover .feature-icon {
  transform: scale(1.2);
  color: var(--secondary-color);
}

.feature-card h3 {
  font-size: 22px;
  color: var(--dark-color);
  margin-bottom: 15px;
  position: relative;
  padding-bottom: 10px;
  font-family: 'Montserrat', sans-serif;
}

.feature-card h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 3px;
  background-color: var(--accent-color);
  transition: width 0.3s;
}

.feature-card:hover h3::after {
  width: 60px;
}

.feature-card p {
  font-size: 16px;
  color: #64748b;
  line-height: 1.6;
}

/* Stats Section */
.stats {
  padding: 80px 20px;
  position: relative;
  z-index: 1;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  clip-path: polygon(0 15%, 50% 0, 100% 15%, 100% 85%, 50% 100%, 0 85%);
  padding-top: 120px;
  padding-bottom: 120px;
  margin: 80px 0;
}

.stats h2 {
  color: white;
  margin-bottom: 60px;
}

.stats h2::after {
  background-color: white;
}

.stats-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.stat-item {
  text-align: center;
  flex: 1;
  min-width: 200px;
  max-width: 250px;
  opacity: 0;
  transform: translateY(30px);
  animation: slideUp 0.6s ease-out forwards;
  animation-delay: calc(0.15s * var(--index));
}

.stat-circle {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
}

.stat-circle svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.stat-circle-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.2);
  stroke-width: 2.5;
}

.stat-circle-fill {
  fill: none;
  stroke: white;
  stroke-width: 2.5;
  stroke-linecap: round;
  transition: stroke-dasharray 1.5s ease-out;
}

.stat-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  font-weight: 700;
  color: white;
}

.stat-item p {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 300;
}

.stat-circle.animated .stat-circle-fill {
  animation: circleProgress 1.5s ease-out forwards;
}

/* Customer Section */
.customers {
  padding: 80px 20px;
  position: relative;
  z-index: 1;
  background-color: rgba(255, 255, 255, 0.9);
  text-align:left;

}

.logo-slider {
  display: flex;
  overflow: hidden;
  margin-top: 40px;
  max-width: 1200px;
  margin: 40px auto 0;
}

.logo-slide {
  display: flex;
  animation: slideLeft 20s linear infinite;
  padding-right: 50px;
}

.customer-logo {
  flex: 0 0 200px;
  height: 100px;
  margin: 0 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-logo {
  width: 150px;
  height: 70px;
  background-color: rgba(37, 99, 235, 0.1);
  border: 1px solid rgba(37, 99, 235, 0.2);
  border-radius: 5px;
  /* align-content: space-evenly; */
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  font-weight: 600;
  transition: all -3s;
}

.placeholder-logo:hover {
  background-color: rgba(37, 99, 235, 0.2);
  transform: scale(1.05);
}

@keyframes slideLeft {
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
}

/* CTA Section */
.cta {
  padding: 80px 20px;
  position: relative;
  z-index: 1;
  background-color: #f1f5f9;
  text-align: center;
  overflow: hidden;
}

.cta-content {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.cta h2 {
  color: var(--dark-color);
  margin-bottom: 20px;
}

.cta p {
  font-size: 18px;
  color: #64748b;
  margin-bottom: 40px;
}

.cta-shape {
  position: absolute;
  width: 600px;
  height: 600px;
  background: linear-gradient(135deg, var(--accent-color) 0%, rgba(74, 222, 128, 0.2) 100%);
  border-radius: 50%;
  top: -300px;
  right: -300px;
  z-index: 0;
  opacity: 0.5;
}

.start-btn {
  padding: 15px 40px;
  font-size: 18px;
  background: var(--primary-color);
  color: rgb(19, 16, 16);
  border: none;
  border-radius: 30px;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.4);
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.start-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.662), transparent); 
  transition: all 0.6s;
  z-index: -1;
}

.start-btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(6, 56, 158, 0.496);
}

.start-btn:hover::before {
  left: 100%;
}

/* Footer */
footer {
  padding: 60px 20px 30px;
  background-color: var(--dark-color);
  color: white;
  position: relative;
  z-index: 1;
}

.footer-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto 40px;
  gap: 30px;
}

.footer-section {
  flex: 1;
  min-width: 250px;
}

.footer-section h3 {
  font-size: 20px;
  margin-bottom: 20px;
  position: relative;
  padding-bottom: 10px;
}

.footer-section h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 30px;
  height: 3px;
  background-color: var(--accent-color);
}

.footer-section p {
  margin-bottom: 10px;
  font-size: 14px;
  color: #cbd5e1;
}

.social-icons {
  display: flex;
  gap: 15px;
  margin-top: 15px;
}

.social-icons i {
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.social-icons i:hover {
  color: var(--accent-color);
  transform: translateY(-3px);
}

.footer-bottom {
  text-align: center;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  max-width: 1200px;
  margin: 0 auto;
}

.footer-bottom p {
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 10px;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes bounceIn {
  0% { transform: scale(0.1); opacity: 0; }
  60% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); }
}

@keyframes widthExpand {
  from { width: 0; }
  to { width: 100%; }
}

@keyframes circleProgress {
  from { stroke-dasharray: 0, 100; }
}

/* Responsive Design */
@media (max-width: 768px) {
  h1 {
    font-size: 36px;
  }
  
  .tagline {
    font-size: 18px;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    flex-direction: column;
    align-items: center;
  }
  
  .footer-content {
    flex-direction: column;
  }
}

/* Additional Animations */
.animate-on-scroll {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s ease-out;
}

.animate-on-scroll.animated {
  opacity: 1;
  transform: translateY(0);
}
</style>

<!-- <template>
  <div class="landing-page">
    <div class="map-background">
      <div class="route-animation"></div>
    </div>
    <header>
      <h1>Logistics Master</h1>
      <p class="tagline">Streamline Your Shipping, Master Your Routes</p>
    </header>
    <section class="features">
      <h2>What We Offer</h2>
      <div class="feature-grid">
        <div class="feature-card" v-for="(feature, index) in features" :key="index" :style="{ '--index': index }">
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </div>
      </div>
    </section>
    <section class="stats">
      <h2>Our Impact</h2>
      <div class="stats-grid">
        <div class="stat-item">
          <h3>20%</h3>
          <p>Fuel Cost Savings</p>
        </div>
        <div class="stat-item">
          <h3>15%</h3>
          <p>Faster Deliveries</p>
        </div>
        <div class="stat-item">
          <h3>100+</h3>
          <p>Driver Alerts</p>
        </div>
      </div>
    </section>
    <section class="cta">
      <button @click="getStarted" class="start-btn">Get Started</button>
    </section>
    <footer>
      <p>Built with 💪 by Team xAI | Hackathon 2025</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'LandingPage',
  data() {
    return {
      features: [
        { title: 'Route Optimization', description: 'Fastest routes with real-time traffic data.' },
        { title: 'Logistics Management', description: 'Manage drivers and inventory easily.' },
        { title: 'Shipping Tracking', description: 'Live tracking with accurate ETAs.' },
        { title: 'Crowdsourced Alerts', description: 'Community-driven road updates.' },
      ],
    };
  },
  methods: {
    getStarted() {
      // Safe routing with error handling
      if (this.$router) {
        this.$router.push('/app').catch(err => {
          console.error('Routing error:', err);
        });
      } else {
        console.error('Router not available! Check router setup in main.js');
      }
    },
  },
};
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  position: relative;
  padding: 20px;
  text-align: center;
  font-family: 'Arial', sans-serif;
  background: linear-gradient(135deg, rgba(240, 248, 255, 0.9), rgba(224, 240, 224, 0.9));
  overflow: hidden;
}

/* Map Background with Your Image */
.map-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* Replace with your image path or URL */
  /* background: url('"C:\Users\sandh\logistics-app\marjan-blan-6bXvYyAYVrE-unsplash.jpg"') no-repeat center center; */
  /* For testing: uncomment this if you don’t have an image yet */
  background: url('https://images.unsplash.com/photo-1562504208-03d85cc8c23e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D') no-repeat center center;
  background-size: cover;
  opacity: 1; /* Adjust for readability */
  z-index: 0;
}

/* Animated Route Line */
.route-animation {
  position: absolute;
  top: 20%;
  left: 10%;
  width: 80%;
  height: 60%;
  background: transparent;
  border: 2px dashed #4caf50;
  border-radius: 50%;
  animation: drawRoute 8s linear infinite;
}

@keyframes drawRoute {
  0% { clip-path: inset(0 100% 0 0); }
  50% { clip-path: inset(0 0 0 0); }
  100% { clip-path: inset(0 0 0 100%); }
}

header {
  padding: 40px 20px;
  animation: fadeIn 1s ease-in;
  position: relative;
  z-index: 1;
}

h1 {
  font-size: 48px;
  color: #333;
  font-weight: 700;
}

.tagline {
  font-size: 20px;
  color: #555;
  animation: fadeIn 1.5s ease-in;
}

.features {
  padding: 40px 20px;
  position: relative;
  z-index: 1;
}

h2 {
  font-size: 32px;
  color: #333;
  margin-bottom: 30px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transform: translateY(30px);
  animation: slideUp 0.6s ease-out forwards;
  animation-delay: calc(0.15s * var(--index));
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: scale(1.05) translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}

.feature-card h3 {
  font-size: 22px;
  color: #007bff;
}

.feature-card p {
  font-size: 16px;
  color: #666;
}

.stats {
  padding: 40px 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  max-width: 1200px;
  margin: 20px auto;
  position: relative;
  z-index: 1;
  opacity: 0.5;
}

.stats-grid {
  display: flex;
  justify-content: space-around;
  gap: 20px;
}

.stat-item h3 {
  font-size: 36px;
  color: #4caf50;
}

.stat-item p {
  font-size: 16px;
  color: #555;
}

.cta {
  padding: 40px 20px;
  position: relative;
  z-index: 1;
}

.start-btn {
  padding: 15px 40px;
  font-size: 20px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
  animation: pulse 2s infinite;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.start-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}

footer {
  padding: 20px;
  font-size: 14px;
  color: #777;
  position: relative;
  z-index: 1;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
</style> -->
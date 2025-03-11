
import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '@/views/LandingPage.vue';
import RoutePlanner from '@/views/RoutePlanner.vue';
import LogisticsManagement from '@/views/LogisticsManagement.vue';
import ShippingTracking from '@/views/ShippingTracking.vue';
import CrowdsourcedAlerts from '@/views/CrowdsourcedAlerts.vue';

const routes = [
  { path: '/', name: 'LandingPage', component: LandingPage },
  {
    path: '/app',
    component: () => import('@/layouts/MainLayout.vue'), // We'll create this
    children: [
      { path: '', redirect: '/app/route-planner' },
      { path: 'route-planner', name: 'RoutePlanner', component: RoutePlanner },
      { path: 'logistics-management', name: 'LogisticsManagement', component: LogisticsManagement },
      { path: 'shipping-tracking', name: 'ShippingTracking', component: ShippingTracking },
      { path: 'crowdsourced-alerts', name: 'CrowdsourcedAlerts', component: CrowdsourcedAlerts },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
// import { createRouter, createWebHistory } from 'vue-router';
// import RoutePlanner from '@/views/RoutePlanner.vue';
// import LogisticsManagement from '@/views/LogisticsManagement.vue';
// import ShippingTracking from '@/views/ShippingTracking.vue';
// import CrowdsourcedAlerts from '@/views/CrowdsourcedAlerts.vue';

// const routes = [
//   { path: '/', redirect: '/route-planner' },
//   { path: '/route-planner', name: 'RoutePlanner', component: RoutePlanner },
//   { path: '/logistics-management', name: 'LogisticsManagement', component: LogisticsManagement },
//   { path: '/shipping-tracking', name: 'ShippingTracking', component: ShippingTracking },
//   { path: '/crowdsourced-alerts', name: 'CrowdsourcedAlerts', component: CrowdsourcedAlerts },
// ];

// const router = createRouter({
//   history: createWebHistory(),
//   routes,
// });

// export default router;
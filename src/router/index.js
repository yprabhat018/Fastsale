import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import RoutePlanner from '../views/RoutePlanner.vue';

const routes = [
    {
      path: '/',
      name: 'HomePage', // Changed from 'Home'
      component: HomePage,
    },
    {
      path: '/route-planner',
      name: 'RoutePlanner',
      component: RoutePlanner,
    },
  ];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
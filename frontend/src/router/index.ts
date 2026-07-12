import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import ErrorLabPage from '../pages/ErrorLabPage.vue'
import TrackingLabPage from '../pages/TrackingLabPage.vue'
import PerformanceLabPage from '../pages/PerformanceLabPage.vue'
import EventCenterPage from '../pages/EventCenterPage.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/errors', name: 'errors', component: ErrorLabPage },
    { path: '/tracking', name: 'tracking', component: TrackingLabPage },
    { path: '/performance', name: 'performance', component: PerformanceLabPage },
    { path: '/events', name: 'events', component: EventCenterPage },
  ],
})

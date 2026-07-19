import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import StudyStagePage from '../pages/StudyStagePage.vue'
import ErrorLabPage from '../pages/ErrorLabPage.vue'
import TrackingLabPage from '../pages/TrackingLabPage.vue'
import VisualTrackingPage from '../pages/VisualTrackingPage.vue'
import PerformanceLabPage from '../pages/PerformanceLabPage.vue'
import EventCenterPage from '../pages/EventCenterPage.vue'
import DashboardPage from '../pages/DashboardPage.vue'
import ReplayDetailPage from '../pages/ReplayDetailPage.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/dashboard', name: 'dashboard', component: DashboardPage },
    { path: '/replays/:replayId', name: 'replay-detail', component: ReplayDetailPage },
    { path: '/study/:stageId', name: 'study-stage', component: StudyStagePage },
    { path: '/errors', name: 'errors', component: ErrorLabPage },
    { path: '/tracking', name: 'tracking', component: TrackingLabPage },
    { path: '/visual-tracking', name: 'visual-tracking', component: VisualTrackingPage },
    { path: '/performance', name: 'performance', component: PerformanceLabPage },
    { path: '/events', name: 'events', component: EventCenterPage },
  ],
})

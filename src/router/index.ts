import { createRouter, createWebHistory } from 'vue-router';
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home/Home.vue'),
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('@/views/Admin/Admin.vue'),
    },
  ],
});

export default router;

import { createRouter, createWebHistory } from 'vue-router';
import ProductList from '@/pages/product-list/ProductList.vue';
import ProductDetails from '@/pages/product-details/ProductDetails.vue';
import Checkout from '@/pages/checkout/Checkout.vue';
import Registeration from '@/pages/registeration/Registeration.vue';
import Login from '@/pages/login/Login.vue';
import { useAuthenticationStore } from '@/stores/AuthenticationStore';

const routes = [
    { path: '/', name: 'home', component: Login },
    { path: '/pages/product-list', name: 'product-list', component: ProductList },
    { path: '/pages/checkout', name: 'checkout', component: Checkout },
    { path: '/pages/product-details', name: 'product-details', component: ProductDetails },
    { path: '/pages/registeration', name: 'registeration', component: Registeration },
    { path: '/pages/login', name: 'login', component: Login },
    {
        path: '/:pathMatch(.*)*', // Redirect back to home page anything that doesn't match above (Catch-all 404s)
        redirect: '/',           
    },
];

// Create and export the router instance
const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to) => {
    const authenticationStore = useAuthenticationStore()

    // Guard from accessing product pages without logging in
    let isLoggedIn = authenticationStore.getLoginStatus
    if (!isLoggedIn && to.name !== 'login' && to.name !== 'registeration') {
        return { name: 'login' }
    }
    
    // Guard from going to login/registeration when already logged in
    if (isLoggedIn && (to.name == 'login' || to.name == 'registeration' || to.name == 'home')) {
        return { name: 'product-list' }
    }
})

export default router;
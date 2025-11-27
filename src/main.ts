import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia } from 'pinia'
import App from './App.vue';
import ProductList from './pages/product-list/ProductList.vue';
import Checkout from './pages/checkout/Checkout.vue';
import ProductDetails from './pages/product-details/ProductDetails.vue';
import Registeration from './pages/registeration/Registeration.vue';
import Login from './pages/login/Login.vue';
import { useAuthenticationStore } from './stores/AuthenticationStore';

// FIREBASE SDK --------------------------------------------------------
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
    apiKey: "AIzaSyBiyTX_J38e7gsVzLyJ6sJy9UnGN33jkLk",
    authDomain: "vue-js-shopping-cart-exercise.firebaseapp.com",
    projectId: "vue-js-shopping-cart-exercise",
    storageBucket: "vue-js-shopping-cart-exercise.firebasestorage.app",
    messagingSenderId: "198304031528",
    appId: "1:198304031528:web:97dda7bfa0983520e9e61d",
    measurementId: "G-6KPGK841LK"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const database = getFirestore(firebaseApp);

export { firebaseApp, database }
// ---------------------------------------------------------------------

const routes = [
	{ path: '/', name: 'home', component: Login },
	{ path: '/pages/product-list', name: 'product-list', component: ProductList },
	{ path: '/pages/checkout', name: 'checkout', component: Checkout },
	{ path: '/pages/product-details', name: 'product-details', component: ProductDetails },
    { path: '/pages/registeration', name: 'registeration', component: Registeration },
    { path: '/pages/login', name: 'login', component: Login },
    {
        path: '/:pathMatch(.*)*', // Redirect back to home page anything that doesn't match above
        redirect: '/',           
    },
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

const app = createApp(App);

const pinia = createPinia()

app.use(router);
app.use(pinia)
app.mount('#app');

const authenticationStore = useAuthenticationStore()

// Guard from accessing product pages without logging in
router.beforeEach((to) => {
    let isLoggedIn = authenticationStore.getLoginStatus
    if (!isLoggedIn && to.name !== 'login' && to.name !== 'registeration') {
        return { name: 'login' }
    }
})

// Guard from accessing login and registeration pages while logged in
router.beforeEach((to) => {
    let isLoggedIn = authenticationStore.getLoginStatus
    if (isLoggedIn && (to.name == 'login' || to.name == 'registeration' || to.name == 'home')) {
        return { name: 'product-list' }
    }
})
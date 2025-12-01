import { createApp } from 'vue';
import { createPinia } from 'pinia'
import App from './App.vue';
import router from '@/router/router';

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

const pinia = createPinia()

const app = createApp(App);

app.use(pinia)
app.use(router);

app.mount('#app');

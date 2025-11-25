<script setup lang="ts">
import '@/assets/css/AuthenticationPages.css'
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useModal } from '@/composables/useModal'
import { useAuthenticationStore } from '@/stores/AuthenticationStore';

// Router
const router = useRouter();
const go = (path: string) => router.push(path);

// Global data
const authenticationStore = useAuthenticationStore()
const { getLoginStatus } = authenticationStore

const loggedInStatus = ref<boolean>(false)

// Modal
const { showModal } = useModal();

// Redirect to product list page if user is already logged in
onMounted(() => {
    loggedInStatus.value = authenticationStore.getLoginStatus
    if (loggedInStatus.value == true) {
        go('/pages/product-list.html')
    }
});

const username = ref('')
const password = ref('')

// Function for registering a new user
function register() {
    // Check for blank input
    if (username.value == "" || password.value == "") {
        showModal({
            title: 'Invalid Input',
            message: 'Username And/Or Password cannot be left blank',
            showConfirm: false,
        })
    } else {
        // Check for registeration status
        const registerStatus = authenticationStore.registerNewUser(username.value, password.value)
        switch(registerStatus) {
            case 'registerSuccess': // Registeration is successful, immediately login into the new account and go to home page
                showModal({
                    title: 'User registered',
                    message: 'New user registered. Logging into your new account ...',
                    showConfirm: false,
                })
                authenticationStore.loginUser(username.value, password.value)
                go('/')
                break;
            case 'registerFailedDuplicatedUsername': // Username already existed in the database
                showModal({
                    title: 'Duplicated Username',
                    message: 'This username already existed. Please choose another username.',
                    showConfirm: false,
                })
                break;
            default:
                showModal({ // Fallback error
                    title: 'Unknown Error',
                    message: 'An unknown error has occcured. Please try again.',
                    showConfirm: false,
                })
                break;
        }     
    }
}
</script>

<template>
    <div class="page-root">
        <header class="page-header">
        <div class="header-left">
            <h1 class="site-title">ShoppingCart</h1>
        </div>
        <nav class="header-nav">
            <!-- Empty for now -->
        </nav>
        </header>
        <main class="page-content home-hero">
        <!-- Hero Section -->
        <section class="hero-card">
            <div class="form-header">
                <h2>Create Account</h2>
                <p class="form-subtitle">Join us and start shopping</p>
            </div>
            <form class="form" @submit.prevent="register">
                <div class="form-group">
                    <label for="username">Username</label>
                    <div class="input-wrapper">
                        <input v-model="username" id="username" type="text" placeholder="Choose a username" required />
                    </div>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <div class="input-wrapper">
                        <input v-model="password" id="password" type="password" placeholder="Create a password" required />
                    </div>
                </div>
                <button type="submit" class="btn btn-primary">Register</button>
                <button class="btn btn-primary"  @click="go('/pages/login.html')">Already have an account ?</button>
            </form>
        </section>
        </main>
    </div>
</template>

<style scoped>

</style>

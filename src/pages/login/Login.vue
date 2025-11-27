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

// Modal
const { showModal } = useModal();

// Lock state for buttons
const buttonLock = ref<boolean>(false);

const username = ref('')
const password = ref('')

// Function for user login
async function login() {
    if (buttonLock.value == true) { // Ignore multiple clicks
        return;
    } 
    buttonLock.value = true // Lock the button upon click

    try {
        // Check for blank input
        if (username.value == "" || password.value == "") {
            showModal({
                title: 'Invalid Input',
                message: 'Username And/Or Password cannot be left blank',
                showConfirm: false,
            })
        } else {
            // Check for correct credentials
            const loginSuccess =  await authenticationStore.loginUser(username.value, password.value)
            console.log(loginSuccess)

            switch (loginSuccess) {
                case true: // Login success
                    go('/pages/product-list')
                    break;
                case false: // Wrong credentials
                    showModal({
                        title: 'Invalid Credentials',
                        message: 'Username And/Or Password is incorrect, please try again.',
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
    } finally {
        buttonLock.value = false // Release button lock when operation ends
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
            <!-- Empty on purpose for now -->
        </nav>
        </header>
        <main class="page-content home-hero">
        <!-- Hero Section -->
        <section class="hero-card">
            <div class="form-header">
                <h2>Welcome Back</h2>
                <p class="form-subtitle">Sign in to your account</p>
            </div>
            <form class="form" @submit.prevent="login">
                <div class="form-group">
                    <label for="username">Username</label>
                    <div class="input-wrapper">
                        <input v-model="username" id="username" type="text" placeholder="Enter your username" required />
                    </div>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <div class="input-wrapper">
                        <input v-model="password" id="password" type="password" placeholder="Enter your password" required />
                    </div>
                </div>
                <button type="submit" class="btn btn-primary" :disabled="buttonLock">Login</button>
                <button class="btn btn-primary" :disabled="buttonLock" @click="go('/pages/registeration')">New User ?</button>
            </form>
        </section>
        </main>
    </div>
</template>

<style scoped>

</style>

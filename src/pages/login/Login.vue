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

const username = ref('')
const password = ref('')

// Function for user login
function login() {
    // Check for blank input
    if (username.value == "" || password.value == "") {
        showModal({
            title: 'Invalid Input',
            message: 'Username And/Or Password cannot be left blank',
            showConfirm: false,
        })
    } else {
        // Check for correct credentials
        const loginSuccess = authenticationStore.loginUser(username.value, password.value)
        if (loginSuccess) {
            go('/pages/product-list')
        } else {
            showModal({
                title: 'Invalid Credentials',
                message: 'Username And/Or Password is incorrect, please try again.',
                showConfirm: false,
            })
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
                <button type="submit" class="btn btn-primary">Login</button>
                <button class="btn btn-primary"  @click="go('/pages/registeration')">New User ?</button>
            </form>
        </section>
        </main>
    </div>
</template>

<style scoped>

</style>

<script setup lang="ts">
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
            go('/pages/product-list.html')
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
                <button class="btn btn-primary"  @click="go('/pages/registeration.html')">New User ?</button>
            </form>
        </section>
        </main>
    </div>
</template>

<style scoped>
.page-root { font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto; background: linear-gradient(135deg, #f8fafc 0%, #f0f4f8 100%); min-height: 100vh; }
.page-header { display:flex; justify-content:space-between; align-items:center; padding: 16px 20px; background: linear-gradient(90deg,#7c3aed22,#06b6d422); }
.site-title { margin:0; font-size:18px; color:#0f172a; }
.header-nav { display:flex; gap:10px; }
.nav-btn { background: white; border: none; padding:8px 12px; border-radius:8px; cursor:pointer; box-shadow:0 4px 12px rgba(2,6,23,0.06); transition: all 0.3s ease; }
.nav-btn:hover { background: #f0f4f8; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(2,6,23,0.08); }
.page-content { max-width:1100px; margin:24px auto; padding:0 18px; }
.home-hero { display:flex; justify-content:center; }
.hero-card { background: white; padding:40px; border-radius:16px; box-shadow:0 10px 40px rgba(16,24,40,0.08); width: 100%; max-width: 420px; }
.form-header { text-align: center; margin-bottom: 32px; }
.form-header h2 { margin: 0; font-size: 28px; font-weight: 700; color: #0f172a; }
.form-subtitle { margin: 8px 0 0 0; color: #64748b; font-size: 14px; }
.form { display: flex; flex-direction: column; align-items: center; gap: 20px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label { font-size: 13px; font-weight: 600; color: #334155; text-transform: uppercase; letter-spacing: 0.5px; }
.input-wrapper { position: relative; }
.form-group input { padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; font-family: inherit; background: #f8fafc; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.form-group input::placeholder { color: #cbd5e1; }
.form-group input:focus { outline: none; background: white; border-color: #7c3aed; box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1); }
.form-group input:hover { border-color: #cbd5e1; }
.btn { padding: 12px 24px; border-radius: 10px; border: none; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.btn-primary { background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%); color: white; width: 100%; margin-top: 8px; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(124, 58, 237, 0.3); }
.btn-primary:active { transform: translateY(0); }

@media (max-width:700px) { .hero-card { padding: 32px 24px; } .form-header h2 { font-size: 24px; } }
</style>

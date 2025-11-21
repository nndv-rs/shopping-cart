<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import ComponentProductList from '@/components/ComponentProductList.vue';
import { useAuthenticationStore } from '@/stores/AuthenticationStore';
import { useModal } from '@/composables/useModal'

// Router
const router = useRouter();
const go = (path: string) => router.push(path);

// Global data
const authenticationStore = useAuthenticationStore()
const { getLoginStatus, getLoggedInUsername } = authenticationStore

const loggedInStatus = ref<boolean>(false)
const loggedInUsername = ref<string>('')

// Modal
const { showModal } = useModal();

// Verify login status before loading
onMounted(() => {
    if (!authenticationStore.getLoginStatus) {
        go('/pages/login.html')        
    } else {
        loggedInStatus.value = getLoginStatus
        if (loggedInStatus.value == true) {
            loggedInUsername.value = authenticationStore.getLoggedInUsername
        }
    }
});

// Watch for user logout
watch(
    loggedInStatus,
    (newVal) => {
        if (newVal == false) {
            go('/')
        }
    }
);

function logout() {
    showModal({
        title: 'Confirm Logout',
        message: 'Are you sure you want to logout of your account ?',
        showConfirm: true,
        onConfirm: () => {
            authenticationStore.logoutUser()
            loggedInStatus.value = false
            loggedInUsername.value = ''
            go('/')                     
        }
    }) 
}
</script>

<template>
    <div class="page-root">
        <header class="page-header">
            <div class="header-left">
                <h1 class="site-title">ShoppingCart</h1>
                <p class="current-username" v-if="loggedInStatus">Welcome back, {{ loggedInUsername }}</p>
            </div>
            <nav class="header-nav">
                <button class="nav-btn" @click="go('/pages/product-list.html')">Products</button>
                <button class="nav-btn" @click="go('/pages/checkout.html')">Checkout</button>
                <button class="nav-btn-logout" @click="logout">Logout</button>
            </nav>
        </header>

        <main class="page-content">
            <section class="page-card">
                <h2 class="page-title">Product List</h2>
                <ComponentProductList />
            </section>
        </main>
    </div>
</template>

<style scoped>
.page-root { font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto; background: #f8fafc; min-height: 100vh; }
.page-header { display:flex; justify-content:space-between; align-items:center; padding: 16px 20px; background: linear-gradient(90deg,#7c3aed22,#06b6d422); }
.site-title { margin:0; font-size:18px; color:#0f172a; }
.header-nav { display:flex; gap:10px; }
.nav-btn { background: white; border: none; padding:8px 12px; border-radius:8px; cursor:pointer; box-shadow:0 4px 12px rgba(2,6,23,0.06); }
.nav-btn-logout { background: #ef4444; color: white; border: none; padding:8px 12px; border-radius:8px; cursor:pointer; box-shadow:0 4px 12px rgba(2,6,23,0.06); }
.page-content { max-width:1100px; margin:24px auto; padding:0 18px; }
.page-card { background: white; padding:18px; border-radius:12px; box-shadow:0 8px 24px rgba(16,24,40,0.04); }
.page-title { margin:0 0 12px 0; }
</style>
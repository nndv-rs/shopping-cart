<script lang="ts" setup>
import '@/assets/css/ProductPages.css'; 
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import ComponentProductDetails from '@/components/ComponentProductDetails.vue';
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

// Get username to display on the top navigation bar
onMounted(() => {
    loggedInStatus.value = getLoginStatus
    if (loggedInStatus.value == true) {
        loggedInUsername.value = authenticationStore.getLoggedInUsername
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
                <h2 class="page-title">Product Details</h2>
                <ComponentProductDetails />
            </section>
        </main>
    </div>
</template>

<style scoped>

</style>
<script setup lang="ts">
    import '@/pages/styles/pages.css'; 
    import { inject } from 'vue';
    const router = inject('router') as any;

    const go = (path: string) => router?.navigate(path);
</script>
<template>
    <div class="page-root">
        <header class="page-header">
            <div class="header-left">
                <h1 class="site-title">ShoppingCart</h1>
            </div>
            <nav class="header-nav">
                <button class="nav-btn" @click="go('/pages/product-list.html')">Products</button>
                <button class="nav-btn" @click="go('/pages/checkout.html')">Checkout</button>
            </nav>
        </header>

        <main class="page-content home-hero">
            <section class="hero-card">
                <h2>Welcome</h2>
                <p class="lead">Explore products and manage your shopping cart.</p>
                <div class="hero-actions">
                    <button class="btn primary" @click="go('/pages/product-list.html')">Browse Products</button>
                    <button class="btn" @click="go('/pages/checkout.html')">View Cart</button>
                </div>
            </section>
        </main>
    </div>
</template>

<style scoped>
</style>

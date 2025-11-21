<script lang="ts" setup>
    import '@/assets/css/pages.css'; 
    import { inject } from 'vue';
    import ComponentProductList from '@/components/ComponentProductList.vue';

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

        <main class="page-content">
            <section class="page-card">
                <h2 class="page-title">Product List</h2>
                <ComponentProductList />
            </section>
        </main>
    </div>
</template>

<style scoped>
</style>
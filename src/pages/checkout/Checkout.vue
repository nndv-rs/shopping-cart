<script lang="ts" setup>
    import ComponentCheckout from '@/components/ComponentCheckout.vue';
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
                <button class="nav-btn" @click="go('/')">Home</button>
                <button class="nav-btn" @click="go('/pages/product-list.html')">Products</button>
                <button class="nav-btn" @click="go('/pages/checkout.html')">Checkout</button>
            </nav>
        </header>

        <main class="page-content">
            <section class="page-card">
                <h2 class="page-title">Checkout</h2>
                <ComponentCheckout />
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
.page-content { max-width:1100px; margin:24px auto; padding:0 18px; }
.page-card { background: white; padding:18px; border-radius:12px; box-shadow:0 8px 24px rgba(16,24,40,0.04); }
.page-title { margin:0 0 12px 0; }
</style>

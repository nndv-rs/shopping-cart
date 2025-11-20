<script setup lang="ts">
    import { inject, computed, reactive, provide } from 'vue';
    import ComponentModalConfirmation from './components/ComponentModalConfirmation.vue'

    // MANUAL ROUTING
    const router = inject('router') as any;

    const currentComponent = computed(() => {
        const path = router?.currentPath?.value ?? '/';
        return router?.routes?.[path] ?? router?.routes['/'];
    });

    // DATA TYPES
    export type Product = {
        id: number;
        name: string;
        price: number;
        description: string;
        image?: string;
    }

    export type ShoppingCartItem = {
        product: Product;
        amount: number;
    }

    // PRODUCT LIST DATABASE
    const productList = reactive<Product[]>([
        {
            id: 0, 
            name: "Pencil", 
            price: 1, 
            description: "Sharpened pencil", 
            image: "img_pencil.png"
        },
        {
            id: 1, 
            name: "Table", 
            price: 2, 
            description: "Wooden table", 
            image: "img_table.jpg"
        },
        {
            id: 2, 
            name: "Book", 
            price: 3, 
            description: "Title: Lorep Ipsum - Author : Dolor Sit Amet", 
            image: "img_book.jpg"
        }
    ])

    // SHOPPING CART
    const shoppingCart = reactive<ShoppingCartItem[]>([])

    // PROVIDE(S)
    provide('productList', productList)
    provide('shoppingCart', shoppingCart)
</script>

<template>
    <div>
        <ComponentModalConfirmation />
        <component :is="currentComponent"/>
    </div>
</template>

<style scoped>

</style>

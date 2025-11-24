<script setup lang="ts">
import '@/assets/css/ComponentProductList.css'
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useModal } from '@/composables/useModal'
import { useProductListStore } from '@/stores/ProductListStore'
import { useShoppingCartStore } from '@/stores/ShoppingCartStore'
import ComponentSearch from './ComponentSearch.vue';
import ComponentSort from './ComponentSort.vue';
import type { Product } from '@/types/Product';

// Routing
const router = useRouter()
const go = (path: string) => router.push(path)

// Global product list
const productListStore = useProductListStore()
const { getProductList, addProductToList, fetchProductListFromFirebase } = productListStore
const productList = getProductList

// Global shopping cart
const shoppingCartStore = useShoppingCartStore()
const { getShoppingCart, addItemToCart } = shoppingCartStore
const shoppingCart = getShoppingCart

// Modal
const { showModal } = useModal()

// Sort and search parameters
const sortKey = ref<keyof Product | null>(null);      
const sortDirection = ref<'ASC' | 'DES' | null>(null); 
const searchText = ref<string>("");

// Input to create new product
const nameInput = ref<string>('');
const priceInput = ref<number>(1);
const descriptionInput = ref<string>('');
const imageInput = ref<string>('');

// Fetch product list from Firebase when loaded
onMounted(() => {
    fetchProductListFromFirebase()
});

// Compute which item to show on the list when there are search queries and filters
const renderList = computed(() => {
    let productsToRender = productList

    // If there are no search query or filter, show all items
    if (!searchText.value && sortKey.value === null) {
        return productsToRender;
    }

    // Filter list by search query
    if (searchText.value) {
        productsToRender = productList!.filter(product => 
            product.name.toLowerCase().includes(searchText.value.toLowerCase()) ||
            product.description.toLowerCase().includes(searchText.value.toLowerCase())
        )
    }

    // Sort the narrowed down list, numerical value for price, alphabetical for everything else
    if (sortKey.value) {
        if (sortKey.value == "price") {
            if (sortDirection.value == "ASC") {
                productsToRender!.sort((a, b) => a.price - b.price);
            }
            if (sortDirection.value == "DES") {
                productsToRender!.sort((a, b) => b.price - a.price);
            }
        } else {
            const key = sortKey.value;
            if (sortDirection.value == "ASC") {
                productsToRender!.sort((a, b) => (a[key] as string).localeCompare(b[key] as string));
            }
            if (sortDirection.value == "DES") {
                productsToRender!.sort((a, b) => -(a[key] as string).localeCompare(b[key] as string));
            }
        }
    }

    return productsToRender;
})

// Add a product to the product list store
async function addProductToStore() {
    if ((Number(priceInput.value) <= 0 || nameInput.value == "" || descriptionInput.value == "" || imageInput.value == "")) {
        showModal({
            title: 'Invalid Input',
            message: 'Make sure all fields are filled before submitting. Price cannot be zero.',
            showConfirm: false,
        })
    } else {
        let newProduct: Product = {
            id: Math.floor(Math.random() * 100000),
            name: nameInput.value,
            price: Number(priceInput.value),
            description: descriptionInput.value,
            image: imageInput.value
        }
        let status = productListStore.addProductToList(newProduct)
        if (await status) {
            // Reset input fields after adding a new product
            priceInput.value = 1
            nameInput.value = ""
            descriptionInput.value = ""
            imageInput.value = ""
        } else {
            showModal({
                title: 'Error',
                message: 'Failed to add new product. Please try again.',
                showConfirm: false,
            }) 
        }
    }
}

// Add a single item to cart when clicking "Add to Cart" button on ProductList page
function addSingleItemToCart(productId: number) {
    let index = productList.findIndex(product => product.id === productId)
    if (index !== -1) {
        let productToAdd = productList[index];
        shoppingCartStore.addItemToCart(productToAdd!, 1)
        showModal({
            title: 'Item added',
            message: 'Your item has been added to the cart.',
            showConfirm: false,
        })
    } else {
        showModal({
            title: 'Error',
            message: 'An error has occured, please try again.',
            showConfirm: false,
        })
    }
}
    
// Handle routing to the correct product detail page
function viewProductDetails(productId: number) {
    go(`/pages/product-details.html?id=${productId}`);
}

// Handle for search box text updates
function handleSearchUpdate(message: string) {
    searchText.value = message;
}

// Handle for sort button updates
function handleSortUpdate(message: string) {
    sortKey.value = message as keyof Product;
    if (sortDirection.value === null || sortDirection.value === "DES") {
        sortDirection.value = "ASC";
    } else {
        sortDirection.value = "DES";
    }
}
</script>

<template>
    <div class="pl-root">
        <div class="pl-header">
            <h2 class="pl-title">Products</h2>
            <div class="pl-controls">
                <ComponentSearch @updateSearch="handleSearchUpdate" />
            </div>
        </div>

        <div class="pl-card">
            <table class="product-table">
                <thead>
                    <tr>
                        <th>Name <ComponentSort label="name" :currentSortKey="sortKey" :currentSortDirection="sortDirection" @updateSort="handleSortUpdate"/></th>
                        <th>Price <ComponentSort label="price" :currentSortKey="sortKey" :currentSortDirection="sortDirection" @updateSort="handleSortUpdate"/></th>
                        <th>Description <ComponentSort label="description" :currentSortKey="sortKey" :currentSortDirection="sortDirection" @updateSort="handleSortUpdate"/></th>
                        <th class="actions-col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="product in renderList" :key="product.id">
                        <td class="name-col">{{ product.name }}</td>
                        <td class="price-col">$ {{ product.price }}</td>
                        <td class="desc-col">{{ product.description }}</td>
                        <td class="actions-col">
                            <button class="details-btn" @click="viewProductDetails(product.id)">View Details</button>
                            <button class="details-btn" @click="addSingleItemToCart(product.id)">Add To Cart</button>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td><input class="input" type="text" v-model="nameInput" placeholder="New product name" required></input></td>
                        <td><input class="input" type="number" min="1" v-model="priceInput" @input="priceInput = Math.max(1, priceInput || 0)"></input></td>
                        <td><input class="input" type="text" v-model="descriptionInput" placeholder="Short description" required></input></td>
                        <td class="actions-col">
                            <button class="add-btn" @click="addProductToStore">Add Product</button>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="3"><input class="input" type="text" v-model="imageInput" placeholder="Image URL"></input></td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <div v-if="!productList || productList.length === 0" class="list-empty">No products available.</div>
    </div>
</template>

<style scoped>

</style>
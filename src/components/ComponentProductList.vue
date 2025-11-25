<script setup lang="ts">
import '@/assets/css/ComponentProductList.css'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useModal } from '@/composables/useModal'
import { useProductListStore } from '@/stores/ProductListStore'
import { useShoppingCartStore } from '@/stores/ShoppingCartStore'
import ComponentSearch from './ComponentSearch.vue';
import ComponentSort from './ComponentSort.vue';
import type { Product } from '@/types/Product';
import { database } from '@/main';
import { collection, query, getDocs, orderBy, or, where } from 'firebase/firestore'

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

// Render List
const renderList = ref<Product[]>([])

// Sort and search parameters
const sortKey = ref<keyof Product | null>(null);      
const sortDirection = ref<'asc' | 'desc' | null>(null); 
const searchText = ref<string>("");

// Input to create new product
const nameInput = ref<string>('');
const priceInput = ref<number>(1);
const descriptionInput = ref<string>('');
const imageInput = ref<string>('');

// Fetch product list from Firebase when loaded
onMounted(() => {
    fetchProductListFromFirebase()
    renderList.value = productList
});

// Query Firebase for sorted documents
async function querySortColumn(sortKey: string, sortDirection: "asc" | "desc") {
    const q = query(
        collection(database, "productList"),
        orderBy(sortKey, sortDirection)
    );
    const querySnapshot = await getDocs(q)

    const productsToRender: Product[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: Number(data.id),
            name: data.name,
            price: Number(data.price),
            description: data.description,
            image: data.image,
        };
    });
    return productsToRender;
}

// Query Firebase for exact matching item Name or Description
// Firebase currently do not directly support partial matches, requires a workaround
async function querySearch(searchText: string) {
     const q = query(
        collection(database, "productList"),
        or(
            where("name", "==", searchText),
            where("description", "==", searchText)
        )
    );
    const querySnapshot = await getDocs(q)

    const productsToRender: Product[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: Number(data.id),
            name: data.name,
            price: Number(data.price),
            description: data.description,
            image: data.image,
        };
    });
    return productsToRender;
}

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
async function addSingleItemToCart(productId: number) {
    let index = productList.findIndex(product => product.id === productId)
    if (index !== -1) {
        let productToAdd = productList[index];
        await shoppingCartStore.addItemToCart(productToAdd!, 1)
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

// Handle for search text submit
async function handleSearchSubmit(searchText: string) {
    // If clicking Search when text box is empty, show all products
    if (searchText == '') {
        renderList.value = productList
    } else {
        try {
            renderList.value = await querySearch(searchText)
        } catch (error) {
            console.error("Error submitting search request to Firebase:", error);
        }
    }  
}

// Handle for sort button updates
async function handleSortUpdate(message: string) {
    sortKey.value = message as keyof Product;
    if (sortDirection.value === null || sortDirection.value === "desc") {
        sortDirection.value = "asc";
    } else {
        sortDirection.value = "desc";
    }

    // Clear old render list before query for sorted documents from Firebase
    renderList.value = []

    try {
        renderList.value = await querySortColumn(sortKey.value, sortDirection.value)
    } catch (error) {
        console.error("Error fetching sorted data from Firebase:", error);
    }
}
</script>

<template>
    <div class="pl-root">
        <div class="pl-header">
            <h2 class="pl-title">Products</h2>
            <div class="pl-controls">
                <ComponentSearch @submitSearch="handleSearchSubmit"/>
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
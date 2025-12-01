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
const { showModal, showError } = useModal()

// Lock state for buttons
const buttonLock = ref<boolean>(false);

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
onMounted(async() => {
    let getProductListStatus = await productListStore.fetchProductListFromFirebase()
    if (getProductListStatus) {
        renderList.value = productList
    }
    else {
        renderList.value = [] // If fail to get product list, set list to empty
        showError('Failed to load in product list. Please try again.')
    }
});

// Add a product to the product list store
async function addProductToStore() {
    if (buttonLock.value == true) { // Ignore multiple clicks
        return;
    } 
    buttonLock.value = true // Lock the button upon click

    try {
        if ((Number(priceInput.value) <= 0 || nameInput.value == "" || descriptionInput.value == "" || imageInput.value == "")) {
            showError('Make sure all fields are filled before submitting. Price cannot be zero.')
            return;
        }

        let newProduct: Product = {
            id: Math.floor(Math.random() * 100000),
            name: nameInput.value,
            price: Number(priceInput.value),
            description: descriptionInput.value,
            image: imageInput.value
        }

        let status = await productListStore.addProductToList(newProduct)
        if (status) {
            // Reset input fields after adding a new product
            priceInput.value = 1
            nameInput.value = ""
            descriptionInput.value = ""
            imageInput.value = ""
        } else {
            showError('Failed to add new product. Please try again.')
        }
    } finally {
        buttonLock.value = false; // Release button lock when operation ends
    }
}

// Add a single item to cart when clicking "Add to Cart" button on ProductList page
async function addSingleItemToCart(productId: number) {
    if (buttonLock.value == true) { // Ignore multiple clicks
        return;
    } 
    buttonLock.value = true // Lock the button upon click

    try {
        let index = productList.findIndex(product => product.id === productId)
        if (index !== -1) {
            let productToAdd = productList[index];

            let status = await shoppingCartStore.addItemToCart(productToAdd!, 1)     
            if (status) {
                showModal({
                    title: 'Item added',
                    message: 'Your item has been added to the cart.',
                    showConfirm: false,
                })
            } else {
                showError('Fail to add item to cart. Please try again.')
            }
        } else {
            showError('Product does not or no longer exist.')
        }
    } finally {
        buttonLock.value = false; // Release button lock when operation ends
    }
}
    
// Handle routing to the correct product detail page
function viewProductDetails(productId: number) {
    go(`/pages/product-details?id=${productId}`);
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
        showError("Error submitting sort request, please try again.")
        return null;
    }
}

// Handle for search text submit
async function handleSearchSubmit(searchText: string) {
    // If clicking Search when text box is empty, show all previous products
    if (searchText == '') {
        renderList.value = productList
    } else {
        try {
            renderList.value = await querySearch(searchText)
        } catch (error) {
            showError("Error submitting search request, please try again.")
            return null;
        }
    }  
}

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
            id: Number(data.id), // NOTE: This is the product id, not the Firebase document id
            name: data.name,
            price: Number(data.price),
            description: data.description,
            image: data.image,
        };
    });
    return productsToRender;
}

// Query Firebase for EXACT matching item Name OR Description
// Firebase Firestore currently do not natively support partial matches and requires a workaround (Ex: Algolia)
async function querySearch(searchText: string) {
    const q = query(
        collection(database, "productList"),
        or(
            where("name", "==", searchText),
            where("description", "==", searchText),
        )
    );
    const querySnapshot = await getDocs(q)

    const productsToRender: Product[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: Number(data.id), // NOTE: This is the product id, not the Firebase document id
            name: data.name,
            price: Number(data.price),
            description: data.description,
            image: data.image,
        };
    });
    return productsToRender;
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
                            <button class="details-btn" :disabled="buttonLock" @click="viewProductDetails(product.id)">View Details</button>
                            <button class="details-btn" :disabled="buttonLock" @click="addSingleItemToCart(product.id)">Add To Cart</button>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td><input class="input" type="text" v-model="nameInput" placeholder="New product name" required></input></td>
                        <td><input class="input" type="number" min="1" v-model="priceInput" @input="priceInput = Math.max(1, priceInput || 0)"></input></td>
                        <td><input class="input" type="text" v-model="descriptionInput" placeholder="Short description" required></input></td>
                        <td class="actions-col">
                            <button class="add-btn" :disabled="buttonLock" @click="addProductToStore">Add Product</button>
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
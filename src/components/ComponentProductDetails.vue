<script setup lang="ts">
import '@/assets/css/ComponentProductDetails.css'
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router'
import { useModal } from '@/composables/useModal'
import { useProductListStore } from '@/stores/ProductListStore'
import { useShoppingCartStore } from '@/stores/ShoppingCartStore';
import type { Product } from '@/types/Product';

// Routing
const router = useRouter()
const go = (path: string) => router.push(path)

// Global data
const productListStore = useProductListStore()
const { getProductList, removeProductFromList } = productListStore
const productList = getProductList

const shoppingCartStore = useShoppingCartStore()
const { getShoppingCart } = shoppingCartStore
const shoppingCart = getShoppingCart

// Lock state for buttons
const buttonLock = ref<boolean>(false);

// Product to show
const product = ref<Product | null>(null);

// Modal
const { showModal } = useModal();

// Local editor modal state
const showEditor = ref(false)
const imageInput = ref<string>('')

// Input for amount for adding to cart
const amountInput = ref(1);

// Input to edit product
const nameInput = ref<string>('');
const priceInput = ref<number>(1);
const descriptionInput = ref<string>('');

// Read product information to render when mounted
onMounted(() => {
    fetchProductDetails()
});

// Watch product list, reload information when changes are detected
watch(
    productList!,
    () => {
        fetchProductDetails()
    },
    { deep: true }
);

// Fetch product details from global data
function fetchProductDetails() {
    const productId = readIdFromUrl();
    if (productId != null) {
        product.value = productList!.find(product => product.id === productId) ?? null;
    }
}

// Get product id from URL
function readIdFromUrl(): number | null {
    try {
        const params = new URLSearchParams(window.location.search);
        const raw = params.get('id');
        if (!raw) return null;
        const n = parseInt(raw, 10);
        return Number.isNaN(n) ? null : n;
    } catch {
        return null;
    }
}

// Function for adding item to cart
async function addItemToCart(productToAdd: Product) {
    if (buttonLock.value == true) { // Ignore multiple clicks
        return;
    } 
    buttonLock.value = true // Lock the button upon click

    try {
        let status = await shoppingCartStore.addItemToCart(productToAdd, amountInput.value)
        if (status) {
            showModal({
                title: 'Item added',
                message: 'Your item has been added to the cart.',
                showConfirm: false,
            })
        } else {
            showModal({
                title: 'Error',
                message: 'Fail to add item to cart. Please try again.',
                showConfirm: false,
            })
        }     
    } finally {
        buttonLock.value = false // Release button lock when operation ends
    }
}

// Function for updating a product details
async function updateProductDetails() {
    if (buttonLock.value == true) { // Ignore multiple clicks
        return;
    } 
    buttonLock.value = true // Lock the button upon click

    let productId = Number(product.value?.id);
    if ((Number(priceInput.value) <= 0 || nameInput.value == "" || descriptionInput.value == "")) {
        showModal({
            title: 'Invalid Input',
            message: 'Make sure all fields are filled before submitting. Price cannot be zero.',
            showConfirm: false,
        })
        buttonLock.value = false
    } else {
        try {
            showModal({
                title: 'Confirm Update',
                message: 'Are you sure you want to update this item details and save it to the database ?',
                showConfirm: true,
                onConfirm: async () => {
                    let productInput : Product = {
                        id : productId,
                        name: nameInput.value,
                        price: Number(priceInput.value),
                        description: descriptionInput.value,
                        image: imageInput.value
                    }

                    let status = await productListStore.updateProductDetails(productInput)  
                    if (status !== true) {
                        showModal({
                            title: 'Error',
                            message: 'Could not update product details. Please try again.',
                            showConfirm: false,
                        })
                        fetchProductDetails() // Re-fetch product details in case of update failure
                    }
                    
                    // Close editor after update
                    showEditor.value = false  
                }
            }) 
        } finally {
            buttonLock.value = false // Release button lock when operation ends
        }     
    }
 }

// Function for deletring a product from the list
async function deleteProduct() {
    if (buttonLock.value == true) { // Ignore multiple clicks
        return;
    } 
    buttonLock.value = true // Lock the button upon click

    try {
        showModal({
            title: 'Confirm Delete',
            message: 'Are you sure you want to delete this item from the database?',
            showConfirm: true,
            onConfirm: async () => {
                let productId = Number(product.value?.id);

                let status = await productListStore.removeProductFromList(productId);
                if (status) {
                    go(`/pages/product-list`); // Redirect back to Product List page
                } else {
                    showModal({
                        title: 'Error',
                        message: 'Could not delete the product from database. Please try again.',
                        showConfirm: false,
                    })
                }
            }
        })
    } finally {
        buttonLock.value = false // Release button lock when operation ends
    }
}

// Editor modal controls, upon opening the modal, pre-fill with existing information
function openEditor() {
    if (!product.value) return;
    nameInput.value = product.value.name;
    priceInput.value = product.value.price;
    descriptionInput.value = product.value.description;
    imageInput.value = product.value.image ?? '';
    showEditor.value = true;
}

function closeEditor() {
    showEditor.value = false;
}

function confirmDelete() {
    showEditor.value = false;
    deleteProduct();
}
</script>

<template>
    <div class="details-root">
        <div v-if="product" class="details-container">
            <aside class="details-card">
                <div class="media-placeholder">
                    <img v-if="product.image" :src="product.image" alt="product image" class="product-image" />
                    <div v-else aria-hidden="true">IMG</div>
                </div>
                <div class="info">
                    <h1 class="title">{{ product.name }}</h1>
                    <p class="price">$ {{ product.price }}</p>
                    <p class="desc">{{ product.description }}</p>

                    <div class="cart-row">
                        <label class="qty-label">Quantity</label>
                        <input
                            type="number"
                            min="1"
                            v-model="amountInput"
                            class="qty-input"
                        />
                        <button class="btn primary" :disabled="buttonLock" @click="addItemToCart(product)">Add to Cart</button>
                        <button class="btn" :disabled="buttonLock" @click="openEditor">Edit Details</button>
                    </div>
                </div>
            </aside>

            <!-- editor modal -->
            <Teleport to="body">
                <div v-if="showEditor" class="editor-modal-overlay">
                    <div class="editor-modal-card">
                        <header class="modal-header">
                            <h3>Edit Product</h3>
                        </header>
                        <div class="modal-body">
                            <div class="editor-body modal-grid">
                                <label class="field">
                                    <span class="label-text">Name</span>
                                    <input type="text" v-model="nameInput" />
                                </label>

                                <label class="field">
                                    <span class="label-text">Price</span>
                                    <input type="number" min="1" v-model="priceInput" @input="priceInput = Math.max(1, priceInput || 0)" />
                                </label>

                                <label class="field" style="grid-column: 1 / -1;">
                                    <span class="label-text">Image URL</span>
                                    <input type="text" v-model="imageInput" />
                                </label>

                                <label class="field" style="grid-column: 1 / -1;">
                                    <span class="label-text">Description</span>
                                    <textarea v-model="descriptionInput" rows="4"></textarea>
                                </label>
                            </div>
                        </div>
                        <footer class="modal-actions">
                            <button class="btn danger" :disabled="buttonLock" @click="confirmDelete">Delete</button>
                            <div style="flex:1"></div>
                            <button class="btn" :disabled="buttonLock" @click="closeEditor">Cancel</button>
                            <button class="btn" :disabled="buttonLock" @click="updateProductDetails">Apply Changes</button>
                        </footer>
                    </div>
                </div>
            </Teleport>
        </div>

        <div v-else class="notfound">
            <p>No product selected or product not found.</p>
        </div>
    </div>
</template>

<style scoped>

</style>

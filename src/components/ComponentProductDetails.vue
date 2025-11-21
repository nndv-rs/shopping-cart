<script setup lang="ts">
    import '@/assets/css/ComponentProductDetails.css'; 
    import { onMounted, ref, inject, watch, computed } from 'vue';
    import type { Product, ShoppingCartItem } from '@/App.vue';
    import { useModal } from '@/composables/useModal'

    // Routing
    const router = inject('router') as any;
    const go = (path: string) => router?.navigate(path);

    // Global data
    const productList = inject<Product[]>('productList')
    const shoppingCart = inject<ShoppingCartItem[]>('shoppingCart')

    // Product to show
    const product = ref<Product | null>(null);

    // Modal
    const { showModal } = useModal()

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

    function addItemToCart(productToAdd: Product) {
        const index = shoppingCart!.findIndex(item => item.product.id === productToAdd.id)
        if (index == -1) {
            shoppingCart!.push({
                product: productToAdd,
                amount: amountInput.value   
            })       
        } else {
            shoppingCart![index]!.amount = shoppingCart![index]!.amount + amountInput.value;
        }
        showModal({
            title: 'Item added',
            message: 'Your item has been added to the cart.',
            showConfirm: false,
        })
    }

    function updateProductDetails() {
        let productId = Number(product.value?.id);

        if ((Number(priceInput.value) <= 0 || nameInput.value == "" || descriptionInput.value == "" || imageInput.value == "")) {
            showModal({
                title: 'Invalid Input',
                message: 'Make sure all fields are filled before submitting. Price cannot be zero.',
                showConfirm: false,
            })
        } else {
            showModal({
                title: 'Confirm Update',
                message: 'Are you sure you want to update this item details and save it to the database ?',
                showConfirm: true,
                onConfirm: () => {
                    let productId = readIdFromUrl();
                    for (let i = 0; i < productList!.length; i++) {
                        if (productId == productList![i]!.id) {
                            productList![i] = {
                                id : productId,
                                name: nameInput.value,
                                price: Number(priceInput.value),
                                description: descriptionInput.value,
                                image: imageInput.value || productList![i]!.image
                            }
                        }
                    }
                    // Close editor after update
                    showEditor.value = false
                }
            })         
        }
    }

    function deleteProduct() {
        showModal({
            title: 'Confirm Delete',
            message: 'Are you sure you want to delete this item from the database?',
            showConfirm: true,
            onConfirm: () => {
                let productId = Number(product.value?.id);
                for (let i = 0; i < productList!.length; i++) {
                    if (productId == productList![i]!.id) {
                        productList?.splice(i, 1)
                    }
                }
                go(`/pages/product-list.html`); // Redirect back to Product List page
            }
        })
    }

    // Editor modal controls
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
        // close editor first then trigger delete modal
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
                        <button class="btn primary" @click="addItemToCart(product)">Add to Cart</button>
                        <button class="btn" @click="openEditor">Edit Details</button>
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
                            <button class="btn danger" @click="confirmDelete">Delete</button>
                            <div style="flex:1"></div>
                            <button class="btn" @click="closeEditor">Cancel</button>
                            <button class="btn" @click="updateProductDetails">Apply Changes</button>
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

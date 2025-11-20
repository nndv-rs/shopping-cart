<script setup lang="ts">
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
    const fileName = ref<string | undefined>('');

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
        fileName.value = product.value?.image
    });

    // Watch product list, reload information when changes are detected
    watch(
        productList!,
        () => {
            fetchProductDetails()
            fileName.value = product.value?.image
        },
        { deep: true }
    );

    // Product image
    const imageSource = computed(() =>
        new URL(`../assets/images/${fileName.value}`, import.meta.url).href
    )

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

        if ((Number(priceInput.value) <= 0 || nameInput.value == "" || descriptionInput.value == "")) {
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
                    // close editor after update
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
                    <img v-if="product.image" :src="imageSource" alt="product image" class="product-image" />
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
:root {
    --bg-1: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
    --card-bg: #ffffff;
    --muted: #6b7280;
    --accent: #7c3aed;
    --danger: #ef4444;
}

.details-root {
    padding: 24px;
    font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    background: radial-gradient(circle at 10% 10%, rgba(124,58,237,0.06), transparent 20%), #f8fafc;
    min-height: 100vh;
}


.details-container {
    display: flex;
    gap: 20px;
    align-items: flex-start;
    max-width: 1100px;
    margin: 0 auto;
    padding: 12px;
}

.details-card {
    width: 100%;
    max-width: 920px;
    background: var(--card-bg);
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(16,24,40,0.06);
    padding: 18px;
    display: flex;
    gap: 18px;
    align-items: flex-start;
}


.media-placeholder {
    width: 240px;
    height: 240px;
    border-radius: 8px;
    background: var(--bg-1);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    letter-spacing: 1px;
}

.product-image { width: 240px; height: 240px; object-fit: contain; border-radius: 8px; }

/* Editor modal styles */
.editor-modal-overlay {
    position: fixed; inset: 0; display:flex; align-items:center; justify-content:center; background: rgba(2,6,23,0.5); z-index:1200; padding: 20px;
}
.editor-modal-card { width: 100%; max-width: 720px; background: #fff; border-radius: 12px; box-shadow: 0 12px 40px rgba(2,6,23,0.2); overflow: hidden; }
.modal-header { padding: 14px 18px; border-bottom: 1px solid #f1f5f9; }
.modal-body { padding: 18px; }
.modal-actions { display:flex; gap:10px; padding:14px 18px; border-top:1px solid #f1f5f9; align-items:center; }
.modal-grid { display:grid; grid-template-columns: 1fr 1fr; gap:12px; }


.info .title {
    margin: 0 0 6px 0;
    font-size: 24px;
    color: #0f172a;
}

.info .price {
    margin: 0 0 10px 0;
    color: var(--accent);
    font-weight: 700;
    font-size: 18px;
}

.info .desc {
    margin: 12px 0 16px 0;
    color: var(--muted);
}


.cart-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 14px;
}

.qty-input {
    width: 84px;
    padding: 8px;
    border-radius: 8px;
    border: 1px solid #e6e6f0;
}

.btn {
    border: none;
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
}

.btn.primary {
    background: linear-gradient(90deg, #7c3aed, #06b6d4);
    color: white;
}

.btn.danger {
    background-color: #ef4444;
    color: white;
}

.editor-card {
    flex: 1;
    background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.95));
    border-radius: 12px;
    padding: 18px;
    box-shadow: 0 6px 20px rgba(15,23,42,0.04);
}

.editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.editor-header h2 {
    margin: 0;
}

.editor-actions .btn {
    margin-left: 8px;
}

.editor-body {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.field {
    display: flex;
    flex-direction: column;
}

.label-text {
    font-size: 13px;
    color: var(--muted);
    margin-bottom: 6px;
}

input[type="text"],
input[type="number"],
textarea {
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #e6e6f0;
}

.notfound {
    max-width: 800px;
    margin: 40px auto;
    padding: 20px;
    background: #fff4f4;
    border-radius: 8px;
    color: #7f1d1d;
}

@media (max-width: 900px) {
    .details-container {
        flex-direction: column;
        padding: 12px;
    }

    .editor-body {
        grid-template-columns: 1fr;
    }
}
</style>

<script setup lang="ts">
    import { computed, inject, ref } from 'vue'
    import type { Product, ShoppingCartItem } from '@/App.vue';
    import ComponentSearch from './ComponentSearch.vue';
    import ComponentSort from './ComponentSort.vue';
    import { useModal } from '@/composables/useModal'

    // Routing
    const router = inject('router') as any;
    const go = (path: string) => router?.navigate(path);

    // Global product list
    const productList = inject<Product[]>('productList')
    const shoppingCart = inject<ShoppingCartItem[]>('shoppingCart')

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
    
    function addProduct() {
        if ((Number(priceInput.value) <= 0 || nameInput.value == "" || descriptionInput.value == "")) {
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
                description: descriptionInput.value
            }
            productList?.push(newProduct)
        }
    }

    function addItemToCart(productId: number) {
        let productIndex = productList!.findIndex(product => product.id === productId);

        let productToAdd = productList![productIndex];

        if (productToAdd) {
            let shoppingCartIndex = shoppingCart!.findIndex(item => item.product.id === productToAdd.id);

            if (shoppingCartIndex == -1) {
                let itemToAdd: ShoppingCartItem = {
                    product: productToAdd,
                    amount: 1
                }
                shoppingCart!.push(itemToAdd);
            } else {
                shoppingCart![shoppingCartIndex]!.amount++;
            }

            showModal({
                title: 'Item added',
                message: 'Your item has been added to the cart.',
                showConfirm: false,
            });
        } else {
            showModal({
                title: 'Error',
                message: 'An error has occurred, please try again.',
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
                            <button class="details-btn" @click="addItemToCart(product.id)">Add To Cart</button>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td><input class="input" type="text" v-model="nameInput" placeholder="New product name"></input></td>
                        <td><input class="input" type="number" min="1" v-model="priceInput" @input="priceInput = Math.max(1, priceInput || 0)"></input></td>
                        <td><input class="input" type="text" v-model="descriptionInput" placeholder="Short description"></input></td>
                        <td class="actions-col">
                            <button class="add-btn" @click="addProduct">Add Product</button>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <div v-if="!productList || productList.length === 0" class="list-empty">No products available.</div>
    </div>
</template>

<style scoped>
/* Modern colorful styles for product list */
.pl-root {
    padding: 18px;
    font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}

.pl-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.pl-title {
    margin: 0;
    color: #0f172a;
}

.pl-card {
    background: linear-gradient(180deg, #ffffff, #fbfcff);
    padding: 12px;
    border-radius: 12px;
    box-shadow: 0 6px 18px rgba(15,23,42,0.04);
}

.product-table {
    width: 100%;
    border-collapse: collapse;
}

.product-table th,
.product-table td {
    border-bottom: 1px solid #eef2ff;
    padding: 10px 14px;
    text-align: left;
}

.product-table thead th {
    background: linear-gradient(90deg, rgba(124,58,237,0.06), rgba(6,182,212,0.03));
    font-weight: 700;
    color: #0f172a;
}

.name-col { font-weight: 600; color: #0f172a; }
.price-col { color: #06b6d4; font-weight: 600; }
.desc-col { color: #525252; }

.actions-col { text-align: right; }

.details-btn {
    background: linear-gradient(90deg,#7c3aed,#06b6d4);
    color: #fff;
    border: none;
    padding: 8px 10px;
    border-radius: 8px;
    cursor: pointer;
    margin-right: 5px;
}

.add-btn {
    background: #10b981;
    color: #fff;
    border: none;
    padding: 8px 10px;
    border-radius: 8px;
    cursor: pointer;
}

.input {
    padding: 8px 10px;
    border-radius: 8px;
    border: 1px solid #e6e6f0;
}

.list-empty {
    margin-top: 12px;
    color: #6b7280;
}

@media (max-width: 700px) {
    .actions-col { text-align: left; }
    .product-table th, .product-table td { padding: 8px; }
}
</style>
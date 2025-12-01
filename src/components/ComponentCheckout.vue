<script setup lang="ts">
import '@/assets/css/ComponentCheckout.css'
import { reactive, onMounted, watch, computed } from 'vue';
import { useModal } from '@/composables/useModal'
import type { ShoppingCartItem } from '@/types/ShoppingCartItem';
import { useShoppingCartStore } from '@/stores/ShoppingCartStore';
import { useProductListStore } from '@/stores/ProductListStore';

// Global data
const shoppingCartStore = useShoppingCartStore()
const { getShoppingCart, removeItemFromCart } = shoppingCartStore
const shoppingCart = getShoppingCart

const productListStore = useProductListStore()
const { getProductById } = productListStore

// Keep a local input value so edits don't immediately mutate the shopping cart
const quantityInputs = reactive<Record<number, string>>({});

// Use modal for confirmation upon item Update/Delete
const { showModal } = useModal()

// Helper to get a product by productId (returns undefined when the product is missing)
function getProductDetails(item: ShoppingCartItem) {
    return getProductById(item.productId)
}

// Total price calculation
const computedTotalPrice = computed(() => {
    let totalPrice = 0;
    shoppingCart!.forEach(item => {
        const product = getProductDetails(item)
        if (product) {
            totalPrice = totalPrice + (item.amount * product.price);
        }
    });
    return totalPrice;
});

// Get item quanitity inside cart upon mounting
onMounted(() => {
    shoppingCart!.forEach(item => {
        quantityInputs[item.productId] = String(item.amount);
    });
});

// Watch for item quantity changes
watch(
    shoppingCart!,
    (newVal) => {
        newVal.forEach(item => {
            if (!(item.productId in quantityInputs)) {
                quantityInputs[item.productId] = String(item.amount);
            }
        });
    },
    { deep: true }
);

// Updating the amount of items inside the cart
async function updateAmount(item: ShoppingCartItem) {
    showModal({
        title: 'Confirm Update',
        message: 'Are you sure you want to update this item in your cart?',
        showConfirm: true,
        onConfirm: async () => {
            const rawInput = quantityInputs[item.productId];
            const amountInput = parseInt(String(rawInput), 10);
            if (amountInput < 1 || Number.isNaN(amountInput)) {
                // Enforce minimum 1
                quantityInputs[item.productId] = '1';
                await shoppingCartStore.updateItemAmountInCart(item, 1)
            } else {
                await shoppingCartStore.updateItemAmountInCart(item, amountInput)
            }
        }   
    })
}

// Removing an item inside the cart
async function removeItem(item: ShoppingCartItem) {
    showModal({
        title: 'Confirm Deletion',
        message: 'Are you sure you want to remove this item from your cart?',
        showConfirm: true,
        onConfirm: async () => {
            await shoppingCartStore.removeItemFromCart(item)
        }
    })
}

// Checkout items, clear the shopping cart afterwards
async function completeCheckout() {
    showModal({
        title: 'Thank you',
        message: 'Thank you for your purchase! Your order has been placed.',
        showConfirm: false,
    })
    shoppingCart!.splice(0, shoppingCart!.length)
    await shoppingCartStore.clearCartCheckout()
}
</script>

<template>
    <div class="checkout-root">
        <div v-if="shoppingCart && shoppingCart.length" class="checkout-card">
            <h3 class="checkout-title">Your Cart</h3>
            <table class="cart-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Description</th>
                        <th class="qty-col">Qty</th>
                        <th class="actions-col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in shoppingCart" :key="item.productId">
                        <td class="name-col">{{ getProductDetails(item)?.name ?? 'Product not found' }}</td>
                        <td class="price-col">$ {{ getProductDetails(item)?.price ?? 'N/A' }}</td>
                        <td class="desc-col">{{ getProductDetails(item)?.description ?? 'N/A' }}</td>
                        <td class="qty-col">{{ item.amount }}</td>
                        <td class="actions-col">
                            <input
                                type="number"
                                min="1"
                                v-model="quantityInputs[item.productId]"
                                class="qty-input"
                            />
                            <button class="btn update" @click="updateAmount(item)">Update</button>
                            <button class="btn delete" @click="removeItem(item)">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="checkout-footer">
                <div class="total">Total: <span class="total-amount">$ {{ computedTotalPrice }}</span></div>
                <div class="checkout-actions">
                    <button class="btn checkout" @click="completeCheckout">Checkout</button>
                </div>
            </div>
        </div>

        <div v-else class="empty-card">
            <p>Your shopping cart is empty.</p>
        </div>
    </div>
</template>

<style scoped>

</style>

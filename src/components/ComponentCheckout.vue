<script setup lang="ts">
import { reactive, onMounted, watch, computed } from 'vue';
import { useModal } from '@/composables/useModal'
import type { ShoppingCartItem } from '@/types/ShoppingCartItem';
import { useShoppingCartStore } from '@/stores/ShoppingCartStore';

// Global data
const shoppingCartStore = useShoppingCartStore()
const { getShoppingCart, removeItemFromCart } = shoppingCartStore
const shoppingCart = getShoppingCart

// Keep a local input value so edits don't immediately mutate the shopping cart
const quantityInputs = reactive<Record<number, string>>({});

// Use modal for confirmation upon item Update/Delete
const { showModal } = useModal()

// Total price calculation
const computedTotalPrice = computed(() => {
    let totalPrice = 0;
    shoppingCart!.forEach(item => {
        totalPrice = totalPrice + (item.amount * item.product.price);
    });
    return totalPrice;
});

// Get item quanitity inside cart upon mounting
onMounted(() => {
    shoppingCart!.forEach(item => {
        quantityInputs[item.product.id] = String(item.amount);
    });
});

// Watch for item quantity changes
watch(
    shoppingCart!,
    (newVal) => {
        newVal.forEach(item => {
            if (!(item.product.id in quantityInputs)) {
                quantityInputs[item.product.id] = String(item.amount);
            }
        });
    },
    { deep: true }
);

// Updating the amount of items inside the cart
function updateAmount(item: ShoppingCartItem) {
    showModal({
        title: 'Confirm Update',
        message: 'Are you sure you want to update this item in your cart?',
        showConfirm: true,
        onConfirm: () => {
            const rawInput = quantityInputs[item.product.id];
            const amountInput = parseInt(String(rawInput), 10);
            if (amountInput < 1 || Number.isNaN(amountInput)) {
                // Enforce minimum 1
                quantityInputs[item.product.id] = '1';
                shoppingCartStore.updateItemAmountInCart(item, 1)
            } else {
                shoppingCartStore.updateItemAmountInCart(item, amountInput)
            }
        }
    })
}

// Removing an item inside the cart
function removeItem(item: ShoppingCartItem) {
    showModal({
        title: 'Confirm Deletion',
        message: 'Are you sure you want to remove this item from your cart?',
        showConfirm: true,
        onConfirm: () => {
            shoppingCartStore.removeItemFromCart(item)
        }
    })
}

    function completeCheckout() {
        showModal({
            title: 'Thank you',
            message: 'Thank you for your purchase! Your order has been placed.',
            showConfirm: false,
        })
        shoppingCart!.splice(0, shoppingCart!.length)
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
                    <tr v-for="item in shoppingCart" :key="item.product.id">
                        <td class="name-col">{{ item.product.name }}</td>
                        <td class="price-col">$ {{ item.product.price }}</td>
                        <td class="desc-col">{{ item.product.description }}</td>
                        <td class="qty-col">{{ item.amount }}</td>
                        <td class="actions-col">
                            <input
                                type="number"
                                min="1"
                                v-model="quantityInputs[item.product.id]"
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
/* Modern checkout styles */
.checkout-root { padding: 18px; font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto; }
.checkout-card { background: #ffffff; border-radius: 12px; padding: 16px; box-shadow: 0 8px 24px rgba(16,24,40,0.05); }
.checkout-title { margin: 0 0 10px 0; color: #0f172a; }

.cart-table { width: 100%; border-collapse: collapse; }
.cart-table th, .cart-table td { padding: 12px 10px; border-bottom: 1px solid #eef2ff; }
.cart-table thead th { background: linear-gradient(90deg, rgba(124,58,237,0.05), rgba(6,182,212,0.03)); font-weight: 700; }
.name-col { font-weight: 600; }
.price-col { color: #06b6d4; font-weight: 600; }
.desc-col { color: #525252; }
.qty-col { width: 80px; text-align: center; }
.actions-col { text-align: right; min-width: 220px; }

.qty-input { width: 74px; padding: 8px; margin-right: 8px; border-radius: 8px; border: 1px solid #e6e6f0; }
.btn { padding: 8px 10px; border-radius: 8px; cursor: pointer; border: none; }
.btn.update { background: linear-gradient(90deg,#7c3aed,#06b6d4); color: white; margin-right: 6px; }
.btn.delete { background: #ff6b6b; color: white; }

.checkout-footer { display: flex; justify-content: flex-end; margin-top: 12px; }
.total { font-weight: 700; color: #0f172a; margin-left: 10px; }
.total-amount { color: #06b6d4; margin-left: 8px; }

.checkout-footer { display:flex; justify-content:space-between; align-items:center; margin-top:12px; }
.checkout-actions { display:flex; gap:8px; }
.btn.checkout { background: linear-gradient(90deg,#10b981,#06b6d4); color: white; margin-right: 10px;}

.empty-card { padding: 20px; background: #fff7ed; border-radius: 10px; color: #7f3700; }

@media (max-width: 700px) {
    .actions-col { text-align: left; }
    .cart-table th, .cart-table td { padding: 8px; }
}
</style>

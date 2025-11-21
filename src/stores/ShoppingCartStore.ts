import { defineStore } from 'pinia'
import type { Product } from '@/types/Product'
import type { ShoppingCartItem } from '@/types/ShoppingCartItem'

export const useShoppingCartStore = defineStore('shoppingCartStore', {
    state: () => ({
        shoppingCart: [] as ShoppingCartItem[],
    }),

    getters: {
        getShoppingCart: (state) => state.shoppingCart,
    },

    actions: {
        // Add an item to the cart
        addItemToCart(productInput: Product, amountInput: number) {
            const index = this.shoppingCart.findIndex(item => item.product.id === productInput.id)
            if (index == -1) {
                let itemToAdd : ShoppingCartItem = {
                    product: productInput,
                    amount: amountInput  
                }
                this.shoppingCart.push(itemToAdd)
            } else {
                this.shoppingCart[index]!.amount = this.shoppingCart[index]!.amount + amountInput;
            }
        },

        // Update the quantity of a specific item in cart
        updateItemAmountInCart(itemInput: ShoppingCartItem, amountInput: number) {
            const index = this.shoppingCart.indexOf(itemInput);
            if (index !== -1) {
                if (amountInput <= 0 || Number.isNaN(amountInput)) {
                    itemInput.amount = 1;
                } else {
                    itemInput.amount = amountInput;
                }
            }
        },

        // Remove a specific item from the cart
        removeItemFromCart(item: ShoppingCartItem) {
            const index = this.shoppingCart.indexOf(item);
            if (index !== -1) {
                this.shoppingCart.splice(index, 1);
            }
        },

        // Clear the entire shopping cart
        clearCart() {
            this.shoppingCart.splice(0, this.shoppingCart.length)
        }
    }
})
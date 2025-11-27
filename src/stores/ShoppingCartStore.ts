import { defineStore } from 'pinia'
import type { Product } from '@/types/Product'
import type { ShoppingCartItem } from '@/types/ShoppingCartItem'
import { database } from '@/main'
import { collection, doc,  setDoc, updateDoc, query, where,getDocs} from 'firebase/firestore'

export const useShoppingCartStore = defineStore('shoppingCartStore', {
    state: () => ({
        shoppingCart: [] as ShoppingCartItem[],
        currentUserDocId: '' as string,
    }),

    getters: {
        getShoppingCart: (state) => state.shoppingCart,
    },

    actions: {
        // Initialize Shopping Cart from Firebase for the logged in user
        async initializeCartFromFirebase(username: string) {
            try {
                const q = query(
                    collection(database, "shoppingCart"),
                    where("username", "==", username)
                );
                const querySnapshot = await getDocs(q);

                // Create new shopping cart document for the user if there isn't one yet
                if (querySnapshot.empty) {
                    const docRef = doc(collection(database, "shoppingCart"));
                    await setDoc(docRef, {
                        username: username,
                        items: [],
                    });
                    this.currentUserDocId = docRef.id;
                    this.shoppingCart = [];            
                    return true;

                // Else use the existing document
                } else {            
                    const userDoc = querySnapshot.docs[0];
                    const data = userDoc!.data()
                    
                    this.currentUserDocId = userDoc!.id;
                    this.shoppingCart = data!.items || [];
                    return true;
                }

            } catch (error) {
                return null;
            }
        },

        // Add an item to the cart and sync with Firebase
        async addItemToCart(productInput: Product, amountInput: number) {
            try {
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
                
                await this.syncCartToFirebase();
                return true;
            } catch (error) {
                return null;
            }
        },

        // Update the quantity of a specific item in cart and sync with Firebase
        async updateItemAmountInCart(itemInput: ShoppingCartItem, amountInput: number) {
            try {
                const index = this.shoppingCart.indexOf(itemInput);
                if (index !== -1) {
                    if (amountInput <= 0 || Number.isNaN(amountInput)) {
                        itemInput.amount = 1;
                    } else {
                        itemInput.amount = amountInput;
                    }
                }
                
                await this.syncCartToFirebase();
                return true;
            } catch (error) {
                return null;
            }
        },

        // Remove a specific item from the cart and sync with Firebase
        async removeItemFromCart(item: ShoppingCartItem) {
            try {
                const index = this.shoppingCart.indexOf(item);
                if (index !== -1) {
                    this.shoppingCart.splice(index, 1);
                }
                
                await this.syncCartToFirebase();
                return true;
            } catch (error) {
                return null;
            }
        },

        // Clear the shopping cart locally, in the event another user log in on the same device
        clearCartLocal() {
            this.shoppingCart.splice(0, this.shoppingCart.length)
        },

        // Clear the shopping cart both locally and on Firebase when clicking Checkout
        async clearCartCheckout() {
            try {
                this.shoppingCart.splice(0, this.shoppingCart.length)
                await this.syncCartToFirebase();
            } catch (error) {
                return null;
            }            
        },

        // Sync the current shopping cart state to Firebase
        async syncCartToFirebase() {
            try {
                if (!this.currentUserDocId) {
                    throw new Error("User Document ID is not set"); // Cannot sync cart if the user document id is not set
                }

                const cartDocRef = doc(database, "shoppingCart", this.currentUserDocId);
                await updateDoc(cartDocRef, {
                    items: this.shoppingCart,
                });
                return true;
            } catch (error) {
                // Reset cart to empty and throw error when cannot sync cart to Firebase for any reason
                this.shoppingCart = [] 
                throw error; 
            }
        }
    }
})
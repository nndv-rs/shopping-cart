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
        // Initialize cart from Firebase for the user after logging in
        async initializeCartFromFirebase(username: string) {
            try {
                // Query for the user's shopping cart document
                const q = query(
                    collection(database, "shoppingCart"),
                    where("username", "==", username)
                );
                const querySnapshot = await getDocs(q);
                
                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0];
                    if (userDoc) {
                        this.currentUserDocId = userDoc.id;
                        const data = userDoc.data();
                        this.shoppingCart = data.items || [];
                    }
                } else {
                    // Create a new shopping cart for this user if it doesn't exist
                    this.currentUserDocId = '';
                    this.shoppingCart = [];
                }
            } catch (error) {
                console.error("Error initializing cart from Firebase:", error);
                this.shoppingCart = [];
            }
        },

        // Create a new user shopping cart document in Firebase
        async createUserCartDocument(username: string) {
            try {
                // Check if user already has a cart
                const q = query(
                    collection(database, "shoppingCart"),
                    where("username", "==", username)
                );
                const querySnapshot = await getDocs(q);
                
                if (querySnapshot.empty) {
                    // Create new shopping cart document for the user if there isn't one yet
                    const docRef = doc(collection(database, "shoppingCart"));
                    await setDoc(docRef, {
                        username: username,
                        items: [],
                    });
                    this.currentUserDocId = docRef.id;
                } else {
                    const firstDoc = querySnapshot.docs[0];
                    if (firstDoc) {
                        this.currentUserDocId = firstDoc.id;
                    }
                }
            } catch (error) {
                console.error("Error creating cart document:", error);
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
            } catch (error) {
                console.error("Error adding item to cart:", error);
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
            } catch (error) {
                console.error("Error updating item amount:", error);
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
            } catch (error) {
                console.error("Error removing item from cart:", error);
            }
        },

        // Clear the shopping cart locally, in the event another user log in on the same device
        clearCart() {
            this.shoppingCart.splice(0, this.shoppingCart.length)
        },

        // Sync the current shopping cart state to Firebase
        async syncCartToFirebase() {
            try {
                if (!this.currentUserDocId) {
                    console.error("User document ID not set. Cannot sync cart.");
                    return;
                }

                const cartDocRef = doc(database, "shoppingCart", this.currentUserDocId);
                await updateDoc(cartDocRef, {
                    items: this.shoppingCart,
                });
            } catch (error) {
                console.error("Error syncing cart to Firebase:", error);
            }
        }
    }
})
import { defineStore } from 'pinia'
import type { Product } from '@/types/Product'
import { database } from '@/main';
import { collection, query, where, addDoc, getDocs, updateDoc, deleteDoc } from "firebase/firestore";

export const useProductListStore = defineStore('productListStore', {
    state: () => ({
        productList: [] as Product[],
    }),

    getters: {
        getProductList: (state) => state.productList,

        getProductById: (state) => {
            return (id: number) => state.productList.find(product => product.id === id)
        }
    },

    actions: {
        // Add a product to Firebase
        async addProductToList(product: Product) {
            try {
                await addDoc(collection(database, "productList"), product);
                await this.fetchProductListFromFirebase();
                return true;
            } catch (error) {
                return null;
            }   
        },

        // Update a product details to Firebase
        async updateProductDetails(productInput: Product) {
            try {
                const q = query(
                    collection(database, "productList"),
                    where("id", "==", productInput.id)
                );
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    return null;
                } else {
                    const docToUpdate = querySnapshot.docs[0]
                    const dataInput = {
                        id: productInput.id,
                        name: productInput.name,
                        price: productInput.price,
                        description: productInput.description,
                        image: productInput.image
                    }
                    await updateDoc(docToUpdate!.ref, dataInput);

                    // Fetch new item database after update operation
                    await this.fetchProductListFromFirebase();
                    return true;
                }
            } catch (error) {
                return null;
            }          
        },

        // Remove a product from Firebase
        async removeProductFromList(productId: number) {
            try {
                const q = query(
                    collection(database, "productList"),
                    where("id", "==", productId)
                );
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    return null;
                } else {
                    const docToDelete = querySnapshot.docs[0]
                    await deleteDoc(docToDelete!.ref)
                    return true;
                }
            } catch (error) {
                return null;
            }    
        },

        // Call Firebase to fetch product list database
        async fetchProductListFromFirebase() {
            // Clear the old product list before fetching from Firebase
            this.productList.splice(0, this.productList.length)

            try {
                const q = query(collection(database, "productList"));
                const querySnapshot = await getDocs(q);

                querySnapshot.forEach((doc) => {
                    let docData = doc.data()

                    let product: Product = {
                        id: Number(docData.id), // NOTE: This is the product id, not the Firebase document id
                        name: docData.name,
                        price: Number(docData.price),
                        description: docData.description,
                        image: docData.image
                    }
                    this.productList.push(product)
                });
                return true;
            } catch (error) {
                this.productList = [] // If fail to fetch product list, set the list to empty
                return null;
            }
        }
    }
})
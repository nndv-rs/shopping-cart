import { defineStore } from 'pinia'
import type { Product } from '@/types/Product'

export const useProductListStore = defineStore('productListStore', {
    state: () => ({
        productList: [
            {
                id: 0, 
                name: "Pencil", 
                price: 1, 
                description: "Sharpened pencil", 
                image: "img_pencil.png"
            },
            {
                id: 1, 
                name: "Table", 
                price: 2, 
                description: "Wooden table", 
                image: "img_table.jpg"
            },
            {
                id: 2, 
                name: "Book", 
                price: 3, 
                description: "Title: Lorep Ipsum - Author : Dolor Sit Amet", 
                image: "img_book.jpg"
            }
            ] as Product[],
    }),

    getters: {
        getProductList: (state) => state.productList,

        getProductById: (state) => {
            return (id: number) => state.productList.find(product => product.id === id)
        }
    },

    actions: {
        addProductToList(product: Product) {
            this.productList.push(product)
        },

        updateProductDetail(productInput: Product) {
            const index = this.productList.findIndex(product => product.id == productInput.id)
            if (index !== -1) {
                this.productList[index] = {
                    id: productInput.id,
                    name: productInput.name,
                    price: productInput.price,
                    description: productInput.description,
                    image: productInput.image
                }
            }
        },

        removeProductFromList(id: number) {
            const index = this.productList.findIndex(product => product.id === id)
            if (index !== -1) {
                this.productList.splice(index, 1)
            }
        }
    }
})
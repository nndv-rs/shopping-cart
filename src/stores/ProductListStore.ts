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
                image: "https://png.pngtree.com/png-clipart/20221219/ourmid/pngtree-pencil-clipart-png-image_6529094.png"
            },
            {
                id: 1, 
                name: "Table", 
                price: 2, 
                description: "Wooden table", 
                image: "https://www.shutterstock.com/image-vector/table-furniture-wood-interior-wooden-260nw-2468173261.jpg"
            },
            {
                id: 2, 
                name: "Book", 
                price: 3, 
                description: "Title: Lorep Ipsum - Author : Dolor Sit Amet", 
                image: "https://png.pngtree.com/element_our/20190522/ourmid/pngtree-open-book-illustration-image_1072047.jpg"
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
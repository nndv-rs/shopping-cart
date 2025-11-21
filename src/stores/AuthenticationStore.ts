import { defineStore } from 'pinia'
import type { User } from '@/types/User'
import { useShoppingCartStore } from '@/stores/ShoppingCartStore';

export const useAuthenticationStore = defineStore('authenticationStore', {
    state: () => ({
        userList: [
            { username: "admin", password: "12345" },
        ] as User[],

        isLoggedIn: false as boolean,
        LoggedInUsername: '' as string,
    }),

    getters: {
        getLoginStatus: (state) => state.isLoggedIn,

        getLoggedInUsername: (state) => state.LoggedInUsername,
    },

    actions: {
        // Register a new user, store the information inside UserList
        registerNewUser(usernameInput: string, passwordInput: string) {
            if (usernameInput || passwordInput) {
                // Check if username already exist
                const index = this.userList.findIndex(user => user.username === usernameInput);
                if (index !== -1) {
                    return 'registerFailedDuplicatedUsername'
                } else {
                    let newUser : User = {
                        username: usernameInput,
                        password: passwordInput
                    }
                    this.userList.push(newUser)
                    return 'registerSuccess'
                }                                 
            }
        },

        // Authenticate a user for login
        loginUser(usernameInput: string, passwordInput: string) {
            const index = this.userList.findIndex(user => user.username === usernameInput);
            if (index !== -1) {
                if (passwordInput === this.userList[index]?.password) {
                    this.isLoggedIn = true;
                    this.LoggedInUsername = this.userList[index].username
                    return true;
                } else {
                    return false;
                }
            }           
        },

        // Logout user and clear the shopping cart
        logoutUser() {
            this.isLoggedIn = false;
            this.LoggedInUsername = '';
            const shoppingCartStore = useShoppingCartStore()
            shoppingCartStore.clearCart()
        }
    }
})
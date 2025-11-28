import { defineStore } from 'pinia'
import type { User } from '@/types/User'
import { useShoppingCartStore } from '@/stores/ShoppingCartStore';
import { isAlphanumeric } from '@/utils/validators';

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
        // Register a new user, store the information inside userList
        registerNewUser(usernameInput: string, passwordInput: string) {
            // Verify username and password length
            if (usernameInput.length < 5 || passwordInput.length < 5) {
                return 'registerFailedInputLength';
            }

            // Verify username for special characters
            if (isAlphanumeric(usernameInput) == false) {
                return 'registerFailedSpecialCharacters';
            }

            // Check for duplicated username
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
        },

        // Authenticate a user for login
        loginUser(usernameInput: string, passwordInput: string) {
            if (usernameInput && passwordInput) { // Check for blank inputs
                const index = this.userList.findIndex(user => user.username === usernameInput);

                if (index !== -1) {
                    if (passwordInput === this.userList[index]?.password) {
                        this.isLoggedIn = true;
                        this.LoggedInUsername = this.userList[index].username
                        return true;
                    }
                }
            }
        },

        // Logout user and clear the shopping cart
        logoutUser() {
            this.isLoggedIn = false;
            this.LoggedInUsername = '';
            const shoppingCartStore = useShoppingCartStore()
            shoppingCartStore.clearCart()
        },
    }
})
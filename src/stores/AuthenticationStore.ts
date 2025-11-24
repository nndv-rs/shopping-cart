import { defineStore } from 'pinia'
import type { User } from '@/types/User'
import { useShoppingCartStore } from '@/stores/ShoppingCartStore';
import { database } from '@/main';
import { collection, query, where, doc, addDoc, getDocs, updateDoc, deleteDoc } from "firebase/firestore";

export const useAuthenticationStore = defineStore('authenticationStore', {
    state: () => ({
        isLoggedIn: false as boolean,
        LoggedInUsername: '' as string,
    }),

    getters: {
        getLoginStatus: (state) => state.isLoggedIn,

        getLoggedInUsername: (state) => state.LoggedInUsername,
    },

    actions: {
        // Register a new user, save new user data to Firebase
        async registerNewUser(usernameInput: string, passwordInput: string) {
             const q = query(
                collection(database, "users"),
                where("username", "==", usernameInput)
            );
            const querySnapshot = await getDocs(q);

            // If username is not already taken, continue with the registeration
            if (querySnapshot.empty) {
                const newUser: User = {
                    username: usernameInput,
                    password: passwordInput
                }
                await addDoc(collection(database, "users"), newUser);
                return 'registerSuccess'
            } else {
                return 'registerFailedDuplicatedUsername'
            }
        },

        // Authenticate a user credentials for login
        async loginUser(usernameInput: string, passwordInput: string) {
            const q = query(
                collection(database, "users"),
                where("username", "==", usernameInput)
            );
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return null;
            } else {
                const userToAuthenticate = querySnapshot.docs[0]?.data() as User;
                if (userToAuthenticate?.username === usernameInput && userToAuthenticate?.password === passwordInput) {
                    this.isLoggedIn = true;
                    this.LoggedInUsername = userToAuthenticate.username;
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
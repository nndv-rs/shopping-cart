<script setup lang="ts">
import '@/assets/css/AuthenticationPages.css'
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useModal } from '@/composables/useModal'
import { useAuthenticationStore } from '@/stores/AuthenticationStore';
import { isAlphanumeric } from '@/utils/validators';

// Router
const router = useRouter();
const go = (path: string) => router.push(path);

// Global data
const authenticationStore = useAuthenticationStore()

// Modal
const { showError, showSuccess } = useModal();

// Input fields
const username = ref('')
const password = ref('')
const confirmPassword = ref('')

// Registeration status messages
enum RegisterStatusMessages {
    Success = "New user registered, logging in to your new account ...",
    InputLength = "Username and password must be at least 5 characters long.",
    SpecialCharacters = "Username cannot contain special characters (including space).",
    DuplicateUsername = "This username already existed. Please choose another username.",
    ConfirmPassword = "Password confirmation does not match. Please check again.",
    Unknown = "An unknown error has occcured. Please try again.",
}

// Function for registering a new user
function register() {
    // Form validations: username/password length, username special characters and matching confirm passwords
    if (username.value.length < 5 || password.value.length < 5) {
        showError(RegisterStatusMessages.InputLength);
        return;
    }
    if (isAlphanumeric(username.value) == false) {
        showError(RegisterStatusMessages.SpecialCharacters)
        return;
    }
    if (password.value !== confirmPassword.value) {
        showError(RegisterStatusMessages.ConfirmPassword)
        return;
    } 

    // Store validations:
    const registerStatus = authenticationStore.registerNewUser(username.value, password.value)
    switch(registerStatus) {
        // Registeration is successful, attempt to login into the new account and go to home page
        case 'registerSuccess':
            showSuccess(RegisterStatusMessages.Success)
            authenticationStore.loginUser(username.value, password.value)
            go('/')
            break;

        // Username and/or password length
        case 'registerFailedInputLength':
            showError(RegisterStatusMessages.InputLength)
            break;

        // Username contains special characters
        case 'registerFailedSpecialCharacters':
            showError(RegisterStatusMessages.SpecialCharacters)
            break;

        // Username already existed in the database
        case 'registerFailedDuplicatedUsername':
            showError(RegisterStatusMessages.DuplicateUsername)
            break;

        // Fallback error
        default:
            showError(RegisterStatusMessages.Unknown)
            break;
    }
}     
</script>

<template>
    <div class="page-root">
        <header class="page-header">
        <div class="header-left">
            <h1 class="site-title">ShoppingCart</h1>
        </div>
        <nav class="header-nav">
            <!-- Empty for now -->
        </nav>
        </header>
        <main class="page-content home-hero">
        <!-- Hero Section -->
        <section class="hero-card">
            <div class="form-header">
                <h2>Create Account</h2>
                <p class="form-subtitle">Join us and start shopping</p>
            </div>
            <form class="form" @submit.prevent="register">
                <div class="form-group">
                    <label for="username">Username*</label>
                    <div class="input-wrapper">
                        <input v-model="username" id="username" type="text" placeholder="Choose a username" required />
                    </div>
                </div>
                <div class="form-group">
                    <label for="password">Password*</label>
                    <div class="input-wrapper">
                        <input v-model="password" id="password" type="password" placeholder="Create a password" required />
                    </div>
                </div>
                <div class="form-group">
                    <label for="password">Confirm Password*</label>
                    <div class="input-wrapper">
                        <input v-model="confirmPassword" id="password-confirm" type="password" placeholder="Retype your password" required />
                    </div>
                </div>
                <button type="submit" class="btn btn-primary">Register</button>
                <button class="btn btn-primary"  @click="go('/pages/login')">Already have an account ?</button>
            </form>
        </section>
        </main>
    </div>
</template>

<style scoped>

</style>

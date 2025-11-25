<script setup lang="ts">
import { ref, watch } from 'vue'
import '@/assets/css/ComponentSearch.css'

const searchText = ref<String>('')

const emit = defineEmits(['submitSearch'])

function submitSearch() {
    emit('submitSearch', searchText.value)
}
</script>

<template>
    <div class="search-bar">
        <p>Type to Search: <input v-model="searchText" placeholder="Search ..."/></p>
        <button class="search-btn" @click="submitSearch">Search</button>
    </div>
</template>

<style scoped>

</style>

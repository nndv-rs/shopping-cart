<script setup lang="ts">
import { ref, watch } from 'vue'

const searchText = ref<String>('')

const emit = defineEmits(['updateSearch'])

watch(searchText, (newValue) => {
    emit('updateSearch', newValue)
})
</script>

<template>
    <div class="search-bar">
        <p>Type to Search: <input v-model="searchText" placeholder="Search ..."/></p>
    </div>
</template>

<style scoped>

</style>

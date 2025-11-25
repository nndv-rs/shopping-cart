<script setup lang="ts">
import '@/assets/css/ComponentSort.css'
import { computed } from 'vue'
import type { PropType } from 'vue'

const props = defineProps({
    label: { type: String, required: true },
    currentSortKey: { type: String as PropType<string | null>, default: null },
    currentSortDirection: { type: String as PropType<'asc' | 'desc' | null>, default: null }
});

const emit = defineEmits(['updateSort'])

// Search icon toggling
const icon = computed(() => {
    if (props.currentSortKey !== props.label) return '';
    if (props.currentSortDirection === 'asc') return '▲';
    if (props.currentSortDirection === 'desc') return '▼';
    return '';
})

function emitSort() {
    emit('updateSort', props.label)
}
</script>

<template>
    <button class="sort-btn" @click="emitSort">{{ icon || 'SORT' }}</button>
</template>

<style scoped>

</style>
<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'

const props = defineProps({
    label: { type: String, required: true },
    currentSortKey: { type: String as PropType<string | null>, default: null },
    currentSortDirection: { type: String as PropType<'ASC' | 'DES' | null>, default: null }
});

const emit = defineEmits(['updateSort'])

const icon = computed(() => {
    if (props.currentSortKey !== props.label) return '';
    if (props.currentSortDirection === 'ASC') return '▲';
    if (props.currentSortDirection === 'DES') return '▼';
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
.sort-btn {
    background: linear-gradient(90deg,#7c3aed,#06b6d4);
    color: white;
    border: none;
    padding: 6px 10px;
    border-radius: 8px;
    cursor: pointer;
}
</style>
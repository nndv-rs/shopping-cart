<script setup lang="ts">
import '@/assets/css/ComponentModalConfirmation.css'
import { useModal } from '@/composables/useModal'

const modal = useModal()

const modalState = modal.modalState
const closeModal = modal.closeModal

function handleConfirm() {
    modalState.value?.onConfirm?.()
    closeModal()
}
</script>

<template>
    <Teleport to="body">
        <div v-if="modalState" class="modal-overlay">
            <div class="modal-card">
                <header class="modal-header">
                    <h3>{{ modalState.title }}</h3>
                </header>
                <div class="modal-body">
                    <p>{{ modalState.message }}</p>
                </div>
                <footer class="modal-actions">
                    <button v-if="modalState.showConfirm" class="btn confirm" @click="handleConfirm">Confirm</button>
                    <button class="btn cancel" @click="closeModal">Cancel</button>
                </footer>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>

</style>

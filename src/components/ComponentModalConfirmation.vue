<script setup lang="ts">
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
/* Modern modal styles */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(2,6,23,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    z-index: 1000;
}

.modal-card {
    width: 100%;
    max-width: 520px;
    background: linear-gradient(180deg,#ffffff,#fbfbff);
    border-radius: 12px;
    box-shadow: 0 12px 40px rgba(2,6,23,0.2);
    overflow: hidden;
}

.modal-header { padding: 18px; border-bottom: 1px solid #f1f5f9; }
.modal-header h3 { margin: 0; color: #0f172a; }

.modal-body { padding: 18px; color: #334155; }

.modal-actions { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 18px; border-top: 1px solid #f1f5f9; }

.btn { padding: 8px 12px; border-radius: 8px; cursor: pointer; border: none; }
.btn.confirm { background: linear-gradient(90deg,#7c3aed,#06b6d4); color: #fff; }
.btn.cancel { background: #f1f5f9; color: #0f172a; }
</style>

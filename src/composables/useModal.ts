import { ref, readonly } from 'vue'

interface ModalOptions {
    title: string
    message: string
    showConfirm: boolean
    onConfirm?: () => void
}

const modalState = ref<ModalOptions | null>(null)

export function useModal() {
    function showModal(options: ModalOptions) {
        modalState.value = options
    }

    function closeModal() {
        modalState.value = null
    }

    return {
        modalState: readonly(modalState),
        showModal,
        closeModal,
    }
}
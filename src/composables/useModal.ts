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

    function showSuccess(message: string) {
        showModal({
            title: 'Success',
            message,
            showConfirm: false
        });
    }

    function showError(message: string) {
        showModal({
            title: 'Error',
            message,
            showConfirm: false
        });
    }

    function showInfo(message: string) {
        showModal({
            title: 'Info',
            message,
            showConfirm: false
        });
    }

    function closeModal() {
        modalState.value = null
    }

    return {
        modalState: readonly(modalState),
        showModal,
        showSuccess,
        showError,
        showInfo,
        closeModal,
    }
}


let toastId = 0;

export function showMedicineToast(title: string, body: string) {
  window.dispatchEvent(
    new CustomEvent('medicine-toast', { detail: { id: ++toastId, title, body } }),
  );
}

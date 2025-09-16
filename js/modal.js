/**
 * Muestra un modal de confirmación y ejecuta un callback si el usuario acepta.
 * @param {string} title - El título del modal.
 * @param {string} content - El mensaje de confirmación.
 * @param {function} onAccept - La función a ejecutar si se acepta.
 */
export function showConfirmModal(title, content, onAccept) {
  try {
    const modalElement = document.getElementById("confirm-modal");
    if (!modalElement) {
      console.warn(
        "[showConfirmModal] No existe #confirm-modal en el DOM. Usando confirm() fallback."
      );
      if (window.confirm(`${title}\n\n${content.replace(/<[^>]*>?/gm, "")}`)) {
        if (typeof onAccept === "function") onAccept();
      }
      return;
    }

    const modalTitle = modalElement.querySelector("#confirm-modal-title");
    const modalContent = modalElement.querySelector("#confirm-modal-content");
    const acceptButton = modalElement.querySelector("#confirm-modal-accept");

    if (modalTitle) modalTitle.textContent = title;
    if (modalContent) modalContent.innerHTML = content; // Usamos innerHTML para permitir HTML simple

    // Aseguramos instancia de Materialize, si no existe usamos fallback
    let modalInstance = (window.M && M.Modal.getInstance(modalElement)) || null;
    if (!modalInstance && window.M && M.Modal) {
      try {
        modalInstance = M.Modal.init(modalElement, { dismissible: true });
      } catch (e) {
        console.warn("[showConfirmModal] Error inicializando modal Materialize:", e);
      }
    }
    if (!modalInstance) {
      console.warn(
        "[showConfirmModal] No se pudo obtener/crear instancia de modal. Usando confirm() fallback."
      );
      if (window.confirm(`${title}\n\n${content.replace(/<[^>]*>?/gm, "")}`)) {
        if (typeof onAccept === "function") onAccept();
      }
      return;
    }

    // Clonamos el botón para eliminar listeners anteriores y evitar ejecuciones múltiples
    if (acceptButton) {
      const newAcceptButton = acceptButton.cloneNode(true);
      acceptButton.parentNode.replaceChild(newAcceptButton, acceptButton);
      newAcceptButton.addEventListener("click", () => {
        try {
          if (typeof onAccept === "function") onAccept();
        } finally {
          modalInstance.close();
        }
      });
    }

    modalInstance.open();
  } catch (err) {
    console.error("[showConfirmModal] Excepción inesperada:", err);
    if (window.confirm(`${title}\n\n${content.replace(/<[^>]*>?/gm, "")}`)) {
      if (typeof onAccept === "function") onAccept();
    }
  }
}

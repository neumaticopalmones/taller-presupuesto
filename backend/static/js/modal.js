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
    const cancelButton = modalElement.querySelector("#confirm-modal-cancel");

    if (modalTitle) modalTitle.textContent = title;
    if (modalContent) modalContent.innerHTML = content;

    // Función para cerrar el modal
    const closeModal = () => {
      modalElement.classList.remove("show");
      setTimeout(() => {
        modalElement.style.display = "none";
      }, 300);
    };

    // Mostrar el modal
    modalElement.style.display = "flex";
    setTimeout(() => {
      modalElement.classList.add("show");
    }, 10);

    // Clonamos los botones para eliminar listeners anteriores
    if (acceptButton) {
      const newAcceptButton = acceptButton.cloneNode(true);
      acceptButton.parentNode.replaceChild(newAcceptButton, acceptButton);
      newAcceptButton.addEventListener("click", () => {
        try {
          if (typeof onAccept === "function") onAccept();
        } finally {
          closeModal();
        }
      });
    }

    if (cancelButton) {
      const newCancelButton = cancelButton.cloneNode(true);
      cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);
      newCancelButton.addEventListener("click", closeModal);
    }

    // Cerrar al hacer clic en el fondo
    modalElement.addEventListener("click", (e) => {
      if (e.target === modalElement) {
        closeModal();
      }
    });

    // Cerrar con ESC
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        closeModal();
        document.removeEventListener("keydown", handleEscape);
      }
    };
    document.addEventListener("keydown", handleEscape);
  } catch (err) {
    console.error("[showConfirmModal] Excepción inesperada:", err);
    if (window.confirm(`${title}\n\n${content.replace(/<[^>]*>?/gm, "")}`)) {
      if (typeof onAccept === "function") onAccept();
    }
  }
}

/**
 * Muestra un modal de información.
 * @param {string} title - El título del modal.
 * @param {string} content - El mensaje de información.
 */
export function showInfoModal(title, content) {
  try {
    const modalElement = document.getElementById("info-modal");
    if (!modalElement) {
      console.warn("[showInfoModal] No existe #info-modal en el DOM.");
      alert(`${title}\n\n${content.replace(/<[^>]*>?/gm, "")}`);
      return;
    }

    const modalTitle = modalElement.querySelector("#info-modal-title");
    const modalContent = modalElement.querySelector("#info-modal-content");
    const closeButton = modalElement.querySelector("#info-modal-close");

    if (modalTitle) modalTitle.textContent = title;
    if (modalContent) modalContent.innerHTML = content;

    // Función para cerrar el modal
    const closeModal = () => {
      modalElement.classList.remove("show");
      setTimeout(() => {
        modalElement.style.display = "none";
      }, 300);
    };

    // Mostrar el modal
    modalElement.style.display = "flex";
    setTimeout(() => {
      modalElement.classList.add("show");
    }, 10);

    if (closeButton) {
      const newCloseButton = closeButton.cloneNode(true);
      closeButton.parentNode.replaceChild(newCloseButton, closeButton);
      newCloseButton.addEventListener("click", closeModal);
    }

    // Cerrar al hacer clic en el fondo
    modalElement.addEventListener("click", (e) => {
      if (e.target === modalElement) {
        closeModal();
      }
    });
  } catch (err) {
    console.error("[showInfoModal] Excepción inesperada:", err);
    alert(`${title}\n\n${content.replace(/<[^>]*>?/gm, "")}`);
  }
}

/**
 * Muestra un modal de error.
 * @param {string} title - El título del modal.
 * @param {string} content - El mensaje de error.
 */
export function showErrorModal(title, content) {
  try {
    const modalElement = document.getElementById("error-modal");
    if (!modalElement) {
      console.warn("[showErrorModal] No existe #error-modal en el DOM.");
      alert(`ERROR: ${title}\n\n${content.replace(/<[^>]*>?/gm, "")}`);
      return;
    }

    const modalTitle = modalElement.querySelector("#error-modal-title");
    const modalContent = modalElement.querySelector("#error-modal-content");
    const closeButton = modalElement.querySelector("#error-modal-close");

    if (modalTitle) modalTitle.textContent = title;
    if (modalContent) modalContent.innerHTML = content;

    // Función para cerrar el modal
    const closeModal = () => {
      modalElement.classList.remove("show");
      setTimeout(() => {
        modalElement.style.display = "none";
      }, 300);
    };

    // Mostrar el modal
    modalElement.style.display = "flex";
    setTimeout(() => {
      modalElement.classList.add("show");
    }, 10);

    if (closeButton) {
      const newCloseButton = closeButton.cloneNode(true);
      closeButton.parentNode.replaceChild(newCloseButton, closeButton);
      newCloseButton.addEventListener("click", closeModal);
    }

    // Cerrar al hacer clic en el fondo
    modalElement.addEventListener("click", (e) => {
      if (e.target === modalElement) {
        closeModal();
      }
    });
  } catch (err) {
    console.error("[showErrorModal] Excepción inesperada:", err);
    alert(`ERROR: ${title}\n\n${content.replace(/<[^>]*>?/gm, "")}`);
  }
}

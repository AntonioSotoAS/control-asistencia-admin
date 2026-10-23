/**
 * Registro y gestión del Service Worker para la PWA
 * Autor: Antonio Soto
 */
export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        // Comprobar actualizaciones periódicamente
        registration.addEventListener("updatefound", () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.addEventListener("statechange", () => {
              if (
                installingWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                console.info(
                  "[PWA] Nueva versión disponible. Se actualizará al reiniciar."
                );
              }
            });
          }
        });
      })
      .catch((error) => {
        console.warn("[PWA] Error al registrar el Service Worker:", error);
      });
  });
}

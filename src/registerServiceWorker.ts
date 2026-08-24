/**
 * Service Worker Registration for SAYHPro PWA
 */
export function registerServiceWorker() {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("SAYHPro PWA ServiceWorker registered with scope:", reg.scope);

          // Listen for new service worker updates
          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === "installed") {
                  if (navigator.serviceWorker.controller) {
                    console.log("New content is available; please refresh.");
                  } else {
                    console.log("Content is cached for offline use.");
                  }
                }
              };
            }
          };
        })
        .catch((error) => {
          console.warn("PWA ServiceWorker registration failed:", error);
        });
    });
  }
}

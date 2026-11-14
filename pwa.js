(() => {
  const installStyle = document.createElement("style");
  installStyle.textContent = `
    .hw-install-button{border:1px solid #ffffff70;border-radius:10px;padding:9px 13px;background:rgba(255,255,255,.12);color:#fff;font:700 14px/1.2 system-ui,sans-serif;cursor:pointer}
    .hw-install-button:hover{background:rgba(255,255,255,.2)}
    .hw-install-button:focus-visible{outline:3px solid #f2c66d;outline-offset:3px}
    .hw-install-help{position:fixed;inset:auto 16px 96px auto;z-index:1100;max-width:min(360px,calc(100vw - 32px));padding:16px 18px;border:1px solid #b9daca;border-radius:14px;background:#fff;color:#14251e;box-shadow:0 18px 45px #10271e30;font:14px/1.55 system-ui,sans-serif}
    .hw-install-help button{float:right;border:0;background:transparent;font-size:20px;cursor:pointer;color:inherit}
    @media(max-width:800px){.hw-install-button{padding:9px 10px}.hw-install-help{left:16px;right:16px;bottom:100px}}
  `;
  document.head.append(installStyle);

  const nav = document.querySelector(".nav");
  if (nav) {
    const installButton = document.createElement("button");
    installButton.type = "button";
    installButton.className = "hw-install-button";
    installButton.textContent = "Install app";
    installButton.setAttribute("aria-label", "Install Humanity World app");
    nav.append(installButton);

    let pendingInstall = null;
    let isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

    function showInstallHelp(message) {
      document.querySelector(".hw-install-help")?.remove();
      const panel = document.createElement("aside");
      panel.className = "hw-install-help";
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-label", "Install Humanity World");
      const close = document.createElement("button");
      close.type = "button";
      close.setAttribute("aria-label", "Close install help");
      close.textContent = "×";
      close.addEventListener("click", () => panel.remove());
      const text = document.createElement("span");
      text.textContent = message;
      panel.append(close, text);
      document.body.append(panel);
    }

    if (isStandalone) installButton.hidden = true;

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      pendingInstall = event;
      installButton.hidden = false;
    });

    installButton.addEventListener("click", async () => {
      if (pendingInstall) {
        pendingInstall.prompt();
        await pendingInstall.userChoice;
        pendingInstall = null;
        return;
      }
      if (isIos) {
        showInstallHelp("To install: tap the Share button in Safari, then choose “Add to Home Screen.” If you are in another iOS browser, open this page in Safari first.");
      } else {
        showInstallHelp("Use your browser’s menu and choose “Install app” or “Add to Home screen.” The option appears when your browser supports PWA installation.");
      }
    });

    window.addEventListener("appinstalled", () => {
      installButton.hidden = true;
      pendingInstall = null;
    });
  }

  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error) => {
        console.warn("Offline app support could not be enabled:", error.message);
      });
    }, { once: true });
  }
})();

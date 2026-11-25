const serviceWorkerPath = window.location.pathname.includes('/pages/') ? '../sw.js' : 'sw.js';
const updateButton = document.querySelector('[data-update-app]');
const updateStatus = document.querySelector('[data-update-status]');
const workers = navigator.serviceWorker;

if (workers && updateButton && updateStatus) {
  setupUpdates();
}

function setupUpdates() {
  const checkInterval = 120_000;
  let controller = workers.controller;
  let registration;
  let lastCheck = 0;
  let activationTimeout;

  function revealUpdate() {
    if (!updateButton.hidden) return;
    updateButton.hidden = false;
    updateStatus.textContent = 'An update is ready.';
  }

  function controllerChanged() {
    const next = workers.controller;
    if (!next || controller === next) return;
    const replacing = Boolean(controller);
    controller = next;

    if (activationTimeout) {
      clearTimeout(activationTimeout);
      activationTimeout = undefined;
      updateButton.disabled = false;
      updateButton.textContent = 'Update app';
      window.location.reload();
    } else if (replacing) {
      revealUpdate();
    }
  }

  function retryUpdate() {
    clearTimeout(activationTimeout);
    activationTimeout = undefined;
    updateButton.disabled = false;
    updateButton.textContent = 'Retry update';
    updateStatus.textContent = 'Update delayed. Select Retry update.';
  }

  workers.addEventListener('controllerchange', controllerChanged);
  updateButton.addEventListener('click', () => {
    const waiting = registration?.waiting;
    if (!waiting) {
      window.location.reload();
      return;
    }

    updateButton.disabled = true;
    updateButton.textContent = 'Updating…';
    activationTimeout = setTimeout(retryUpdate, 10_000);
    try {
      waiting.postMessage({ type: 'SKIP_WAITING' });
    } catch {
      retryUpdate();
    }
  });

  function showWaiting() {
    if (registration.waiting && (workers.controller || registration.active)) revealUpdate();
  }

  function watchInstallation() {
    registration.installing?.addEventListener('statechange', showWaiting);
  }

  function checkForUpdate(force = false) {
    if (document.hidden) return;
    controllerChanged();
    showWaiting();
    const now = Date.now();
    if (!navigator.onLine || registration.waiting || registration.installing ||
        (force !== true && now - lastCheck < checkInterval)) return;
    lastCheck = now;
    registration.update().then(showWaiting).catch(() => {});
  }

  workers.register(new URL(serviceWorkerPath, document.baseURI), { updateViaCache: 'none' })
    .then((registered) => {
      registration = registered;
      registration.addEventListener('updatefound', watchInstallation);
      watchInstallation();
      checkForUpdate();

      document.addEventListener('visibilitychange', checkForUpdate);
      window.addEventListener('focus', checkForUpdate);
      window.setInterval(checkForUpdate, checkInterval);
      window.addEventListener('online', () => checkForUpdate(true));
      window.addEventListener('pageshow', (event) => {
        if (event.persisted) checkForUpdate();
      });
    })
    .catch(() => {});
}

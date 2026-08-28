if ('serviceWorker' in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing || sessionStorage.getItem('ml-sw-refreshed') === '1') return;
    refreshing = true;
    sessionStorage.setItem('ml-sw-refreshed', '1');
    window.location.reload();
  });
  navigator.serviceWorker.register('/sw.js').then((registration) => registration.update()).catch((error) => {
    console.warn('Service worker registration failed:', error);
  });
}

const serviceWorkerPath = window.location.pathname.includes('/pages/') ? '../sw.js' : 'sw.js';
navigator.serviceWorker?.register(new URL(serviceWorkerPath, document.baseURI))?.catch(()=>{})

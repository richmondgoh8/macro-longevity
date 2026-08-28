// Native modal controller. Loaded only when an interaction opens a dialog.

const modalStates = new WeakMap();

function supportsDialogClosedBy() {
  return typeof HTMLDialogElement !== 'undefined' && 'closedBy' in HTMLDialogElement.prototype;
}

function focusDialogTarget(target) {
  if (!target || typeof target.focus !== 'function') return;
  target.focus({ preventScroll: true });
}

function finishModalClose(dialog, returnValue) {
  if (!dialog.open) return;
  dialog.classList.remove('is-open', 'is-closing');
  dialog.close(returnValue);
}

function ensureModalDialog(dialog) {
  let state = modalStates.get(dialog);
  if (state) return state;

  state = { returnFocus: null, scrollPosition: { x: 0, y: 0 }, lightDismiss: false, closePromise: null };
  modalStates.set(dialog, state);

  dialog.addEventListener('cancel', (event) => {
    if (!dialog.open) return;
    event.preventDefault();
    closeModalDialog(dialog, 'cancel');
  });

  dialog.addEventListener('click', (event) => {
    if (!state.lightDismiss || supportsDialogClosedBy() || event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    const insideDialog = event.clientX >= rect.left && event.clientX <= rect.right
      && event.clientY >= rect.top && event.clientY <= rect.bottom;
    if (!insideDialog) closeModalDialog(dialog, 'cancel');
  });

  dialog.addEventListener('close', () => {
    dialog.classList.remove('is-open', 'is-closing');
    const returnFocus = state.returnFocus;
    const scrollPosition = state.scrollPosition;
    const resolve = state.closePromise?.resolve;
    state.closePromise = null;
    focusDialogTarget(returnFocus);
    window.scrollTo({ ...scrollPosition, behavior: 'instant' });
    resolve?.();
  });

  return state;
}

export function openModalDialog(dialog, { initialFocus = null, returnFocus = document.activeElement, lightDismiss = false } = {}) {
  if (!dialog) return;
  const state = ensureModalDialog(dialog);
  state.returnFocus = returnFocus;
  state.scrollPosition = { x: window.scrollX, y: window.scrollY };
  state.lightDismiss = lightDismiss;
  dialog.setAttribute('closedby', lightDismiss ? 'any' : 'closerequest');
  dialog.classList.remove('is-closing', 'is-open');
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
  requestAnimationFrame(() => {
    if (!dialog.open) return;
    dialog.classList.add('is-open');
    focusDialogTarget(initialFocus);
  });
}

export function closeModalDialog(dialog, returnValue = 'cancel') {
  if (!dialog?.open) return Promise.resolve();
  const state = ensureModalDialog(dialog);
  if (state.closePromise) return state.closePromise.promise;
  state.closePromise = {};
  state.closePromise.promise = new Promise((resolve) => { state.closePromise.resolve = resolve; });
  dialog.classList.remove('is-open');
  dialog.classList.add('is-closing');
  const finish = () => finishModalClose(dialog, returnValue);
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    finish();
  } else {
    const timer = window.setTimeout(finish, 160);
    dialog.addEventListener('transitionend', (event) => {
      if (event.propertyName === 'opacity') {
        window.clearTimeout(timer);
        finish();
      }
    }, { once: true });
  }
  return state.closePromise.promise;
}

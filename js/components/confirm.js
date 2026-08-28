import { icon } from './ui.js';
import { closeModalDialog, openModalDialog } from './modal.js';

let confirmResolver = null;

function confirmationDialog() {
  let dialog = document.querySelector('[data-confirm-dialog]');
  if (dialog) return dialog;
  dialog = document.createElement('dialog');
  dialog.className = 'ui-modal ui-confirm-dialog';
  dialog.dataset.confirmDialog = '';
  dialog.innerHTML = `<form method="dialog" class="ui-modal-form ui-confirm-form">
    <div class="ui-modal-head ui-confirm-head"><div><p class="eyebrow">Please confirm</p><h2 id="confirm-dialog-title" data-confirm-title></h2></div><button type="submit" value="cancel" class="ui-icon-button" aria-label="Close" data-tooltip-trigger>${icon('close')}<span class="ui-tooltip" role="tooltip">Close</span></button></div>
    <p id="confirm-dialog-summary" class="ui-confirm-summary" data-confirm-summary></p>
    <div class="ui-confirm-details" data-confirm-details hidden></div>
    <div class="ui-modal-actions ui-confirm-actions"><button type="submit" value="cancel" class="button button-secondary" data-confirm-cancel>Cancel</button><button type="submit" value="confirm" class="button button-danger" data-confirm-submit>Delete</button></div>
  </form>`;
  dialog.setAttribute('aria-labelledby', 'confirm-dialog-title');
  dialog.setAttribute('aria-describedby', 'confirm-dialog-summary');
  dialog.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();
    closeModalDialog(dialog, event.submitter?.value || 'cancel');
  });
  dialog.addEventListener('close', () => {
    const confirmed = dialog.returnValue === 'confirm';
    const resolve = confirmResolver;
    confirmResolver = null;
    resolve?.(confirmed);
  });
  document.body.append(dialog);
  return dialog;
}

export function confirmAction({ title, summary, details = '', confirmLabel = 'Delete', returnFocus = document.activeElement } = {}) {
  const dialog = confirmationDialog();
  if (dialog.open) dialog.close('cancel');
  dialog.querySelector('[data-confirm-title]').textContent = String(title || 'Confirm action');
  dialog.querySelector('[data-confirm-summary]').textContent = String(summary || 'This action cannot be undone.');
  const detailsNode = dialog.querySelector('[data-confirm-details]');
  detailsNode.textContent = String(details || '');
  detailsNode.hidden = !details;
  dialog.querySelector('[data-confirm-submit]').textContent = String(confirmLabel);
  const promise = new Promise((resolve) => { confirmResolver = resolve; });
  openModalDialog(dialog, { initialFocus: dialog.querySelector('[data-confirm-cancel]'), returnFocus, lightDismiss: false });
  return promise;
}

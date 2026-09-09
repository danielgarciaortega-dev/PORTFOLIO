const copyButton =
  document.querySelector<HTMLButtonElement>('[data-copy-email]');
const emailValue = document.querySelector<HTMLElement>('[data-email-value]');
const copyStatus = document.querySelector<HTMLElement>('[data-copy-status]');

function selectEmail(element: HTMLElement) {
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(element);
  selection?.removeAllRanges();
  selection?.addRange(range);
}

if (copyButton && emailValue && copyStatus) {
  copyButton.addEventListener('click', async () => {
    const email = emailValue.textContent?.trim();
    if (!email) return;

    try {
      if (!navigator.clipboard) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(email);
      copyStatus.textContent = copyStatus.dataset.copySuccess ?? '';
    } catch {
      selectEmail(emailValue);
      copyStatus.textContent = copyStatus.dataset.copyFallback ?? '';
    }
  });
}

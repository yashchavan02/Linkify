const form = document.getElementById('shorten-form');
const longUrlInput = document.getElementById('longUrl');
const submitButton = form?.querySelector('button[type="submit"]');

const result = document.getElementById('result');
const shortUrlInput = document.getElementById('shortUrl');
const originalUrlInput = document.getElementById('originalUrl');
const resultMsg = document.getElementById('resultMsg');
const visitBtn = document.getElementById('visitBtn');
const shareBtn = document.getElementById('shareBtn');
const copyBtn = document.getElementById('copyBtn');
const againBtn = document.getElementById('againBtn');

async function shortenUrl(originalUrl) {
  const response = await fetch('/api/url/shorten', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ originalUrl })
  });
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();
  if (!response.ok) {
    const message = typeof payload === 'object' && payload && payload.message ? payload.message : (typeof payload === 'string' ? payload : 'Failed to shorten URL');
    throw new Error(message);
  }
  return payload;
}

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const longUrl = longUrlInput.value.trim();
  if (!longUrl) return;

  result.classList.add('hidden');
  resultMsg.textContent = '';
  const formError = document.getElementById('formError');
  if (formError) formError.textContent = '';

  // button-only loading state
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.classList.add('loading');
    submitButton.textContent = 'Shortening...';
    submitButton.style.paddingLeft = '40px';
  }

  try {
    const data = await shortenUrl(longUrl);
    const shortPath = data.shortUrl || data.short || data.id || '';
    const origin = window.location.origin;
    const fullShortUrl = shortPath.startsWith('http') ? shortPath : `${origin}/${shortPath}`;

    shortUrlInput.value = fullShortUrl;
    if (originalUrlInput) originalUrlInput.value = longUrl;

    // show results, hide form
    result.classList.remove('hidden');
    form.classList.add('hidden');

    // wire actions
    visitBtn.href = fullShortUrl;
  } catch (err) {
    const formError = document.getElementById('formError');
    if (formError) formError.textContent = err.message || 'The URL is not valid';
    longUrlInput.value = '';
    result.classList.add('hidden');
  } finally {
    // remove loading state only if form remains visible
    if (!form.classList.contains('hidden') && submitButton) {
      submitButton.disabled = false;
      submitButton.classList.remove('loading');
      submitButton.textContent = 'Shorten url';
      submitButton.style.paddingLeft = '';
    }
  }
});

copyBtn?.addEventListener('click', async () => {
  const value = shortUrlInput.value;
  if (!value) return;
  try {
    await navigator.clipboard.writeText(value);
    resultMsg.textContent = 'Copied to clipboard!';
  } catch {
    resultMsg.textContent = 'Copy failed. Select and press Ctrl+C.';
  }
});

shareBtn?.addEventListener('click', async () => {
  const url = shortUrlInput.value;
  if (!url) return;
  try {
    if (navigator.share) {
      await navigator.share({ url, title: 'Short link', text: 'Here is a short link' });
      resultMsg.textContent = 'Shared!';
    } else {
      await navigator.clipboard.writeText(url);
      resultMsg.textContent = 'Share not supported. Copied instead!';
    }
  } catch {
    resultMsg.textContent = 'Share canceled or failed.';
  }
});

againBtn?.addEventListener('click', () => {
  // reset UI to allow another shorten
  form.reset();
  resultMsg.textContent = '';
  result.classList.add('hidden');
  form.classList.remove('hidden');
  longUrlInput.focus();
  // reset submit button state
  if (submitButton) {
    submitButton.disabled = false;
    submitButton.classList.remove('loading');
    submitButton.textContent = 'Shorten url';
    submitButton.style.paddingLeft = '';
  }
  const formError = document.getElementById('formError');
  if (formError) formError.textContent = '';
});



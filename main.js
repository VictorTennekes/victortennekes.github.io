// @ts-check
// Obfuscated email: address stored reversed in data-e. First click reveals it and arms the mailto, second click opens it.
document.querySelectorAll('a.mail[data-e]').forEach(function (el) {
  const a = /** @type {HTMLAnchorElement} */ (el);
  a.title = 'click to reveal';
  a.addEventListener('click', function (ev) {
    const enc = a.getAttribute('data-e');
    if (enc === null) return;
    ev.preventDefault();
    const e = enc.split('').reverse().join('');
    a.href = 'mailto:' + e; a.textContent = e; a.removeAttribute('data-e'); a.title = '';
  });
});

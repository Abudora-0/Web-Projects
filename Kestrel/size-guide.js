/* ═══════════════════════════════════════════════
   KESTREL - size-guide.js  (cm / in toggle)
   ═══════════════════════════════════════════════ */

const toggle = document.querySelector('.info-toggle');
const cells  = [...document.querySelectorAll('.size-table td[data-cm]')];

const toInches = cm => Math.round((cm / 2.54) * 2) / 2;   // nearest half inch

function setUnit(unit) {
  toggle.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.unit === unit));
  cells.forEach(td => {
    const cm = parseFloat(td.dataset.cm);
    td.textContent = unit === 'in' ? `${toInches(cm)}"` : `${cm}`;
  });
}

toggle.addEventListener('click', e => {
  const btn = e.target.closest('button[data-unit]');
  if (btn) setUnit(btn.dataset.unit);
});

setUnit('cm');

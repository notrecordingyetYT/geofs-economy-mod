/* ui.js – GeoFS Economy & Career Mod
 * Bouwt het menu op het scherm en geeft een kleine API terug via window.EconUI.
 * Laadvolgorde: airports.js -> ui.js -> main.js
 */
(function () {
  'use strict';
  if (window.EconUI) return; // dubbel laden voorkomen

  const CSS = `
  #econ-panel{position:fixed;top:60px;right:12px;width:260px;z-index:99999;
    background:rgba(18,24,38,.93);color:#e8eefc;font:13px/1.4 system-ui,sans-serif;
    border:1px solid #3a4a6b;border-radius:10px;box-shadow:0 6px 20px rgba(0,0,0,.45);overflow:hidden}
  #econ-panel *{box-sizing:border-box}
  #econ-head{display:flex;justify-content:space-between;align-items:center;
    padding:8px 12px;background:#1f2b45;cursor:pointer;user-select:none}
  #econ-balance{font-size:16px;font-weight:700;color:#5dff9a}
  #econ-balance.neg{color:#ff6b6b}
  #econ-body{padding:10px 12px}
  #econ-body.hidden{display:none}
  .econ-row{margin-bottom:8px}
  .econ-row label{display:block;font-size:11px;color:#9fb0d3;margin-bottom:2px}
  .econ-row input{width:100%;padding:5px 7px;border-radius:5px;border:1px solid #3a4a6b;
    background:#0f1626;color:#e8eefc}
  .econ-btn{width:100%;padding:7px;margin-top:6px;border:0;border-radius:6px;
    font-weight:600;cursor:pointer;color:#fff;background:#2f6fed}
  .econ-btn:disabled{background:#3a4258;color:#8a93a8;cursor:not-allowed}
  .econ-btn.green{background:#1f9d57}
  .econ-btn.green:disabled{background:#3a4258}
  .econ-btn.red{background:#8b2b2b;font-size:11px;padding:4px}
  #econ-info{margin-top:8px;padding:6px 8px;background:#0f1626;border-radius:6px;
    font-size:12px;white-space:pre-line;min-height:56px}
  #econ-toast{margin-top:6px;font-size:12px;min-height:16px}
  #econ-toast.good{color:#5dff9a} #econ-toast.bad{color:#ff6b6b}
  `;

  function formatMoney(n) {
    const sign = n < 0 ? '-' : '';
    return sign + '$' + Math.abs(Math.round(n)).toLocaleString('nl-NL');
  }

  function field(id, label, type, value, extra) {
    const row = document.createElement('div');
    row.className = 'econ-row';
    row.innerHTML = `<label for="${id}">${label}</label>
      <input id="${id}" type="${type}" value="${value}" ${extra || ''}>`;
    return row;
  }

  let refs = null;
  let toastTimer = null;

  function init(handlers) {
    if (refs) return refs;
    handlers = handlers || {};

    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const panel = document.createElement('div');
    panel.id = 'econ-panel';

    const head = document.createElement('div');
    head.id = 'econ-head';
    head.innerHTML = `<span>✈ Career Mode</span>
      <span id="econ-balance">Saldo: $0</span>`;

    const body = document.createElement('div');
    body.id = 'econ-body';

    body.appendChild(field('econ-from', 'Vertrek (ICAO)', 'text', '', 'maxlength="4" placeholder="EBBR" style="text-transform:uppercase"'));
    body.appendChild(field('econ-to', 'Bestemming (ICAO)', 'text', '', 'maxlength="4" placeholder="EHAM" style="text-transform:uppercase"'));
    body.appendChild(field('econ-pax', 'Passagiers', 'number', '0', 'min="0" max="600" step="1"'));
    body.appendChild(field('econ-cargo', 'Cargo Gewicht (in kg)', 'number', '0', 'min="0" step="10"'));

    const startBtn = document.createElement('button');
    startBtn.id = 'econ-start';
    startBtn.className = 'econ-btn';
    startBtn.textContent = 'Vlucht Starten';

    const finishBtn = document.createElement('button');
    finishBtn.id = 'econ-finish';
    finishBtn.className = 'econ-btn green';
    finishBtn.textContent = 'Vlucht Voltooien';
    finishBtn.disabled = true;

    const resetBtn = document.createElement('button');
    resetBtn.id = 'econ-reset';
    resetBtn.className = 'econ-btn red';
    resetBtn.textContent = 'Voortgang resetten';

    const info = document.createElement('div');
    info.id = 'econ-info';
    info.textContent = 'Geen actieve vlucht.';

    const toast = document.createElement('div');
    toast.id = 'econ-toast';

    body.append(startBtn, finishBtn, info, toast, resetBtn);
    panel.append(head, body);
    document.body.appendChild(panel);

    // In-/uitklappen
    head.addEventListener('click', () => body.classList.toggle('hidden'));

    startBtn.addEventListener('click', () => {
      if (!handlers.onStart) return;
      handlers.onStart({
        from: document.getElementById('econ-from').value.trim().toUpperCase(),
        to: document.getElementById('econ-to').value.trim().toUpperCase(),
        passengers: parseInt(document.getElementById('econ-pax').value, 10) || 0,
        cargo: parseFloat(document.getElementById('econ-cargo').value) || 0
      });
    });
    finishBtn.addEventListener('click', () => handlers.onFinish && handlers.onFinish());
    resetBtn.addEventListener('click', () => {
      if (window.confirm('Weet je zeker dat je saldo en voortgang wilt resetten?')) {
        handlers.onReset && handlers.onReset();
      }
    });

    refs = {
      balance: document.getElementById('econ-balance'),
      start: startBtn,
      finish: finishBtn,
      info,
      toast,
      inputs: ['econ-from', 'econ-to', 'econ-pax', 'econ-cargo']
        .map((id) => document.getElementById(id))
    };
    return refs;
  }

  function setBalance(amount) {
    if (!refs) return;
    refs.balance.textContent = 'Saldo: ' + formatMoney(amount);
    refs.balance.classList.toggle('neg', amount < 0);
  }

  function setInfo(text) { if (refs) refs.info.textContent = text; }

  function setFinishEnabled(enabled) { if (refs) refs.finish.disabled = !enabled; }

  // Tijdens een vlucht: invoer vergrendelen en startknop uitzetten
  function setFlightActive(active) {
    if (!refs) return;
    refs.start.disabled = active;
    refs.inputs.forEach((i) => { i.disabled = active; });
    if (!active) refs.finish.disabled = true;
  }

  function setFields(values) {
    if (!refs) return;
    const map = { from: 'econ-from', to: 'econ-to', passengers: 'econ-pax', cargo: 'econ-cargo' };
    Object.keys(map).forEach((k) => {
      if (values[k] !== undefined) document.getElementById(map[k]).value = values[k];
    });
  }

  function notify(message, kind) {
    if (!refs) return;
    refs.toast.textContent = message;
    refs.toast.className = kind === 'good' ? 'good' : kind === 'bad' ? 'bad' : '';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { refs.toast.textContent = ''; }, 8000);
  }

  window.EconUI = { init, setBalance, setInfo, setFinishEnabled, setFlightActive, setFields, notify, formatMoney };
})();

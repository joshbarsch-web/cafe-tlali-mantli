(() => {
  const I = JSON.parse(document.getElementById('tlm-i18n').textContent);
  const L = I.lang, K = 'tlm-cart';
  let DATA = null;
  const $ = (s, r) => (r || document).querySelector(s);
  const fmt = (n) => '$' + n.toLocaleString('es-MX') + ' MXN';
  const get = () => { try { return JSON.parse(localStorage.getItem(K)) || []; } catch (e) { return []; } };
  const set = (c) => { localStorage.setItem(K, JSON.stringify(c)); render(); };
  const data = async () => DATA || (DATA = await (await fetch('/products.json')).json());
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const drawer = $('#cart'), bg = $('#cart-bg');
  const open = () => { drawer.hidden = false; bg.hidden = false; document.body.style.overflow = 'hidden'; render(); };
  const close = () => { drawer.hidden = true; bg.hidden = true; document.body.style.overflow = ''; };
  bg.addEventListener('click', close);
  $('#cart-close').addEventListener('click', close);
  document.querySelectorAll('.cartbtn').forEach((b) => b.addEventListener('click', open));

  window.tlmAdd = async (id, o = {}) => {
    const d = await data();
    const p = d.products.find((x) => x.id === id);
    if (!p) return;
    const c = get();
    const grind = p.kind === 'bean' ? (o.grind || 0) : undefined;
    const key = id + '|' + (grind ?? '') + '|' + (o.sub || '');
    const hit = c.find((x) => x.key === key);
    if (hit) hit.qty += o.qty || 1; else c.push({ key, id, qty: o.qty || 1, grind, sub: o.sub });
    set(c); open();
  };

  document.addEventListener('click', (e) => {
    const b = e.target.closest('.tlm-buy');
    if (!b) return;
    e.preventDefault();
    const qtyEl = $('#qty'), grindEl = $('#grind');
    tlmAdd(b.dataset.id, { qty: qtyEl ? Math.max(1, parseInt(qtyEl.textContent, 10) || 1) : 1, grind: grindEl ? +grindEl.value : 0 });
  });

  async function render() {
    const d = await data(), c = get();
    const count = c.reduce((a, l) => a + l.qty, 0);
    document.querySelectorAll('.cart-count').forEach((el) => (el.textContent = count));
    const list = $('#cart-lines');
    if (!list) return;
    let subtotal = 0;
    const lines = c.map((l) => {
      const p = d.products.find((x) => x.id === l.id);
      if (!p) return '';
      const price = l.sub ? Math.round(p.price * (1 - (d.subscriptionDiscount || 10) / 100)) : p.price;
      subtotal += price * l.qty;
      const meta = [l.sub ? d.freqs[L][l.sub] : '', fmt(price) + ' ' + I.each].filter(Boolean).join(' · ');
      const grind = p.kind === 'bean' ? `<select data-k="${esc(l.key)}" class="cart-grind">${d.grinds[L].map((g, i) => `<option value="${i}"${i === (l.grind || 0) ? ' selected' : ''}>${esc(g)}</option>`).join('')}</select>` : '';
      return `<div class="cart-line"><img src="${esc(p.image || d.logo)}" alt=""><div class="cart-mid"><b>${esc(p.name[L])}</b><span>${esc(meta)}</span>${grind}<div class="cart-qty"><button data-k="${esc(l.key)}" data-d="-1">−</button><span>${l.qty}</span><button data-k="${esc(l.key)}" data-d="1">+</button><button data-k="${esc(l.key)}" data-d="-999" class="cart-rm">${I.remove}</button></div></div><b>${fmt(price * l.qty)}</b></div>`;
    }).join('');
    list.innerHTML = lines || `<p class="cart-empty">${I.cartEmpty}</p>`;
    const ship = subtotal === 0 || subtotal >= d.freeShippingOver ? 0 : d.shippingFlat;
    $('#cart-ship').textContent = ship ? fmt(ship) : I.free;
    $('#cart-total').textContent = fmt(subtotal + ship);
    $('#cart-msg').textContent = subtotal === 0 ? '' : ship ? I.freeShipMsg.replace('{x}', fmt(d.freeShippingOver - subtotal)) : I.freeShipOk;
    $('#cart-go').disabled = !c.length;
    list.querySelectorAll('.cart-qty button').forEach((b) => b.addEventListener('click', () => {
      const cc = get(), it = cc.find((x) => x.key === b.dataset.k);
      if (it) it.qty += +b.dataset.d;
      set(cc.filter((x) => x.qty > 0));
    }));
    list.querySelectorAll('.cart-grind').forEach((s) => s.addEventListener('change', () => {
      const cc = get(), it = cc.find((x) => x.key === s.dataset.k);
      if (it) { it.grind = +s.value; it.key = it.id + '|' + it.grind + '|' + (it.sub || ''); }
      set(cc);
    }));
  }

  $('#cart-go').addEventListener('click', async () => {
    const btn = $('#cart-go'), err = $('#cart-err');
    btn.disabled = true; err.textContent = '';
    try {
      const r = await fetch('/.netlify/functions/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lang: L, items: get().map((l) => ({ id: l.id, qty: l.qty, grind: l.grind, sub: l.sub })) }) });
      const j = await r.json();
      if (j.url) location.href = j.url; else throw new Error(j.error || 'error');
    } catch (e) { err.textContent = I.checkoutError + ' (' + e.message + ')'; btn.disabled = false; }
  });

  render();
})();

// Creates a Stripe Checkout session from the cart. Prices are re-read from the live site's
// /products.json (built from /admin content), so the browser can't tamper with amounts.
const Stripe = require('stripe');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
  if (!process.env.STRIPE_SECRET_KEY) return { statusCode: 500, body: JSON.stringify({ error: 'STRIPE_SECRET_KEY no está configurada en Netlify.' }) };
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    const { items = [], lang: rawLang } = JSON.parse(event.body || '{}');
    const lang = rawLang === 'en' ? 'en' : 'es';
    const origin = event.headers.origin || process.env.URL;
    const store = await (await fetch(origin + '/products.json')).json();
    const abs = (u) => (u && u.startsWith('http') ? u : origin + (u || store.logo));
    const disc = store.subscriptionDiscount || 10;
    const line_items = [];
    let subtotal = 0, hasSub = false;

    for (const it of items.slice(0, 50)) {
      const p = store.products.find((x) => x.id === it.id);
      if (!p) continue;
      const qty = Math.max(1, Math.min(99, parseInt(it.qty, 10) || 1));
      let name = p.name[lang];
      if (p.kind === 'bean') { const g = store.grinds[lang][parseInt(it.grind, 10) || 0]; if (g) name += ' · ' + g; }
      const product_data = { name, images: [abs(p.image)] };
      if (it.sub && p.subscription) {
        const f = [2, 4, 8].includes(+it.sub) ? +it.sub : 4;
        const price = Math.round(p.price * (1 - disc / 100));
        product_data.name += ' · ' + store.freqs[lang][f];
        line_items.push({ quantity: qty, price_data: { currency: 'mxn', unit_amount: price * 100, product_data, recurring: { interval: 'week', interval_count: f } } });
        subtotal += price * qty; hasSub = true;
      } else {
        line_items.push({ quantity: qty, price_data: { currency: 'mxn', unit_amount: p.price * 100, product_data } });
        subtotal += p.price * qty;
      }
    }
    if (!line_items.length) return { statusCode: 400, body: JSON.stringify({ error: 'Carrito vacío' }) };

    const free = subtotal >= store.freeShippingOver;
    const base = lang === 'en' ? '/en/' : '/';
    const session = await stripe.checkout.sessions.create({
      mode: hasSub ? 'subscription' : 'payment',
      line_items,
      locale: lang,
      currency: 'mxn',
      shipping_address_collection: { allowed_countries: ['MX'] },
      phone_number_collection: { enabled: true },
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
      shipping_options: [{ shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: { amount: free ? 0 : store.shippingFlat * 100, currency: 'mxn' },
        display_name: free ? (lang === 'en' ? 'Free shipping' : 'Envío gratis') : (lang === 'en' ? 'Shipping (Mexico)' : 'Envío a todo México'),
        delivery_estimate: { minimum: { unit: 'business_day', value: 3 }, maximum: { unit: 'business_day', value: 5 } }
      } }],
      success_url: origin + base + 'pedido/?s={CHECKOUT_SESSION_ID}',
      cancel_url: origin + base + 'tienda/'
    });
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: session.url }) };
  } catch (e) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: e.message }) };
  }
};

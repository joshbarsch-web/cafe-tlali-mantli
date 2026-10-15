const fs = require('fs');
const path = require('path');
const md = require('markdown-it')({ html: true, linkify: true });

module.exports = function (c) {
  const read = (f) => JSON.parse(fs.readFileSync(path.join('content', f), 'utf8'));
  const site = read('site.json');
  const ui = read('ui.json');
  const cart = read('cart.json');
  const pages = {};
  for (const f of fs.readdirSync('content/pages')) pages[f.replace('.json', '')] = read('pages/' + f);
  const products = fs.readdirSync('content/products').map((f) => read('products/' + f)).sort((a, b) => a.order - b.order);

  c.addPassthroughCopy('assets');
  c.addPassthroughCopy('admin');
  c.addPassthroughCopy('styles.css');
  c.addPassthroughCopy('cart.js');
  c.addPassthroughCopy('robots.txt');
  c.addWatchTarget('content');
  // Ignore legacy .njk templates / _includes left over from earlier uploads
  c.ignores.add('src/**/*.njk');
  c.ignores.add('src/_includes/**');
  c.ignores.add('src/snipcart-products.html');

  c.addGlobalData('site', site);
  c.addGlobalData('ui', ui);
  c.addGlobalData('cart', cart);
  c.addGlobalData('pg', pages);
  c.addGlobalData('products', products);
  c.addGlobalData('subProducts', products.filter((p) => p.subscription));
  c.addGlobalData('freqs', [2, 4, 8]);
  const freqLabel = (lng) => ({ 2: pages.subscription.freq2[lng], 4: pages.subscription.freq4[lng], 8: pages.subscription.freq8[lng] });
  // Public catalog used by the on-site cart and re-read by the checkout function (source of truth for prices)
  c.addGlobalData('storeData', {
    products: products.map((p) => ({ id: p.id, kind: p.kind, name: p.name, price: p.price, image: p.image || site.logo, subscription: !!p.subscription })),
    shippingFlat: site.shippingFlat, freeShippingOver: site.freeShippingOver, subscriptionDiscount: site.subscriptionDiscount, logo: site.logo,
    grinds: { es: ui.grinds.es.split('|'), en: ui.grinds.en.split('|') }, freqs: { es: freqLabel('es'), en: freqLabel('en') }
  });

  c.addCollection('blog', (api) => api.getFilteredByGlob('src/blog/*.md').sort((a, b) => b.date - a.date));

  c.addFilter('mxn', (n) => '$' + Number(n).toLocaleString('es-MX') + ' MXN');
  c.addFilter('md', (s) => md.render(s || ''));
  c.addFilter('discount', (n) => Math.round(n * (1 - (site.subscriptionDiscount || 10) / 100)));
  c.addFilter('split', (s, sep) => String(s || '').split(sep).map((x) => x.trim()).filter(Boolean));
  c.addFilter('date', (d, lang) => new Date(d).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }));
  c.addFilter('json', (v) => JSON.stringify(v));
  c.addFilter('alt', (url, lang) => (lang === 'en' ? url.replace(/^\/en\//, '/') : '/en' + url));

  return { dir: { input: 'src', includes: 'includes' }, markdownTemplateEngine: 'njk', htmlTemplateEngine: 'njk' };
};

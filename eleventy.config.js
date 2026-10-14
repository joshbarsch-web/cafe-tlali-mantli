const fs = require('fs');
const path = require('path');
const md = require('markdown-it')({ html: true, linkify: true });

module.exports = function (c) {
  const read = (f) => JSON.parse(fs.readFileSync(path.join('content', f), 'utf8'));
  const site = read('site.json');
  const ui = read('ui.json');
  const pages = {};
  for (const f of fs.readdirSync('content/pages')) pages[f.replace('.json', '')] = read('pages/' + f);
  const products = fs.readdirSync('content/products').map((f) => read('products/' + f)).sort((a, b) => a.order - b.order);

  c.addPassthroughCopy('assets');
  c.addPassthroughCopy('admin');
  c.addPassthroughCopy('styles.css');
  c.addPassthroughCopy('robots.txt');
  c.addWatchTarget('content');

  c.addGlobalData('site', site);
  c.addGlobalData('ui', ui);
  c.addGlobalData('pg', pages);
  c.addGlobalData('products', products);
  c.addGlobalData('subProducts', products.filter((p) => p.subscription));
  c.addGlobalData('freqs', [2, 4, 8]);
  // Static product list Snipcart uses to validate subscription variants (price is the discounted one)
  const disc = (n) => Math.round(n * (1 - (site.subscriptionDiscount || 10) / 100));
  const sub = pages.subscription;
  c.addGlobalData('snipcartProducts', products.filter((p) => p.subscription).flatMap((p) => [2, 4, 8].map((f) => ({
    id: p.id + '-sub-' + f, name: p.name.es + ' · ' + sub['freq' + f].es, price: disc(p.price), url: '/suscripcion/', shippable: true,
    plans: [{ id: 'cada-' + f + '-semanas', name: sub['freq' + f].es, frequency: 'Weekly', interval: f }],
    ...(p.kind === 'bean' ? { customFields: [{ name: ui.grind.es, options: ui.grinds.es }] } : {})
  }))));

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

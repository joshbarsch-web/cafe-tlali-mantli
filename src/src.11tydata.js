// Computes <title> / meta description per page from the bilingual content files.
const map = {
  index: ['home', 'hero1', 'metaDescription'], tienda: ['shop', 'title', 'intro'], drips: ['drips', 'title', 'sub'],
  historia: ['story', 'title', 'lede'], suscripcion: ['subscription', 'title', 'lede'], mayoreo: ['wholesale', 'title', 'lede'],
  faq: ['faq', 'title', 'lede'], contacto: ['contact', 'title', 'lede'], blog: ['blog', 'title', 'lede']
};
module.exports = {
  eleventyComputed: {
    title: (d) => {
      const L = d.lang;
      if (d.p) return d.p.name[L];
      if (d.post) return d.post.data['title_' + L];
      if (d.page.fileSlug === 'gracias') return d.ui.thanksTitle[L];
      if (d.page.fileSlug === 'privacidad') return d.site.privacyTitle[L];
      const m = map[d.page.fileSlug];
      return m ? String(d.pg[m[0]][m[1]][L]).replace(/\.$/, '') : d.site.name;
    },
    description: (d) => {
      const L = d.lang;
      if (d.p) return d.p.desc[L];
      if (d.post) return d.post.data['excerpt_' + L];
      const m = map[d.page.fileSlug];
      return m ? d.pg[m[0]][m[2]][L] : d.site.shipNote[L];
    }
  }
};

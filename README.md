# Café Tlali Mantli — sitio con editor (/admin)

Sitio estático generado con Eleventy. El contenido vive en `content/` (JSON) y `src/blog/` (Markdown) y se edita desde **tudominio.com/admin** con Decap CMS. Cada cambio guardado se publica solo en 1–2 minutos.

## Puesta en marcha (una sola vez)

### 1. Subir estos archivos a GitHub
1. Abre tu repo `cafe-tlali-mantli` en github.com → **Add file → Upload files**.
2. Arrastra **todo el contenido de esta carpeta** (no la carpeta misma): `admin/`, `assets/`, `content/`, `src/`, `eleventy.config.js`, `netlify.toml`, `package.json`, `styles.css`, `robots.txt`, este README.
3. Abajo, **Commit changes**.

### 2. Conectar Netlify al repo
1. Netlify → tu sitio → **Site configuration → Build & deploy → Continuous deployment → Link repository**.
2. Elige GitHub → `cafe-tlali-mantli` → rama `main`. Build command `npm run build`, publish `_site` (ya vienen en `netlify.toml`).
3. Espera el primer deploy (≈1 min). El sitio debe verse igual que antes.

### 3. Activar el login del editor
1. Netlify → **Site configuration → Identity → Enable Identity**.
2. **Registration → Invite only**.
3. **Services → Git Gateway → Enable**.
4. **Identity → Invite users** → escribe tu correo y el de tus 1–3 colaboradores. Cada quien abre el correo, pone contraseña y entra en **tudominio.com/admin**.

## Qué se edita dónde (en /admin)
- **Productos** — precio, nombre, descripción, foto, si entra en suscripción. Al crear uno nuevo, el ID va en minúsculas sin espacios (`drips-200`) y no se cambia después.
- **Blog** — entradas en español e inglés.
- **Páginas** — todos los textos de Inicio, Drips, Tienda, Historia, Suscripción, Mayoreo, FAQ, Contacto.
- **Ajustes → Sitio y contacto** — WhatsApp, correo, Instagram, costo de envío, umbral de envío gratis, % de suscripción, llave de Snipcart, aviso de privacidad.
- **Ajustes → Textos de interfaz** — menú, botones, formularios.

Las fotos se suben desde cualquier campo de imagen y quedan en `assets/uploads/`.

## Snipcart
Las variantes de suscripción se generan automáticamente en `/snipcart-products.json`; no hay que tocar nada al cambiar precios. En el panel de Snipcart: dominio autorizado, Stripe México (OXXO + SPEI), envío $99 / gratis ≥ $599.

## Formularios
`contacto` y `mayoreo` llegan a Netlify → **Forms**. Activa notificaciones por correo ahí.

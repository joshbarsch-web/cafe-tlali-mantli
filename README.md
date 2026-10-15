# Café Tlali Mantli — sitio con editor (/admin)

Sitio estático generado con Eleventy. El contenido vive en `content/` (JSON) y `src/blog/` (Markdown) y se edita desde **tudominio.com/admin** con Decap CMS. Cada cambio guardado se publica solo en 1–2 minutos.

## Puesta en marcha (una sola vez)

### 1. Subir estos archivos a GitHub
1. Abre tu repo `cafe-tlali-mantli` en github.com → **Add file → Upload files**.
2. Desde Finder/Explorador, **arrastra** las carpetas `admin`, `assets`, `content` y `src` a la zona de carga, junto con los archivos sueltos. Si GitHub pregunta por sobrescribir, acepta.
3. **Commit changes**. Verifica que en el repo aparezcan las cuatro carpetas.

### 2. Conectar Netlify al repo
1. Netlify → tu sitio → **Site configuration → Build & deploy → Continuous deployment → Link repository** → GitHub → `cafe-tlali-mantli` → rama `main`.
2. Espera el deploy (≈1 min). El sitio debe verse igual que antes.

### 3. Login del editor (GitHub, sin Identity ni Git Gateway)
1. En GitHub: foto de perfil → **Settings → Developer settings → OAuth Apps → New OAuth App**.
   - Application name: `Café Tlali Mantli CMS`
   - Homepage URL: la URL de tu sitio
   - Authorization callback URL: `https://api.netlify.com/auth/done`
   - **Register application** → copia el **Client ID** → **Generate a new client secret** → cópialo.
2. En Netlify: **Site configuration → Access & security → OAuth → Install provider** → GitHub → pega Client ID y Client Secret → Install.
3. Entra en **tudominio.com/admin → Login with GitHub**.
4. Para tus colaboradores: GitHub → repo → **Settings → Collaborators → Add people** (necesitan cuenta de GitHub). Con eso pueden entrar al /admin.

## Qué se edita dónde (en /admin)
- **Productos** — precio, nombre, descripción, foto, si entra en suscripción. Al crear uno nuevo, el ID va en minúsculas sin espacios (`drips-200`) y no se cambia después.
- **Blog** — entradas en español e inglés.
- **Páginas** — todos los textos de Inicio, Drips, Tienda, Historia, Suscripción, Mayoreo, FAQ, Contacto.
- **Ajustes → Sitio y contacto** — WhatsApp, correo, Instagram, costo de envío, umbral de envío gratis, % de suscripción, aviso de privacidad.
- **Ajustes → Textos de interfaz** — menú, botones, formularios.

Las fotos se suben desde cualquier campo de imagen y quedan en `assets/uploads/`.

## Pagos (Stripe Checkout)
El carrito vive en el sitio; al pagar, el cliente pasa a la página de pago de Stripe (tarjeta, Apple Pay, Google Pay, OXXO — lo que tengas activo en Stripe → Settings → Payment methods). Precios, envío y descuento de suscripción salen de /admin → Ajustes.

**Una sola vez:**
1. Stripe → **Developers → API keys** → copia la **Secret key** (empieza con `sk_test_` en modo prueba, `sk_live_` en vivo).
2. Netlify → **Site configuration → Environment variables → Add a variable** → Key: `STRIPE_SECRET_KEY`, Value: la llave → Save.
3. Netlify → **Deploys → Trigger deploy** para que la función tome la variable.
4. Prueba con la llave `sk_test_` y la tarjeta `4242 4242 4242 4242`; cuando todo esté bien, cambia la variable por la `sk_live_` y vuelve a hacer Trigger deploy.

**Pedidos:** Stripe → **Payments** (dirección de envío y teléfono vienen en cada pago). Activa recibos: Stripe → Settings → Emails → "Successful payments".
**Suscripciones:** Stripe → **Subscriptions**. Para que el cliente pueda cancelar solo: Stripe → Settings → Billing → **Customer portal** → activa y copia el enlace de acceso; pégalo en la respuesta del FAQ sobre cancelar.
**Envío:** $99 o gratis desde $599 (ambos ajustables en /admin → Ajustes → Sitio y contacto). Solo México.

## Formularios
`contacto` y `mayoreo` llegan a Netlify → **Forms**. Activa notificaciones por correo ahí.

# Cartelera — desplegar gratis en GitHub Pages

Esta es la versión 100% navegador (sin backend): guarda todo con
`localStorage` y habla directamente con la API de TMDB desde el propio
navegador. Al estar servida por HTTPS real (no el sandbox del chat, no un
`file://` local), tanto `localStorage` como las llamadas a TMDB funcionan
sin problemas.

## Pasos para publicarla (todo gratis, sin tarjeta, sin límites de tiempo)

1. **Crea un repositorio nuevo en GitHub**
   - Entra en https://github.com/new
   - Ponle un nombre, por ejemplo `cartelera`
   - Puede ser público o privado (GitHub Pages funciona con ambos si tienes
     cuenta gratuita normal; con repos privados a veces depende del plan,
     así que si tienes dudas hazlo público — no hay nada sensible en el
     código, tu clave de TMDB no se sube a ningún sitio, vive en tu
     navegador).
   - No hace falta añadir README ni licencia, puedes dejarlo vacío.

2. **Sube estos 3 archivos a la raíz del repositorio**
   - `index.html`
   - `manifest.webmanifest`
   - `sw.js`

   Formas de hacerlo, la que te resulte más cómoda:
   - **Sin usar terminal**: en la página del repo, botón "Add file" →
     "Upload files", arrastra los 3 archivos, y "Commit changes".
   - **Con git** (si lo prefieres):
     ```bash
     git init
     git add index.html manifest.webmanifest sw.js
     git commit -m "Primera versión de Cartelera"
     git branch -M main
     git remote add origin https://github.com/TU_USUARIO/cartelera.git
     git push -u origin main
     ```

3. **Activa GitHub Pages**
   - En el repo, ve a **Settings → Pages** (menú de la izquierda).
   - En "Build and deployment" → "Source", elige **Deploy from a branch**.
   - Rama: **main**, carpeta: **/ (root)**. Guarda.
   - Espera 1-2 minutos. GitHub te dará una URL del tipo:
     `https://TU_USUARIO.github.io/cartelera/`

4. **Ábrela y configura tu clave de TMDB**
   - Entra en esa URL desde el navegador (móvil o PC, la que quieras).
   - Ve a Ajustes y pega tu clave de API de TMDB (v3 auth).
   - A partir de aquí todo funciona exactamente igual que en local: buscar,
     añadir, marcar episodios, notas, vista semanal, etc.

## Cosas a tener en cuenta

- **Los datos son por navegador/dispositivo.** `localStorage` no se
  sincroniza entre tu móvil y tu ordenador ni entre navegadores distintos
  (Chrome y Firefox verían bibliotecas distintas). Si quieres tener todo
  en un solo sitio accesible desde cualquier dispositivo, la alternativa
  es el backend Spring Boot que ya tienes, alojado en un servicio con capa
  gratuita (Render, Fly.io, Railway...), pero eso trae sus propias letras
  pequeñas (el contenedor se "duerme" tras inactividad en el plan gratuito
  de la mayoría, y hay que gestionar el arranque en frío).
- **Haz copias de seguridad de vez en cuando** con el botón "Exportar
  copia (.json)" de Ajustes — si algún día borras datos del navegador o
  cambias de dispositivo, así no partes de cero.
- **Actualizar la web más adelante**: si cambias algo en `index.html`,
  vuelve a subirlo (nuevo commit) y GitHub Pages lo despliega solo en
  1-2 minutos.
- Cada visitante de esa URL vería la web vacía y tendría que poner su
  propia clave de TMDB — no hay ninguna cuenta ni login, cada navegador
  es su propio "usuario" con su propio `localStorage`.

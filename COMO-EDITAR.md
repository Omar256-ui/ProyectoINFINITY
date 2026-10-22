# Infinity Gym · cómo usar y editar el sitio

## Verlo en tu computadora
Abre `sitio/index.html` con doble clic. Funciona sin internet, salvo las tipografías, el mapa y WhatsApp.

## Cambiar datos: todo está en `sitio/config.js`
Ábrelo con cualquier editor de texto, cambia el valor entre comillas y guarda.

| Quiero cambiar | Dónde en `config.js` |
| --- | --- |
| Número de WhatsApp | `whatsapp` de cada sede y de `marca` (52 + 10 dígitos, sin espacios) |
| Facebook, Instagram, TikTok, Google Maps | `redes` de `marca` y de cada sede (enlace completo) |
| Dirección y mapa | `direccion`, `mapa` (texto para el mapa) y `mapaUrl` (enlace de Google Maps) de cada sede |
| Coaches | `coaches` de cada sede: nombre, especialidad y horario |
| Logo de una sede | `emblema` (ruta a la imagen) y `color` de cada sede |
| Fondo animado | `tema` de cada sede: `"humo"`, `"telarana"` o `"chispas"` (el inicio usa brasas) |
| Horarios | `horario` de cada sede (0 = domingo … 6 = sábado) |
| Horas para citas | `horariosCita` de cada sede |
| Precios y planes | `planes` e `inscripcion` (mismos nombres que la hoja «Catálogos»; precios generales para todas las sedes) |
| Guardar registros en Google Sheets | `registros.endpoint` (ver `google-sheets/CONECTAR-GOOGLE-SHEETS.md`) |
| Quitar la franja «Vista de propuesta» | `modoPropuesta: false` |

## Cambiar fotos
Cada sede tiene su carpeta en `sitio/assets/sedes/<sede>/`. Guarda tus fotos con estos nombres (.jpg o .webp):
`hero` (portada), `la-sede` (vertical) y `galeria-01` a `galeria-09`. El sitio las muestra solo.
Después sube el número de `version` en `config.js` para que se vean al instante.

## Agregar una sede
1. En `config.js`, copia el bloque de una sede (por ejemplo `progreso: { … }`), cámbiale el nombre y los datos.
   Para una sede próxima usa `estado: "proximamente"`.
2. Copia `sitio/progreso.html`, renómbralo (ej. `nueva.html`) y cambia dentro `data-page` y `data-sede` por la clave nueva, el `<title>` y la descripción.
3. Agrégala a `sitio/sitemap.xml`. El menú, las tarjetas y el pie se actualizan solos.

## Publicar
**Hostinger:** hPanel → Administrador de archivos → `public_html` → sube el **contenido** de la carpeta `sitio/` (incluido el archivo oculto `.htaccess`).
**GitHub Pages:** sube el contenido de `sitio/` a la raíz de un repositorio → Settings → Pages → Deploy from a branch → `main` / root.
Antes de publicar con dominio, reemplaza `https://www.ejemplo.com` por tu dominio en los `.html`, `robots.txt`, `sitemap.xml` y `config.js` (`dominio`).

## Qué sede es cuál
Tezontepec usa el murciélago, Mixquiahuala la araña («INFINITY GYM», como se llama en Google Maps) y Progreso el escudo («GYM INFINITY»).
Para intercambiar logos entre sedes, intercambia en `config.js` los valores de `emblema`, `color` y `tema`.

## Datos de los formularios
- Sin `endpoint`: el formulario abre WhatsApp con el mensaje listo.
- Con `endpoint`: se guarda en la hoja del mes en Google Sheets y abre WhatsApp con el mensaje y el folio. Si la hoja falla, igual abre WhatsApp.
- La base de datos es tu hoja de Google «Infinity-Gym-Registros». El esquema para MySQL está en `mysql/` por si algún día migran.

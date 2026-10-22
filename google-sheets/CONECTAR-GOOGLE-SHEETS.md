# Conectar el sitio con tu hoja «Infinity-Gym-Registros»

## Por qué hoy no se guarda nada
- En `sitio/config.js`, `endpoint` está vacío. Sin esa dirección, el formulario no sabe a dónde mandar los datos y solo abre WhatsApp.
- Esa dirección (termina en `/exec`) solo existe después de publicar el script desde la cuenta dueña de la hoja (pasos 1 a 5).
- Subir el sitio a Hostinger no lo arregla por sí solo, pero tampoco es requisito: con el `endpoint` puesto funciona igual en Hostinger, GitHub Pages o abriendo `index.html` en tu computadora.
- Las vistas previas que no son el sitio real pueden bloquear la conexión con la hoja. Prueba siempre con el sitio publicado.

Tu hoja ya tiene todas las pestañas (Panel, Citas, Octubre 2026, Noviembre 2026, Catálogos). Solo falta el script que recibe los formularios del sitio. Google exige que este paso lo haga la cuenta dueña de la hoja: son unos 5 minutos.

Hoja: https://docs.google.com/spreadsheets/d/1FxrtK5gdhTkmC00lj_U8rLbrDoydWzUCoqcJSVKcmEA/edit

## 1. Pegar el script
1. En la hoja: **Extensiones → Apps Script**.
2. Borra lo que aparece, pega todo `Codigo.gs` y guarda (icono de disco).

## 2. Configurar (una sola vez)
1. Arriba, en la lista de funciones, elige **configurar** y presiona **▶ Ejecutar**.
2. Google pedirá permisos: **Revisar permisos → tu cuenta → Configuración avanzada → Ir al proyecto → Permitir**. Es normal: el script es tuyo.
3. Esto deja la zona horaria en Ciudad de México, corrige el Panel (los meses sin hoja aparecían con 1 registro) y activa la fecha de «Última actualización».

## 3. Probar
Elige **probarRegistro** y presiona **▶ Ejecutar**. Debe aparecer «Prueba del sistema» en «Octubre 2026» y en «Citas». Bórralo después.

## 4. Publicar
1. **Implementar → Nueva implementación → engrane → Aplicación web**.
2. Ejecutar como: **Yo**. Quién tiene acceso: **Cualquier usuario**.
3. **Implementar** y copia la URL que termina en **/exec**.

Tu hoja está en una cuenta escolar (@itsoeh.edu.mx). Si no aparece «Cualquier usuario», la escuela lo bloquea: haz una copia de la hoja en una cuenta de Gmail (Archivo → Hacer una copia) y repite estos pasos ahí.

## 5. Pegar la URL en el sitio
Abre `sitio/config.js` y pega la URL entre las comillas de `endpoint`:

```js
registros: {
  endpoint: "https://script.google.com/macros/s/…/exec",
```

Guarda y vuelve a subir `config.js`. Desde ese momento, cada cita del sitio se guarda en la hoja y abre WhatsApp con su folio.

## 6. Que la vea el cliente
En la hoja: **Compartir** → correo del cliente → **Lector** (solo ver) o **Editor** (para cambiar estatus). No uses «Cualquier persona con el enlace»: tiene datos personales.

## Si cambias el script después
**Implementar → Administrar implementaciones → ✏️ → Versión: Nueva versión → Implementar.** La URL no cambia.

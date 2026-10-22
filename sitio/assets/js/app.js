/* Infinity Gym · lógica del sitio
   Lee config.js (window.INFINITY) y arma cada página. No necesitas editar este archivo. */
(function () {
  "use strict";

  var C = window.INFINITY;
  var BUNDLE = !!window.__BUNDLE__;
  var ASSETS = window.__ASSETS__ || {};
  var ORDEN = Object.keys((window.INFINITY || {}).sedes || {});
  var DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var app = document.getElementById("app");
  if (!C || !app) return;

  /* ---------- utilidades ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function asset(p) { return BUNDLE ? (ASSETS[p] || "") : p + "?v=" + encodeURIComponent(C.version); }
  function url(page, ancla) {
    if (BUNDLE) return "#/" + page + (ancla ? "/" + ancla : "");
    var file = page === "inicio" ? "index.html" : page + ".html";
    return file + (ancla ? "#" + ancla : "");
  }
  function ancla(id) { return 'href="#' + id + '" data-scroll="' + id + '"'; }
  function dinero(n) { return "$" + Number(n).toLocaleString("es-MX"); }
  function digitos(s) { return String(s || "").replace(/\D/g, ""); }
  function waUrl(num, msg) {
    var d = digitos(num);
    return (d.length >= 11 ? "https://wa.me/" + d : "https://wa.me/") + "?text=" + encodeURIComponent(msg);
  }
  function hora12(h) { return String(h || "").replace(/^0/, ""); }
  function aMin(h) { var p = String(h).split(":"); return (+p[0]) * 60 + (+p[1]); }
  function sede(slug) { return C.sedes[slug]; }
  function listaNombres(slugs) {
    var n = slugs.map(function (x) { return sede(x).nombre; });
    return n.length > 1 ? n.slice(0, -1).join(", ") + " y " + n[n.length - 1] : (n[0] || "");
  }
  function activas() { return ORDEN.filter(function (s) { return C.sedes[s] && C.sedes[s].estado === "activa"; }); }
  function planesPrincipales() { return C.planes.filter(function (p) { return p.principal; }); }
  function aviso(texto) {
    var t = document.createElement("div");
    t.className = "aviso-toast"; t.setAttribute("role", "status"); t.textContent = texto;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 5200);
  }
  function abrirWhatsApp(num, msg) {
    if (digitos(num).length < 11 && C.modoPropuesta) aviso("Número de WhatsApp de ejemplo: configúralo en config.js. Se abre WhatsApp para elegir contacto.");
    window.open(waUrl(num, msg), "_blank", "noopener");
  }

  /* ---------- horarios ---------- */
  function ahoraMx() {
    try {
      var partes = {};
      new Intl.DateTimeFormat("en-US", { timeZone: "America/Mexico_City", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
        .formatToParts(new Date()).forEach(function (p) { partes[p.type] = p.value; });
      return { dia: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(partes.weekday), min: (+partes.hour % 24) * 60 + (+partes.minute) };
    } catch (e) {
      var d = new Date(); return { dia: d.getDay(), min: d.getHours() * 60 + d.getMinutes() };
    }
  }
  function horarioDia(s, dia) {
    var h = (s.horario || []);
    for (var i = 0; i < h.length; i++) if (h[i].dias.indexOf(dia) >= 0) return h[i];
    return null;
  }
  function estado(s) {
    if (s.estado !== "activa") return { clase: "", texto: "Apertura: " + (s.apertura || "por anunciar").toLowerCase() };
    var n = ahoraMx(), h = horarioDia(s, n.dia);
    if (h && n.min >= aMin(h.abre) && n.min < aMin(h.cierra)) return { clase: "abierto", texto: "Abierto ahora, cierra a las " + hora12(h.cierra) };
    if (h && n.min < aMin(h.abre)) return { clase: "cerrado", texto: "Cerrado, abre hoy a las " + hora12(h.abre) };
    for (var i = 1; i <= 7; i++) {
      var d = (n.dia + i) % 7, hh = horarioDia(s, d);
      if (hh) return { clase: "cerrado", texto: "Cerrado, abre " + (i === 1 ? "mañana" : "el " + DIAS[d].toLowerCase()) + " a las " + hora12(hh.abre) };
    }
    return { clase: "cerrado", texto: "Cerrado" };
  }
  function chipEstado(slug) {
    var e = estado(sede(slug));
    return '<span class="estado ' + e.clase + '" data-estado="' + slug + '">' + esc(e.texto) + "</span>";
  }

  /* ---------- emblemas (originales) ---------- */
  var T = 'fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"';
  var SVG = {
    infinito: '<svg viewBox="0 0 120 60" aria-hidden="true"><path ' + T.replace("3.2", "6") + ' d="M60 30C72 13 100 13 100 30S72 47 60 30 20 13 20 30 48 47 60 30Z"/></svg>',
    jaguar: '<svg class="emblema" viewBox="0 0 120 120" role="img" aria-label="Emblema del Jaguar"><g ' + T + '>' +
      '<path d="M30 32 44 24 60 30 76 24 90 32 97 54 89 79 73 95 60 101 47 95 31 79 23 54Z"/>' +
      '<path d="M30 32 27 13 44 24M90 32 93 13 76 24M31 27 30 19 38 24M89 27 90 19 82 24"/>' +
      '<path d="M38 55Q46 47 54 55Q46 60 38 55ZM66 55Q74 47 82 55Q74 60 66 55Z"/>' +
      '<path d="M46 51V59M74 51V59M56 58 54 68M64 58 66 68M60 78V84M50 87Q55 91 60 84Q65 91 70 87"/>' +
      '<path d="M52 41A4 4 0 0 1 59 38M61 38A4 4 0 0 1 68 41M44 45A3 3 0 0 1 49 43M71 43A3 3 0 0 1 76 45"/></g>' +
      '<path fill="currentColor" d="M52 70H68L60 78Z"/>' +
      '<g fill="currentColor"><circle cx="38" cy="70" r="1.8"/><circle cx="34" cy="64" r="1.8"/><circle cx="42" cy="76" r="1.8"/><circle cx="82" cy="70" r="1.8"/><circle cx="86" cy="64" r="1.8"/><circle cx="78" cy="76" r="1.8"/></g></svg>',
    fenix: '<svg class="emblema" viewBox="0 0 120 120" role="img" aria-label="Emblema del Fénix"><g ' + T + '>' +
      '<path d="M57 58C47 55 31 46 18 24L31 30 30 18 42 32 44 21 52 40Z"/>' +
      '<path d="M63 58C73 55 89 46 102 24L89 30 90 18 78 32 76 21 68 40Z"/>' +
      '<path d="M60 44C53 52 53 66 60 78 67 66 67 52 60 44Z"/>' +
      '<path d="M60 44 55 37 60 28 65 37Z"/><path d="M60 28 56 19M60 28V16M60 28 64 19"/>' +
      '<path d="M60 78C51 86 49 97 55 106 55 98 58 93 60 90 62 93 65 98 65 106 71 97 69 86 60 78Z"/>' +
      '<path d="M53 82C45 90 44 100 48 106M67 82C75 90 76 100 72 106"/></g></svg>',
    misterio: '<svg class="emblema" viewBox="0 0 120 120" role="img" aria-label="Emblema por revelar"><g ' + T + '>' +
      '<path d="M60 14 95 27 91 66C87 87 74 99 60 106 46 99 33 87 29 66L25 27Z"/>' +
      '<path d="M49 49C49 39 71 39 71 50 71 58 60 59 60 69"/></g><circle cx="60" cy="81" r="2.8" fill="currentColor"/></svg>',
    chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M4 5h16v11H10l-6 4z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="9" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>'
  };
  function emblema(slug, clases) {
    var s = sede(slug), cls = clases || "";
    if (/\.(png|webp|svg|jpe?g)$/i.test(s.emblema || "")) {
      return '<img class="emblema-img ' + cls + '" src="' + asset(s.emblema) + '" alt="Emblema de ' + esc(s.guardian) + '">';
    }
    if (s.emblema === "murcielago") {
      return '<img class="emblema-img ' + cls + '" src="' + asset("assets/img/emblema-murcielago.webp") + '" alt="Emblema del murciélago de ' + esc(s.nombre) + '" width="781" height="315">';
    }
    return (SVG[s.emblema] || SVG.misterio).replace('class="emblema"', 'class="emblema ' + cls + '"');
  }

  /* ---------- piezas comunes ---------- */
  function marcaLogos() {
    return '<span class="marca-logos" aria-hidden="true">' + activas().map(function (slug) {
      return '<span style="--c:' + esc(sede(slug).color) + '">' + emblema(slug, "") + "</span>";
    }).join("") + "</span>";
  }

  // Héroe centrado (mismo estilo en todas las sedes): ceja, emblema que se enciende, título, lema, estado y botones.
  function heroeCentro(o) {
    return '<section class="heroe-centro' + (o.clase ? " " + o.clase : "") + '"' + (o.foto ? ' data-hero="' + o.slug + '"' : "") + ">" +
      (o.foto ? '<div class="foto-fondo" aria-hidden="true"><img alt="" data-base="' + o.foto + '"></div>' : "") +
      '<div class="heroe-velo" aria-hidden="true"></div>' +
      '<div class="envoltura heroe-contenido">' +
      (o.ceja ? '<p class="ceja">' + o.ceja + "</p>" : "") + o.emblema +
      "<h1" + (o.h1Clase ? ' class="' + o.h1Clase + '"' : "") + ">" + o.titulo + "</h1>" +
      (o.lema ? '<p class="lema">' + o.lema + "</p>" : "") +
      (o.texto ? '<p class="entrada">' + o.texto + "</p>" : "") +
      (o.datos ? '<div class="datos-heroe">' + o.datos + "</div>" : "") +
      '<div class="acciones">' + o.acciones + "</div></div>" +
      (o.pie ? '<p class="heroe-pie"><span class="indicador" aria-hidden="true"></span>' + o.pie + "</p>" : "") +
      "</section>";
  }
  function encabezado(page) {
    var links = ['<a href="' + url("inicio") + '"' + (page === "inicio" ? ' aria-current="page"' : "") + ">La Liga</a>"];
    ORDEN.forEach(function (slug) {
      links.push('<a href="' + url(slug) + '"' + (page === slug ? ' aria-current="page"' : "") + ">" + esc(sede(slug).nombre) + "</a>");
    });
    var cta = page === "tlahuelilpan" ? '<a class="boton chico" ' + ancla("lista") + ">Unirme a la lista</a>"
      : (C.sedes[page] || page === "inicio") ? '<a class="boton chico" ' + ancla("agenda") + ">Agendar visita</a>"
      : '<a class="boton chico" href="' + url("inicio", "agenda") + '">Agendar visita</a>';
    return '<a class="saltar" ' + ancla("contenido") + ">Saltar al contenido</a>" +
      '<header class="encabezado"><div class="envoltura">' +
      '<a class="marca" href="' + url("inicio") + '">' + marcaLogos() + "<span>Infinity Gym</span></a>" +
      '<button class="menu-boton" type="button" aria-expanded="false" aria-controls="nav">Menú</button>' +
      '<nav id="nav" class="nav" aria-label="Principal">' + links.join("") + cta + "</nav></div></header>";
  }

  function redes(r, etiqueta) {
    var nombres = { facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok", google: "Google Maps" };
    var items = Object.keys(nombres).filter(function (k) { return r && k in r; }).map(function (k) {
      if (r[k]) return '<a href="' + esc(r[k]) + '" target="_blank" rel="noopener">' + nombres[k] + "</a>";
      return C.modoPropuesta ? '<span title="Agrega el enlace en config.js">' + nombres[k] + "</span>" : "";
    }).join("");
    return items ? '<div class="redes" aria-label="' + esc(etiqueta || "Redes sociales") + '">' + items + "</div>" : "";
  }

  function pie() {
    var sedesLista = ORDEN.map(function (slug) {
      var s = sede(slug);
      return '<li><a href="' + url(slug) + '">' + esc(s.nombre) + "</a>" + (s.estado !== "activa" ? " (próximamente)" : "") + "</li>";
    }).join("");
    var horarios = activas().slice(0, 1).map(function (slug) {
      return (sede(slug).horario || []).map(function (b) {
        return "<li>" + esc(rangoDias(b.dias)) + ": " + hora12(b.abre) + " a " + hora12(b.cierra) + "</li>";
      }).join("");
    }).join("");
    return '<footer class="pie"><div class="envoltura"><div class="rejilla">' +
      '<div><a class="marca" href="' + url("inicio") + '">' + marcaLogos() + "<span>Infinity Gym</span></a>" +
      '<p class="tenue" style="margin:1rem 0 1.25rem;max-width:32ch">' + esc(C.marca.lema) + "</p>" + redes(C.marca.redes, "Redes de Infinity Gym") + "</div>" +
      "<div><h3>Sedes</h3><ul>" + sedesLista + "</ul></div>" +
      "<div><h3>Horario general</h3><ul>" + horarios + "<li>Revisa el horario de cada sede.</li></ul></div>" +
      '<div><h3>Contacto</h3><ul><li><a href="' + waUrl(C.marca.whatsapp, "Hola, quiero información de Infinity Gym.") + '" target="_blank" rel="noopener">WhatsApp</a></li>' +
      (C.marca.correo ? '<li><a href="mailto:' + esc(C.marca.correo) + '">' + esc(C.marca.correo) + "</a></li>" : "") +
      '<li><a href="' + url("aviso-de-privacidad") + '">Aviso de privacidad</a></li></ul></div>' +
      '</div><div class="legal"><span>© ' + new Date().getFullYear() + " Infinity Gym. Precios y horarios sujetos a cambio.</span><span>Hidalgo, México</span></div></div></footer>";
  }

  function rangoDias(dias) {
    var nombres = dias.map(function (d) { return DIAS[d]; });
    if (dias.length > 2 && dias.join() === [1, 2, 3, 4, 5].join()) return "Lunes a viernes";
    return nombres.join(", ");
  }

  function flotantes(page) {
    var s = C.sedes[page];
    var num = s ? s.whatsapp : C.marca.whatsapp;
    var msg = "Hola, quiero información de Infinity Gym" + (s ? " " + s.nombre : "") + ".";
    var html = '<a class="whatsapp-flotante" href="' + waUrl(num, msg) + '" target="_blank" rel="noopener" data-wa="' + esc(num) + '">' + SVG.chat + "<span>WhatsApp</span></a>";
    return html;
  }

  /* ---------- secciones reutilizables ---------- */
  function tablero(slug) {
    var s = sede(slug), prox = s.estado !== "activa";
    var acciones = prox
      ? '<a class="boton chico" href="' + url(slug, "lista") + '">Unirme a la lista</a>'
      : '<a class="boton chico" href="' + url(slug, "agenda") + '">Agendar</a><a class="boton chico secundario" href="' + url(slug) + '">Ver sede</a>';
    return '<article class="tablero' + (prox ? " proxima" : "") + '" style="--c:' + esc(s.color) + '">' +
      '<div class="marco-emblema">' + emblema(slug, prox ? "apagado" : "letrero-fijo") + "</div>" +
      "<h3>" + esc(s.nombre) + "</h3>" +
      '<p class="guardian">' + esc(s.guardian) + (s.provisional && C.modoPropuesta ? ' <span class="provisional">Provisional</span>' : "") + "</p>" +
      chipEstado(slug) + '<p class="direccion">' + esc(s.direccion) + "</p>" +
      '<div class="acciones">' + acciones + "</div></article>";
  }

  function pizarra() {
    var filas = planesPrincipales().map(function (p) {
      var porMes = p.meses > 1 ? '<small>' + dinero(Math.round(p.precio / p.meses)) + " al mes</small>" : "";
      return '<div class="renglon' + (p.destacado ? " destacado" : "") + '"><div><div class="nombre">' + esc(p.nombre) + "</div>" +
        '<p class="detalle">' + esc(p.detalle) + "</p></div>" +
        '<div class="precio">' + dinero(p.precio) + porMes + "</div>" +
        '<button class="boton chico secundario" type="button" data-plan="' + esc(p.nombre) + '">Lo quiero</button></div>';
    }).join("");
    var otros = C.planes.filter(function (p) { return !p.principal; }).map(function (p) {
      return "<div><span>" + esc(p.nombre) + "</span><b>" + dinero(p.precio) + "</b></div>";
    }).join("");
    return '<div class="pizarra">' + filas + "</div>" +
      (otros ? '<div class="otros-planes">' + otros + "</div>" : "") +
      '<p class="nota-inscripcion">' + (C.inscripcion ? "Inscripción única de " + dinero(C.inscripcion) + ". " : "") + "Precios en pesos mexicanos, iguales en todas las sedes.</p>";
  }

  function seccionPlanes(titulo, texto) {
    return '<section id="planes"><div class="envoltura"><div class="titulo-seccion"><h2>' + titulo + "</h2><p>" + texto + "</p></div>" + pizarra() + "</div></section>";
  }

  function seccionAreas(lista, titulo, texto) {
    return '<section><div class="envoltura"><div class="titulo-seccion"><h2>' + titulo + "</h2>" + (texto ? "<p>" + texto + "</p>" : "") + '</div><div class="areas">' +
      lista.map(function (a) { return "<div><h3>" + esc(a[0]) + "</h3><p>" + esc(a[1]) + "</p></div>"; }).join("") + "</div></div></section>";
  }

  function seccionPreguntas() {
    return '<section id="preguntas"><div class="envoltura"><div class="titulo-seccion"><h2>Preguntas frecuentes</h2></div><div class="preguntas">' +
      C.preguntas.map(function (q, i) { return "<details" + (i === 0 ? " open" : "") + "><summary>" + esc(q[0]) + "</summary><p>" + esc(q[1]) + "</p></details>"; }).join("") +
      "</div></div></section>";
  }

  function seccionTestimonios() {
    return '<section><div class="envoltura"><div class="titulo-seccion"><h2>Lo que dicen en la Liga</h2>' +
      (C.modoPropuesta ? '<p>Testimonios de ejemplo: se reemplazan por opiniones reales de socios.</p>' : "") +
      '</div><div class="testimonios">' +
      C.testimonios.map(function (t) { return "<blockquote><p>" + esc(t[0]) + "</p><cite>" + esc(t[1]) + "</cite></blockquote>"; }).join("") +
      "</div></div></section>";
  }

  function seccionCoaches(s) {
    if (!s.coaches || !s.coaches.length) return "";
    return '<section id="coaches"><div class="envoltura"><div class="titulo-seccion"><h2>Coaches</h2><p>' +
      (C.modoPropuesta ? "Nombres de ejemplo: se reemplazan por el equipo real de la sede." : "Te acompañan desde tu primera visita.") + '</p></div><div class="coaches">' +
      s.coaches.map(function (c) {
        var ini = c[0].split(/\s+/).map(function (w) { return w.charAt(0); }).join("").slice(0, 2).toUpperCase();
        return '<article class="coach"><div class="monograma" aria-hidden="true">' + esc(ini) + "</div><div><h3>" + esc(c[0]) + "</h3>" +
          '<p class="especialidad">' + esc(c[1]) + '</p><p class="tenue">' + esc(c[2] || "") + "</p></div></article>";
      }).join("") + "</div></div></section>";
  }

  function pasosAgenda(prefijo) {
    return '<ol class="tenue" style="margin:1.5rem 0 0;padding-left:1.2rem;display:grid;gap:.5rem">' +
      "<li>" + prefijo + "</li><li>Te confirmamos por WhatsApp.</li><li>Llegas a tu cita y conoces la sede.</li></ol>";
  }

  /* ---------- formularios ---------- */
  var contadorForm = 0;
  function campo(id, etiqueta, control, extra) {
    return '<div class="campo' + (extra || "") + '"><label for="' + id + '">' + etiqueta + "</label>" + control + '<p class="error" id="' + id + '-error"></p></div>';
  }
  function formulario(tipo, slugFijo) {
    var f = "f" + (++contadorForm);
    var opcionesSede = activas().map(function (slug) {
      return '<option value="' + slug + '"' + (slug === slugFijo ? " selected" : "") + ">" + esc(sede(slug).nombre) + "</option>";
    }).join("");
    var opcionesPlan = '<option value="">Aún no sé</option>' + C.planes.map(function (p) {
      return '<option value="' + esc(p.nombre) + '">' + esc(p.nombre) + " (" + dinero(p.precio) + ")</option>";
    }).join("");
    var opcionesTipo = C.tiposCita.map(function (t) { return '<option value="' + esc(t) + '">' + esc(t) + "</option>"; }).join("");
    var esCita = tipo === "cita";
    var html = '<form class="formulario" novalidate data-form="' + tipo + '"' + (slugFijo ? ' data-sede="' + slugFijo + '"' : "") + '><div class="campos">' +
      campo(f + "-nombre", "Nombre", '<input id="' + f + '-nombre" name="nombre" autocomplete="name" required aria-describedby="' + f + '-nombre-error">') +
      campo(f + "-telefono", "WhatsApp", '<input id="' + f + '-telefono" name="telefono" type="tel" inputmode="tel" autocomplete="tel" placeholder="10 dígitos" required aria-describedby="' + f + '-telefono-error">') +
      campo(f + "-correo", 'Correo <span class="opcional">(opcional)</span>', '<input id="' + f + '-correo" name="correo" type="email" autocomplete="email">');
    if (esCita) {
      html += campo(f + "-sede", "Sede", '<select id="' + f + '-sede" name="sede">' + opcionesSede + "</select>") +
        campo(f + "-plan", 'Plan de interés <span class="opcional">(opcional)</span>', '<select id="' + f + '-plan" name="plan">' + opcionesPlan + "</select>") +
        campo(f + "-objetivo", 'Tu objetivo <span class="opcional">(opcional)</span>', '<input id="' + f + '-objetivo" name="objetivo" placeholder="Ej. bajar de peso, ganar fuerza">') +
        '<div class="campo ancho"><label class="casilla"><input type="checkbox" name="quiereCita" checked> Quiero agendar una visita</label></div>' +
        '<div class="bloque-cita">' +
        campo(f + "-tipo", "Tipo de visita", '<select id="' + f + '-tipo" name="tipoCita">' + opcionesTipo + "</select>", " ancho") +
        campo(f + "-fecha", "Día", '<input id="' + f + '-fecha" name="fechaCita" type="date" aria-describedby="' + f + '-fecha-error">') +
        campo(f + "-hora", "Hora", '<select id="' + f + '-hora" name="horaCita" aria-describedby="' + f + '-hora-error"><option value="">Elige un día primero</option></select>') +
        "</div>";
    } else {
      html += campo(f + "-objetivo", 'Tu objetivo <span class="opcional">(opcional)</span>', '<input id="' + f + '-objetivo" name="objetivo" placeholder="Ej. bajar de peso, ganar fuerza">');
    }
    html += '<div class="campo ancho"><label class="casilla"><input type="checkbox" id="' + f + '-consentimiento" name="consentimiento" aria-describedby="' + f + '-consentimiento-error"> <span>Acepto el <a class="enlace" href="' + url("aviso-de-privacidad") + '" target="_blank">aviso de privacidad</a> y que me contacten por WhatsApp.</span></label><p class="error" id="' + f + '-consentimiento-error"></p></div>' +
      '<div class="trampa" aria-hidden="true"><label>Empresa <input name="empresa" tabindex="-1" autocomplete="off"></label></div>' +
      '</div><div class="pie-formulario"><button class="boton" type="submit">' + (esCita ? "Agendar visita" : "Unirme a la lista") + '</button><p class="tenue">Respondemos por WhatsApp.</p></div>' +
      '<div class="aviso-formulario" role="status" aria-live="polite" hidden></div></form>';
    return html;
  }

  function fechaISO(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function fechaLegible(iso) {
    var p = iso.split("-"), d = new Date(+p[0], +p[1] - 1, +p[2]);
    return DIAS[d.getDay()].toLowerCase() + " " + d.getDate() + " de " + MESES[d.getMonth()];
  }

  function prepararFormulario(form) {
    var el = form.elements;
    var esCita = form.dataset.form === "cita";
    if (esCita) {
      var hoy = new Date(), min = new Date(hoy), max = new Date(hoy);
      min.setDate(hoy.getDate() + 1);
      max.setDate(hoy.getDate() + (C.registros.diasMaximosCita || 30));
      el.fechaCita.min = fechaISO(min); el.fechaCita.max = fechaISO(max);
      var bloque = form.querySelector(".bloque-cita");
      var actualizarHoras = function () {
        var s = sede(el.sede.value), v = el.fechaCita.value, sel = el.horaCita;
        sel.innerHTML = "";
        if (!v) { sel.innerHTML = '<option value="">Elige un día primero</option>'; return; }
        var p = v.split("-"), dia = new Date(+p[0], +p[1] - 1, +p[2]).getDay(), h = horarioDia(s, dia);
        var horas = h ? (s.horariosCita || []).filter(function (x) { return aMin(x) >= aMin(h.abre) && aMin(x) < aMin(h.cierra); }) : [];
        if (!horas.length) { sel.innerHTML = '<option value="">La sede no abre ese día</option>'; return; }
        sel.innerHTML = '<option value="">Elige una hora</option>' + horas.map(function (x) { return '<option value="' + x + '">' + hora12(x) + "</option>"; }).join("");
      };
      el.sede.addEventListener("change", actualizarHoras);
      el.fechaCita.addEventListener("change", actualizarHoras);
      el.quiereCita.addEventListener("change", function () { bloque.hidden = !el.quiereCita.checked; });
    }
    form.addEventListener("submit", function (ev) { ev.preventDefault(); enviar(form); });
  }

  function marcarError(form, nombre, msg) {
    var input = form.elements[nombre];
    var err = form.querySelector("#" + (input.id || "") + "-error") || (nombre === "consentimiento" ? form.querySelector('[id$="-consentimiento-error"]') : null);
    if (input && input.setAttribute) input.setAttribute("aria-invalid", msg ? "true" : "false");
    if (err) err.textContent = msg || "";
    return !msg;
  }

  function leerDatos(form) {
    var el = form.elements, esCita = form.dataset.form === "cita";
    var slug = esCita ? el.sede.value : form.dataset.sede;
    var quiere = esCita && el.quiereCita.checked;
    var tel = digitos(el.telefono.value);
    if (tel.length === 12 && tel.indexOf("52") === 0) tel = tel.slice(2);
    return {
      slug: slug,
      datos: {
        nombre: el.nombre.value.trim(),
        telefono: tel,
        correo: el.correo.value.trim(),
        sede: sede(slug).nombre,
        plan: esCita ? el.plan.value : "Lista de espera",
        objetivo: el.objetivo ? el.objetivo.value.trim() : "",
        tipoCita: quiere ? el.tipoCita.value : "",
        fechaCita: quiere ? el.fechaCita.value : "",
        horaCita: quiere ? el.horaCita.value : "",
        consentimiento: el.consentimiento.checked,
        empresa: el.empresa.value,
        notas: "Enviado desde " + (BUNDLE ? "vista previa" : location.pathname.split("/").pop() || "index.html")
      }
    };
  }

  function validar(form, d) {
    var ok = true, esCita = form.dataset.form === "cita";
    ok = marcarError(form, "nombre", d.nombre.length < 2 ? "Escribe tu nombre." : "") && ok;
    ok = marcarError(form, "telefono", d.telefono.length !== 10 ? "Escribe un número de 10 dígitos." : "") && ok;
    if (esCita && form.elements.quiereCita.checked) {
      ok = marcarError(form, "fechaCita", !d.fechaCita ? "Elige el día de tu visita." : "") && ok;
      ok = marcarError(form, "horaCita", !d.horaCita ? "Elige una hora disponible." : "") && ok;
    }
    ok = marcarError(form, "consentimiento", !d.consentimiento ? "Necesitamos tu aceptación para contactarte." : "") && ok;
    if (!ok) { var primero = form.querySelector('[aria-invalid="true"]'); if (primero) primero.focus(); }
    return ok;
  }

  function mensajeWhatsApp(d, folio) {
    var partes = ["Hola, soy " + d.nombre + "."];
    if (d.plan === "Lista de espera") partes.push("Quiero unirme a la lista de espera de Infinity Gym " + d.sede + ".");
    else {
      partes.push("Me interesa Infinity Gym " + d.sede + (d.plan ? ", plan " + d.plan : "") + ".");
      if (d.fechaCita) partes.push("Quiero agendar " + d.tipoCita.toLowerCase() + " el " + fechaLegible(d.fechaCita) + " a las " + hora12(d.horaCita) + ".");
    }
    if (d.objetivo) partes.push("Mi objetivo: " + d.objetivo + ".");
    if (folio) partes.push("Folio: " + folio + ".");
    return partes.join(" ");
  }

  function enviar(form) {
    var r = leerDatos(form), d = r.datos, s = sede(r.slug);
    if (!validar(form, d)) return;
    var boton = form.querySelector('button[type="submit"]');
    var avisoEl = form.querySelector(".aviso-formulario");
    var endpoint = (C.registros && C.registros.endpoint) || "";

    if (!endpoint) {
      abrirWhatsApp(s.whatsapp, mensajeWhatsApp(d, null));
      exito(form, d, s, null, C.modoPropuesta ? "Modo propuesta: la hoja de Google Sheets aún no está conectada; tu solicitud se envía solo por WhatsApp." : "");
      return;
    }
    // Se abre la pestaña de WhatsApp en el mismo clic (así el navegador no la bloquea)
    // y se le asigna la dirección cuando la hoja responde con el folio.
    var ventana = null;
    try {
      ventana = window.open("", "_blank");
      if (ventana) {
        ventana.opener = null;
        ventana.document.title = "Abriendo WhatsApp…";
        ventana.document.body.innerHTML = '<p style="font:16px/1.5 Arial,sans-serif;padding:2rem;color:#222">Guardando tu solicitud y abriendo WhatsApp…</p>';
      }
    } catch (e) { ventana = null; }
    var irWhatsApp = function (folio) {
      var wa = waUrl(s.whatsapp, mensajeWhatsApp(d, folio));
      if (ventana && !ventana.closed) { try { ventana.location.href = wa; return true; } catch (e) {} }
      return false;
    };
    boton.disabled = true; boton.textContent = "Enviando…"; avisoEl.hidden = true;
    // Google Apps Script puede tardar 10–20 s en contestar aunque sí guarde el registro.
    // Se espera el folio máximo 3 s; después se confirma y se abre WhatsApp sin folio,
    // y el registro se sigue guardando en segundo plano (el folio aparece en pantalla cuando llega).
    var mostrado = false;
    var mostrar = function (folio) {
      if (mostrado) return;
      mostrado = true; clearTimeout(espera);
      var abierta = irWhatsApp(folio);
      exito(form, d, s, folio, abierta ? "" : "Toca «Enviar por WhatsApp» para mandar tu solicitud a la sede.");
    };
    var fallar = function (msg) {
      if (mostrado) return;
      mostrado = true; clearTimeout(espera);
      irWhatsApp(null);
      falla(form, d, s, msg);
    };
    var espera = setTimeout(function () { mostrar(null); }, 3000);
    fetch(endpoint, { method: "POST", body: JSON.stringify(d) })
      .then(function (res) { return res.text(); })
      .then(function (txt) {
        var j = {}; try { j = JSON.parse(txt); } catch (e) { j = { ok: false }; }
        if (j.ok && !mostrado) mostrar(j.id || null);
        else if (j.ok) ponerFolio(form, d, s, j.id);
        else fallar(j.error || "No pudimos registrar tu solicitud en línea.");
      })
      .catch(function () { fallar("No pudimos conectarnos para registrar tu solicitud."); });
  }

  // El folio llegó después de mostrar la confirmación: se agrega sin rehacer el panel.
  function ponerFolio(form, d, s, folio) {
    var panel = form.querySelector(".exito");
    if (!folio || !panel || panel.querySelector(".folio")) return;
    var caja = document.createElement("div");
    caja.innerHTML = '<p class="tenue">Tu folio</p><p class="folio">' + esc(folio) + "</p>";
    panel.querySelector("h3").after(caja);
    var wa = panel.querySelector('a.boton[href*="wa.me"]');
    if (wa) wa.href = waUrl(s.whatsapp, mensajeWhatsApp(d, folio));
  }

  function exito(form, d, s, folio, nota) {
    var wa = waUrl(s.whatsapp, mensajeWhatsApp(d, folio));
    var lista = d.plan === "Lista de espera";
    form.innerHTML = '<div class="exito" tabindex="-1"><h3>Listo, ' + esc(d.nombre.split(" ")[0]) + ".</h3>" +
      (folio ? '<div><p class="tenue">Tu folio</p><p class="folio">' + esc(folio) + "</p></div>" : "") +
      "<p>" + (lista ? "Te avisaremos antes que a nadie cuando Infinity Gym " + esc(s.nombre) + " abra." : (d.fechaCita ? "Registramos tu solicitud para el " + esc(fechaLegible(d.fechaCita)) + " a las " + esc(hora12(d.horaCita)) + " en " + esc(s.nombre) + ". Envía el mensaje de WhatsApp para que la sede la confirme." : "Registramos tus datos. Envía el mensaje de WhatsApp y la sede te responderá.")) + "</p>" +
      (nota ? '<p class="tenue">' + esc(nota) + "</p>" : "") +
      '<div class="acciones"><a class="boton" href="' + wa + '" target="_blank" rel="noopener">' + SVG.chat + "Enviar por WhatsApp</a>" +
      '<button class="boton secundario" type="button" data-reiniciar>Registrar a otra persona</button></div></div>';
    var panel = form.querySelector(".exito"); if (panel) panel.focus();
    form.querySelector("[data-reiniciar]").addEventListener("click", function () {
      var nuevo = document.createElement("div");
      nuevo.innerHTML = formulario(form.dataset.form, form.dataset.form === "cita" ? r_slug(s) : form.dataset.sede);
      var f2 = nuevo.firstChild; form.replaceWith(f2); prepararFormulario(f2);
      var n = f2.querySelector("input"); if (n) n.focus();
    });
  }
  function r_slug(s) { for (var k in C.sedes) if (C.sedes[k] === s) return k; return null; }

  function falla(form, d, s, msg) {
    var boton = form.querySelector('button[type="submit"]');
    var avisoEl = form.querySelector(".aviso-formulario");
    boton.disabled = false; boton.textContent = form.dataset.form === "cita" ? "Agendar visita" : "Unirme a la lista";
    avisoEl.hidden = false; avisoEl.className = "aviso-formulario error";
    avisoEl.innerHTML = esc(msg) + ' Puedes enviarnos tus datos directo por WhatsApp: <a class="enlace" href="' + waUrl(s.whatsapp, mensajeWhatsApp(d, null)) + '" target="_blank" rel="noopener">abrir WhatsApp</a>.';
  }

  /* ---------- fotos con respaldo ---------- */
  function cargarFoto(img, base, alFallar, alCargar) {
    if (BUNDLE) {
      var src = ASSETS[base + ".webp"] || ASSETS[base + ".jpg"];
      if (src) { img.onload = alCargar || null; img.src = src; } else alFallar();
      return;
    }
    var exts = [".webp", ".jpg", ".jpeg", ".png"], i = 0;
    img.onerror = function () { i++; if (i < exts.length) img.src = asset(base + exts[i]); else { img.onerror = null; alFallar(); } };
    if (alCargar) img.onload = alCargar;
    img.src = asset(base + exts[0]);
  }
  function placeholder(slug) {
    return '<div class="pendiente">' + emblema(slug, "") + "<span>Foto próximamente</span></div>";
  }

  /* ---------- páginas ---------- */
  function paginaInicio() {
    var trio = ORDEN.map(function (slug, i) {
      var s = sede(slug), prox = s.estado !== "activa";
      return '<a class="placa" href="' + url(slug) + '" style="--c:' + esc(s.color) + ';--retraso:' + (0.35 + i * 0.5) + 's" aria-label="' + esc(s.nombre + ", " + s.guardian) + '">' +
        emblema(slug, prox ? "apagado" : "letrero") + "<span>" + esc(s.nombre) + "</span></a>";
    }).join("");
    var listaActivas = listaNombres(activas());
    var proximas = ORDEN.filter(function (x) { return sede(x).estado !== "activa"; });
    var textoProximas = proximas.length ? "; " + listaNombres(proximas) + (proximas.length > 1 ? " vienen" : " viene") + " en camino." : ".";

    var vitrinas = activas().map(function (slug, i) {
      var s = sede(slug);
      return '<article class="vitrina" style="--c:' + esc(s.color) + '" data-vitrina="' + slug + '">' +
        '<div class="vitrina-foto"><img alt="" loading="lazy" data-base="assets/sedes/' + slug + '/hero"></div>' +
        '<div class="envoltura vitrina-contenido"><div class="vitrina-emblema">' + emblema(slug, "letrero-scroll") + "</div>" +
        '<div class="vitrina-texto"><h3>' + esc(s.nombre) + "</h3>" +
        '<p class="guardian">' + esc(s.guardian) + (s.provisional && C.modoPropuesta ? ' <span class="provisional">Nombre provisional</span>' : "") + "</p>" +
        "<p>" + esc(s.descripcion) + "</p>" +
        '<p class="direccion">' + SVG.pin + "<span>" + esc(s.direccion) + "</span></p>" + chipEstado(slug) +
        '<div class="acciones"><a class="boton" href="' + url(slug, "agenda") + '">Agendar en ' + esc(s.nombre) + '</a><a class="boton secundario" href="' + url(slug) + '">Ver la sede</a></div>' +
        "</div></div></article>";
    }).join("");
    var proximasHtml = proximas.map(function (slug) {
      var s = sede(slug);
      return '<div class="envoltura"><article class="vitrina-proxima" style="--c:' + esc(s.color) + '"><div class="mini-emblema">' + emblema(slug, "apagado") + "</div>" +
        "<div><h3>" + esc(s.nombre) + '</h3><p class="tenue">' + esc(s.lema) + " Apertura: " + esc((s.apertura || "por anunciar").toLowerCase()) + ".</p></div>" +
        '<a class="boton secundario" href="' + url(slug, "lista") + '">Unirme a la lista</a></article></div>';
    }).join("");
    var opciones = activas().map(function (slug) {
      var s = sede(slug);
      return '<a class="opcion-sede" href="' + url(slug, "agenda") + '" style="--c:' + esc(s.color) + '"><div class="mini-emblema">' + emblema(slug, "letrero-fijo") + "</div>" +
        '<span class="tenue">Agendar en</span><strong>' + esc(s.nombre) + "</strong><small>" + esc(s.direccion) + "</small></a>";
    }).join("");

    var logosLiga = '<div class="logos-liga">' + activas().map(function (slug, i) {
      var s = sede(slug);
      return '<a class="logo-liga" href="' + url(slug) + '" style="--c:' + esc(s.color) + ';--retraso:' + (0.3 + i * 0.45) + 's" aria-label="' + esc("Sede " + s.nombre) + '">' + emblema(slug, "letrero") + "</a>";
    }).join("") + "</div>";
    var pieNombres = activas().map(function (x) { return sede(x).nombre; }).join(" · ") + (proximas.length ? " · Próximamente " + listaNombres(proximas) : "");
    var desde = Math.min.apply(null, C.planes.map(function (p) { return p.precio; }));
    return heroeCentro({
      clase: "heroe-inicio",
      ceja: "Red de gimnasios en Hidalgo",
      emblema: logosLiga,
      titulo: "Infinity Gym",
      lema: "La Liga: cada sede, un Guardián.",
      texto: esc(listaActivas) + (activas().length > 1 ? " ya están encendidas" : " ya está encendida") + esc(textoProximas) + " Mismo equipo, mismos precios y planes desde " + dinero(desde) + ".",
      acciones: '<a class="boton" ' + ancla("agenda") + '>Agendar visita</a><a class="boton secundario" ' + ancla("sedes") + ">Conocer las sedes</a>",
      pie: esc(pieNombres)
    }) +

      '<section><div class="envoltura"><p class="lema-grande">' + esc(C.marca.lema) + "</p>" +
      '<div class="pilares"><div><h3>Disciplina</h3><p>Llegar aunque no tengas ganas. Eso es lo que cambia el cuerpo.</p></div>' +
      "<div><h3>Comunidad</h3><p>Entrenas junto a gente que empieza, regresa o sube de nivel, igual que tú.</p></div>" +
      "<div><h3>Constancia</h3><p>Horarios amplios y planes desde un día para que nada te detenga.</p></div></div></div></section>" +

      '<section class="presentacion transparente" id="sedes"><div class="envoltura"><div class="titulo-seccion"><h2>Tres sedes, una Liga</h2>' +
      "<p>El mismo equipo, los mismos precios y la misma forma de entrenar en " + esc(listaActivas) + ". Lo que cambia es el Guardián que te recibe.</p></div></div>" +
      vitrinas + proximasHtml + "</section>" +

      seccionAreas([
        ["Peso libre", "Mancuernas, barras y discos para entrenar a tu ritmo."],
        ["Máquinas", "Equipo guiado para trabajar todo el cuerpo con seguridad."],
        ["Cardio", "Escaladoras, caminadoras y bicicletas según la sede."],
        ["Zona funcional", "Pasto sintético para circuitos, trineo y peso corporal."],
        ["Coaches", "Te enseñan a usar el equipo y arman tu rutina desde el primer día."],
        ["Horarios amplios", "Entre semana desde temprano hasta la noche, y sábados."]
      ], "Lo que tiene cada Infinity", "Las tres sedes comparten lo esencial para que entrenes igual en cualquiera.") +

      seccionPlanes("Planes", "Los mismos precios en " + esc(listaActivas) + ". Elige uno y agenda tu primera visita en la sede que prefieras.") +

      '<section id="agenda"><div class="envoltura"><div class="titulo-seccion"><h2>Agenda tu visita</h2>' +
      "<p>Cada sede tiene su propia agenda. Elige dónde quieres entrenar: llenas tus datos y te llevamos a WhatsApp con tu solicitud lista. La visita no tiene costo.</p></div>" +
      '<div class="elegir-sede">' + opciones + "</div></div></section>" +

      seccionTestimonios() + seccionPreguntas();
  }

  function paginaSede(slug) {
    var s = sede(slug);
    var horarioFilas = [1, 2, 3, 4, 5, 6, 0].map(function (d) {
      var h = horarioDia(s, d), hoy = ahoraMx().dia === d;
      return '<tr class="' + (hoy ? "hoy" : "") + '"><th scope="row">' + DIAS[d] + "</th><td>" + (h ? hora12(h.abre) + " a " + hora12(h.cierra) : "Cerrado") + "</td></tr>";
    }).join("");
    var galeria = "";
    for (var i = 1; i <= 9; i++) galeria += '<figure class="foto" data-base="assets/sedes/' + slug + "/galeria-" + String(i).padStart(2, "0") + '"><button type="button" aria-label="Ver foto ' + i + ' de ' + esc(s.nombre) + '"><img alt="Foto ' + i + " de Infinity Gym " + esc(s.nombre) + '" loading="lazy"></button></figure>';
    var mapsDir = s.mapaUrl || ("https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(s.mapa));
    var otras = ORDEN.filter(function (x) { return x !== slug; });

    return heroeCentro({
      slug: slug,
      foto: "assets/sedes/" + slug + "/hero",
      ceja: esc(s.guardian),
      emblema: '<div class="heroe-emblema" style="--c:' + esc(s.color) + '">' + emblema(slug, "letrero") + "</div>",
      titulo: "Sede " + esc(s.nombre),
      h1Clase: s.nombre.length > 9 ? "largo" : "",
      lema: esc(s.lema),
      datos: chipEstado(slug) + (s.provisional && C.modoPropuesta ? '<span class="provisional">Nombre provisional</span>' : ""),
      acciones: '<a class="boton" ' + ancla("agenda") + '>Agendar visita</a>' +
        '<a class="boton secundario" href="' + waUrl(s.whatsapp, "Hola, quiero información de Infinity Gym " + s.nombre + ".") + '" target="_blank" rel="noopener" data-wa="' + esc(s.whatsapp) + '">' + SVG.chat + "WhatsApp</a>" +
        '<a class="boton secundario" href="' + mapsDir + '" target="_blank" rel="noopener">' + SVG.pin + "Cómo llegar</a>",
      pie: esc(s.direccion)
    }) +

      '<section><div class="envoltura dos-columnas"><div class="titulo-seccion" style="margin:0"><h2>La sede</h2><p class="entrada" style="color:var(--hueso)">' + esc(s.descripcion) + "</p>" +
      (s.referencias ? '<p class="tenue">' + esc(s.referencias) + "</p>" : "") + "</div>" +
      '<div class="foto-marco" data-foto-sede="' + slug + '"><img alt="Interior de Infinity Gym ' + esc(s.nombre) + '" loading="lazy" data-base="assets/sedes/' + slug + '/la-sede"></div></div></section>' +

      seccionAreas(s.areas || [], "Áreas y equipo", C.modoPropuesta ? "Lista por confirmar con la sede." : "") +
      seccionCoaches(s) +

      seccionPlanes("Planes y precios", "Elige un plan y agenda tu primera visita: te lo explicamos en persona.") +

      '<section id="horarios"><div class="envoltura dos-columnas" style="align-items:start"><div><div class="titulo-seccion"><h2>Horarios</h2>' +
      (C.modoPropuesta ? "<p>Horarios de ejemplo.</p>" : "") + '</div><table class="horario"><caption class="solo-lector">Horario de ' + esc(s.nombre) + "</caption><tbody>" + horarioFilas + "</tbody></table></div>" +
      '<div><div class="titulo-seccion"><h2>Reglas de la casa</h2></div><ul class="reglas">' + C.reglas.map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("") + "</ul></div></div></section>" +

      '<section id="galeria" data-galeria="' + slug + '"><div class="envoltura"><div class="titulo-seccion"><h2>Así se ve</h2></div><div class="galeria">' + galeria + "</div></div></section>" +

      '<section id="ubicacion"><div class="envoltura dos-columnas"><div><div class="titulo-seccion" style="margin-bottom:1.5rem"><h2>Ubicación</h2></div>' +
      '<p class="direccion-grande">' + esc(s.direccion) + "</p>" + (s.referencias ? '<p class="tenue" style="margin-bottom:1.5rem">' + esc(s.referencias) + "</p>" : "") +
      '<div class="acciones" style="margin-top:1.5rem"><a class="boton" href="' + mapsDir + '" target="_blank" rel="noopener">' + SVG.pin + 'Cómo llegar</a>' +
      (s.telefono ? '<a class="boton secundario" href="tel:' + esc(digitos(s.telefono)) + '">Llamar</a>' : "") + "</div>" +
      '<div style="margin-top:2rem">' + redes(s.redes, "Redes de " + s.nombre) + "</div></div>" +
      '<div class="mapa" data-mapa="' + slug + '">' + (BUNDLE
        ? '<div><p class="tenue" style="margin-bottom:1rem">El mapa se muestra en el sitio publicado.</p><a class="boton secundario" href="' + mapsDir + '" target="_blank" rel="noopener">Abrir en Google Maps</a></div>'
        : '<div><p class="tenue" style="margin-bottom:1rem">El mapa se carga al tocar el botón.</p><button class="boton secundario" type="button" data-cargar-mapa>Ver mapa aquí</button></div>') +
      "</div></div></section>" +

      '<section id="agenda"><div class="envoltura agenda"><div class="titulo-seccion"><h2>Agenda tu visita</h2>' +
      "<p>Ven a conocer " + esc(s.nombre) + " antes de inscribirte. Sin costo y sin compromiso.</p>" + pasosAgenda("Eliges día y hora.") + "</div>" +
      formulario("cita", slug) + "</div></section>" +

      '<section><div class="envoltura"><div class="titulo-seccion"><h2>Otras sedes de la Liga</h2></div><div class="letreros" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">' +
      otras.map(tablero).join("") + "</div></div></section>";
  }

  function paginaProxima(slug) {
    var s = sede(slug);
    return heroeCentro({
      ceja: esc(s.guardian),
      emblema: '<div class="heroe-emblema chico" style="--c:' + esc(s.color) + '">' + emblema(slug, "letrero") + "</div>",
      titulo: "Sede " + esc(s.nombre),
      h1Clase: s.nombre.length > 9 ? "largo" : "",
      lema: esc(s.lema),
      datos: chipEstado(slug),
      acciones: '<a class="boton" ' + ancla("lista") + '>Unirme a la lista</a><a class="boton secundario" href="' + url("inicio", "sedes") + '">Ver sedes abiertas</a>',
      pie: esc(s.direccion)
    }) +
      '<section id="lista"><div class="envoltura agenda"><div class="titulo-seccion"><h2>Sé de los primeros</h2><p>' + esc(s.descripcion) + "</p>" +
      pasosAgenda("Te unes a la lista.").replace("Te confirmamos por WhatsApp.", "Te avisamos por WhatsApp la fecha de apertura.").replace("Llegas a tu cita y conoces la sede.", "Conoces la sede antes que nadie.") + "</div>" +
      formulario("lista", slug) + "</div></section>" +
      '<section><div class="envoltura"><div class="titulo-seccion"><h2>Mientras tanto, entrena en la Liga</h2></div><div class="letreros" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">' +
      activas().map(tablero).join("") + "</div></div></section>";
  }

  function paginaAviso() {
    var E = function (t) { return C.modoPropuesta ? '<span class="marca-editar">' + t + "</span>" : t; };
    return '<section><div class="envoltura texto-legal"><h1>Aviso de privacidad</h1>' +
      (C.modoPropuesta ? '<p><strong>Borrador para revisión del cliente.</strong> Los datos subrayados están pendientes.</p>' : "") +
      "<h2>Responsable</h2><p>" + E("[Nombre o razón social]") + ", operador de Infinity Gym, con domicilio en " + E("[domicilio]") + ", es responsable del tratamiento de tus datos personales.</p>" +
      "<h2>Datos que recabamos</h2><p>Nombre, número de WhatsApp, correo electrónico (opcional), sede y plan de interés, objetivo de entrenamiento y, si lo solicitas, día y hora de tu visita.</p>" +
      "<h2>Para qué los usamos</h2><p>Para contactarte, agendar y confirmar tu visita, dar seguimiento a tu inscripción y elaborar estadísticas internas. No usamos tus datos para fines distintos a estos.</p>" +
      "<h2>Dónde se guardan</h2><p>En una hoja de cálculo privada del negocio, alojada en Google, a la que solo accede personal autorizado. No vendemos ni compartimos tus datos con terceros para publicidad.</p>" +
      "<h2>Cuánto tiempo</h2><p>Conservamos tus datos durante " + E("[plazo]") + " o hasta que solicites su eliminación.</p>" +
      "<h2>Tus derechos</h2><p>Puedes acceder, rectificar, cancelar u oponerte al uso de tus datos (derechos ARCO), y revocar tu consentimiento, escribiendo por WhatsApp o a " + E(C.marca.correo || "[correo]") + ". Responderemos en un plazo máximo de 20 días hábiles.</p>" +
      "<h2>Cambios a este aviso</h2><p>Cualquier cambio se publicará en esta página. Última actualización: " + E("[fecha]") + ".</p>" +
      "</div></section>";
  }

  function pagina404() {
    return heroeCentro({
      ceja: "Error 404",
      emblema: '<div class="heroe-emblema chico">' + SVG.misterio.replace('class="emblema"', 'class="emblema apagado"') + "</div>",
      titulo: "Esta zona sigue a oscuras",
      texto: "La página que buscas no existe o cambió de lugar.",
      acciones: '<a class="boton" href="' + url("inicio") + '">Ir al inicio</a><a class="boton secundario" href="' + url("inicio", "sedes") + '">Ver sedes</a>'
    });
  }

  /* ---------- datos estructurados para Google ---------- */
  function jsonLd(page) {
    var old = document.getElementById("ld-json"); if (old) old.remove();
    var base = (C.marca.dominio || "").replace(/\/$/, "");
    var data;
    if (C.sedes[page]) {
      var s = sede(page), precios = C.planes.map(function (p) { return p.precio; });
      data = {
        "@context": "https://schema.org", "@type": "ExerciseGym", name: "Infinity Gym " + s.nombre,
        url: base + "/" + page + ".html", image: base + "/assets/img/og-infinity.jpg",
        address: { "@type": "PostalAddress", streetAddress: s.direccion, addressRegion: "Hidalgo", addressCountry: "MX" },
        priceRange: dinero(Math.min.apply(null, precios)) + " a " + dinero(Math.max.apply(null, precios)) + " MXN",
        openingHoursSpecification: (s.horario || []).map(function (b) {
          return { "@type": "OpeningHoursSpecification", dayOfWeek: b.dias.map(function (d) { return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d]; }), opens: b.abre, closes: b.cierra };
        }),
        sameAs: Object.keys(s.redes || {}).map(function (k) { return s.redes[k]; }).filter(Boolean)
      };
      if (digitos(s.telefono).length >= 10) data.telephone = "+52" + digitos(s.telefono).slice(-10);
    } else {
      data = { "@context": "https://schema.org", "@type": "Organization", name: "Infinity Gym", url: base + "/", logo: base + "/assets/img/logo-infinity-tezontepec.png",
        sameAs: Object.keys(C.marca.redes || {}).map(function (k) { return C.marca.redes[k]; }).filter(Boolean) };
    }
    var sc = document.createElement("script");
    sc.type = "application/ld+json"; sc.id = "ld-json"; sc.textContent = JSON.stringify(data);
    document.head.appendChild(sc);
  }

  /* ---------- atmósfera de fondo: telaraña en Mixquiahuala (sin humo) ---------- */
  var ATM = { listo: false, tema: "", ac: [248, 205, 12] };
  function colorAcento() {
    var c = getComputedStyle(document.body).getPropertyValue("--acento").trim() || "#F8CD0C";
    var m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(c);
    return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [248, 205, 12];
  }
  function rgba(c, a) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")"; }
  function atmosfera(tema) {
    var cont = document.querySelector(".atmosfera");
    if (!cont) return;
    cont.setAttribute("data-tema", tema);
    if (ATM.envoltorio) ATM.envoltorio.setAttribute("data-tema", tema);
    ATM.tema = tema; ATM.ac = colorAcento();
    if (ATM.listo) { if (reduceMotion) ATM.dibujar(4000); return; }
    ATM.listo = true;
    if (C.videoFondo && !reduceMotion && !BUNDLE) {
      var v = document.createElement("video");
      v.src = asset(C.videoFondo); v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true; v.setAttribute("aria-hidden", "true");
      cont.appendChild(v);
      document.addEventListener("visibilitychange", function () { if (document.hidden) v.pause(); else v.play().catch(function () {}); });
      ATM.dibujar = function () {};
      return;
    }
    var capa = document.createElement("canvas");
    var cx = capa.getContext("2d");
    if (!cx) return;
    var envoltorio = document.createElement("div");
    envoltorio.className = "atmosfera-capa"; envoltorio.setAttribute("aria-hidden", "true");
    envoltorio.appendChild(capa);
    document.body.appendChild(envoltorio);
    ATM.envoltorio = envoltorio;
    var W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    function medir() {
      W = innerWidth; H = innerHeight; capa.width = Math.round(W * DPR); capa.height = Math.round(H * DPR);
      cx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    medir(); addEventListener("resize", medir);
    function telarana(ax, ay, R, a0, a1, rayos, anillos, t, fase) {
      var giro = Math.sin(t * 0.0004 + fase) * 0.012;
      var ang = [], k, q;
      for (k = 0; k < rayos; k++) ang.push(a0 + (a1 - a0) * (k / (rayos - 1)) + giro + Math.sin(k * 2.7) * 0.03);
      cx.lineWidth = 1;
      cx.strokeStyle = "rgba(236,228,216,0.13)";
      cx.beginPath();
      for (k = 0; k < rayos; k++) { cx.moveTo(ax, ay); cx.lineTo(ax + Math.cos(ang[k]) * R, ay + Math.sin(ang[k]) * R); }
      cx.stroke();
      for (q = 1; q <= anillos; q++) {
        var rr = R * Math.pow(q / anillos, 1.15) * (1 + Math.sin(t * 0.0009 + q + fase) * 0.006);
        cx.strokeStyle = q % 4 === 0 ? rgba(ATM.ac, 0.22) : "rgba(236,228,216,0.10)";
        cx.beginPath();
        for (k = 0; k < rayos; k++) {
          var x = ax + Math.cos(ang[k]) * rr, y = ay + Math.sin(ang[k]) * rr;
          if (k === 0) cx.moveTo(x, y);
          else {
            var am = (ang[k] + ang[k - 1]) / 2, rc = rr * 0.9;
            cx.quadraticCurveTo(ax + Math.cos(am) * rc, ay + Math.sin(am) * rc, x, y);
          }
        }
        cx.stroke();
      }
    }
    function arana(t) {
      var x = W * 0.72, ciclo = (t % 26000) / 26000;
      var baja = ciclo < 0.5 ? ciclo * 2 : (1 - ciclo) * 2;
      var y = 40 + baja * baja * (3 - 2 * baja) * H * 0.32;
      cx.strokeStyle = "rgba(236,228,216,0.22)"; cx.lineWidth = 1;
      cx.beginPath(); cx.moveTo(x, 0); cx.lineTo(x, y - 6); cx.stroke();
      cx.save(); cx.translate(x, y);
      cx.strokeStyle = "rgba(236,228,216,0.5)"; cx.lineWidth = 1.2;
      var mov = Math.sin(t * 0.004) * 0.08;
      for (var lado = -1; lado <= 1; lado += 2) {
        for (var k = 0; k < 4; k++) {
          var a = (-0.9 + k * 0.55 + mov * (k % 2 ? 1 : -1));
          var x1 = lado * Math.cos(a) * 7, y1 = Math.sin(a) * 7;
          cx.beginPath(); cx.moveTo(0, 2); cx.lineTo(x1, y1 - 2); cx.lineTo(x1 * 1.7, y1 * 1.7 + 6); cx.stroke();
        }
      }
      cx.fillStyle = "#0B0907"; cx.strokeStyle = rgba(ATM.ac, 0.7);
      cx.beginPath(); cx.ellipse(0, 6, 5, 6.5, 0, 0, 6.283); cx.fill(); cx.stroke();
      cx.beginPath(); cx.arc(0, -2, 3.2, 0, 6.283); cx.fill(); cx.stroke();
      cx.restore();
    }
    envoltorio.setAttribute("data-tema", ATM.tema);
    ATM.dibujar = function (t) {
      cx.clearRect(0, 0, W, H);
      if (ATM.tema === "telarana") {
        var R = Math.max(W, H) * 0.62;
        telarana(W * 0.9, -20, R, Math.PI * 0.42, Math.PI * 1.08, 15, 13, t, 0);
        telarana(-10, H + 10, R * 0.55, -Math.PI * 0.5, 0.05, 10, 9, t, 2);
        arana(t);
      }
    };
    if (reduceMotion) { ATM.dibujar(4000); return; }
    var ultimo = 0, inicio = performance.now();
    function cuadro(ahora) {
      if (!document.hidden && ahora - ultimo > 30) { ATM.dibujar(ahora - inicio + 4000); ultimo = ahora; }
      requestAnimationFrame(cuadro);
    }
    requestAnimationFrame(cuadro);
  }

  /* ---------- fondo difuso y figuras animadas ---------- */
  var ARANA_SVG = '<svg viewBox="0 0 40 40" aria-hidden="true"><g class="patas" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round">' +
    '<path d="M17 18 9 12 4 14M17 20 8 19 3 22M18 22 10 27 6 33M19 23 14 30 13 36M23 18 31 12 36 14M23 20 32 19 37 22M22 22 30 27 34 33M21 23 26 30 27 36"/></g>' +
    '<ellipse cx="20" cy="24" rx="5" ry="6.5" fill="#0B0907" stroke="currentColor" stroke-width="1.4"/><circle cx="20" cy="15.5" r="3.6" fill="#0B0907" stroke="currentColor" stroke-width="1.4"/></svg>';
  function colgante(x, baja, dur, del, color, extra) {
    return '<div class="colgante' + (extra || "") + '" style="left:' + x + '%;--baja:' + baja + 'vh;--dur:' + dur + 's;--del:' + del + 's;--c:' + color + '"><div class="cuerda"><span class="hilo"></span><span class="arana">' + ARANA_SVG + "</span></div></div>";
  }
  function vuelo(img, top, dur, del, tam, glow, extra) {
    return '<div class="vuelo' + (extra || "") + '" style="top:' + top + '%;--dur:' + dur + 's;--del:' + del + 's;--tam:' + tam + 'px;--g:' + glow + '"><div class="ondula"><img class="aletea" alt="" src="' + asset(img) + '"></div></div>';
  }
  function flota(img, x, y, dx, dy, dur, del, tam, glow, extra) {
    var contenido = img.indexOf("<svg") === 0 ? img : '<img alt="" src="' + asset(img) + '">';
    return '<div class="flota' + (extra || "") + '" style="left:' + x + '%;top:' + y + '%;--dx:' + dx + 'vw;--dy:' + dy + 'vh;--dur:' + dur + 's;--del:' + del + 's;--tam:' + tam + 'px;--g:' + glow + '"><div class="gira">' + contenido + "</div></div>";
  }
  var M = { bat: "assets/img/emblema-murcielago.webp", escudo: "assets/img/emblema-escudo.webp", arana: "assets/img/emblema-arana.webp" };
  function figuras(page) {
    var Y = "#F8CD0C", R = "#F0283C", B = "#4C8DFF", E = " extra";
    // pocas figuras y lentas: acompañan, no saturan
    if (page === "inicio") return colgante(8, 30, 14, -2, R) + colgante(91, 40, 17, -9, R, E) +
      vuelo(M.bat, 18, 52, -14, 54, Y) + flota(M.escudo, 84, 66, -5, -8, 26, -8, 44, B, E);
    if (page === "tezontepec") return vuelo(M.bat, 16, 48, -6, 60, Y) + vuelo(M.bat, 62, 60, -32, 46, Y, " reversa" + E);
    if (page === "mixquiahuala") return colgante(7, 28, 13, -1, R) + colgante(62, 20, 12, -5, R, E) + colgante(92, 36, 16, -9, R);
    if (page === "progreso") return flota(M.escudo, 7, 24, 6, 10, 24, -3, 52, B) + flota(M.escudo, 84, 64, -6, -9, 28, -12, 42, B, E);
    if (page === "tlahuelilpan") return flota(SVG.misterio, 10, 30, 6, 10, 26, -4, 52, "#D8C7A3") + flota(SVG.misterio, 82, 62, -6, -8, 30, -9, 42, "#D8C7A3", E);
    return "";
  }
  function capasFondo(page) {
    var fondo = document.getElementById("fondo-difuso"), figs = document.getElementById("figuras");
    if (!fondo) { fondo = document.createElement("div"); fondo.id = "fondo-difuso"; fondo.className = "fondo-difuso"; fondo.setAttribute("aria-hidden", "true"); document.body.insertBefore(fondo, document.body.firstChild); }
    if (!figs) { figs = document.createElement("div"); figs.id = "figuras"; figs.className = "figuras"; figs.setAttribute("aria-hidden", "true"); document.body.appendChild(figs); }
    var clave = C.sedes[page] ? page : (page === "inicio" ? "inicio" : "inicio");
    var src = asset("assets/img/fondo-" + clave + ".webp");
    fondo.style.backgroundImage = src ? 'url("' + src + '")' : "none";
    figs.innerHTML = reduceMotion ? "" : figuras(page);
  }

  /* ---------- interacciones ---------- */
  function iniciarInteracciones(page) {
    // menú móvil
    var boton = app.querySelector(".menu-boton"), nav = app.querySelector("#nav");
    if (boton && nav) {
      var cerrar = function () { nav.classList.remove("abierta"); boton.setAttribute("aria-expanded", "false"); document.body.style.overflow = ""; };
      boton.addEventListener("click", function () {
        var abrir = !nav.classList.contains("abierta");
        nav.classList.toggle("abierta", abrir); boton.setAttribute("aria-expanded", String(abrir));
        document.body.style.overflow = abrir ? "hidden" : "";
      });
      nav.addEventListener("click", function (e) { if (e.target.closest("a")) cerrar(); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") cerrar(); });
    }

    // formularios
    app.querySelectorAll("form[data-form]").forEach(prepararFormulario);

    // "Lo quiero" en planes
    app.querySelectorAll("[data-plan]").forEach(function (b) {
      b.addEventListener("click", function () {
        var form = app.querySelector('form[data-form="cita"]');
        if (!form) return;
        if (form.elements.plan) form.elements.plan.value = b.getAttribute("data-plan");
        if (form.elements.quiereCita && !form.elements.quiereCita.checked) { form.elements.quiereCita.checked = true; form.elements.quiereCita.dispatchEvent(new Event("change")); }
        var destino = document.getElementById("agenda");
        if (destino) destino.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        setTimeout(function () { form.elements.nombre.focus({ preventScroll: true }); }, reduceMotion ? 0 : 500);
      });
    });

    // vitrinas del inicio: foto de fondo y letrero que se enciende al aparecer
    var vitrinas = app.querySelectorAll("[data-vitrina]");
    vitrinas.forEach(function (v) {
      var img = v.querySelector(".vitrina-foto img");
      cargarFoto(img, img.getAttribute("data-base"), function () { v.classList.add("sin-foto"); });
    });
    if (vitrinas.length) {
      if ("IntersectionObserver" in window && !reduceMotion) {
        var io = new IntersectionObserver(function (entradas) {
          entradas.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } });
        }, { threshold: 0.35 });
        vitrinas.forEach(function (v) { io.observe(v); });
      } else vitrinas.forEach(function (v) { v.classList.add("visible"); });
    }

    // foto del héroe de sede
    var heroe = app.querySelector("[data-hero]");
    if (heroe) {
      var himg = heroe.querySelector(".foto-fondo img");
      cargarFoto(himg, himg.getAttribute("data-base"), function () { heroe.classList.add("sin-foto"); });
    }
    // foto "La sede"
    app.querySelectorAll("[data-foto-sede]").forEach(function (marco) {
      var img = marco.querySelector("img"), slug = marco.getAttribute("data-foto-sede");
      cargarFoto(img, img.getAttribute("data-base"), function () {
        if (C.modoPropuesta) { marco.innerHTML = placeholder(slug); marco.style.aspectRatio = "4 / 5"; }
        else marco.remove();
      });
    });

    // galería
    var gal = app.querySelector("[data-galeria]");
    if (gal) {
      var slugG = gal.getAttribute("data-galeria"), figuras = gal.querySelectorAll(".foto"), pendientes = figuras.length;
      var revisar = function () { if (--pendientes === 0 && !gal.querySelector(".foto button img[src]") && !C.modoPropuesta) gal.remove(); };
      figuras.forEach(function (fig) {
        var img = fig.querySelector("img");
        cargarFoto(img, fig.getAttribute("data-base"), function () {
          img.removeAttribute("src");
          if (C.modoPropuesta) fig.innerHTML = placeholder(slugG); else fig.remove();
          revisar();
        }, revisar);
      });
      gal.addEventListener("click", function (e) {
        var b = e.target.closest(".foto button"); if (!b) return;
        var fotos = Array.prototype.slice.call(gal.querySelectorAll(".foto button img[src]"));
        var img = b.querySelector("img[src]"); if (!img) return;
        abrirVisor(fotos, fotos.indexOf(img));
      });
    }

    // mapa bajo demanda
    app.querySelectorAll("[data-cargar-mapa]").forEach(function (b) {
      b.addEventListener("click", function () {
        var caja = b.closest("[data-mapa]"), s = sede(caja.getAttribute("data-mapa"));
        caja.innerHTML = '<iframe title="Mapa de Infinity Gym ' + esc(s.nombre) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=' + encodeURIComponent(s.mapa) + '&output=embed"></iframe>';
      });
    });

    // aviso de número de ejemplo
    app.querySelectorAll("[data-wa]").forEach(function (a) {
      a.addEventListener("click", function () {
        if (digitos(a.getAttribute("data-wa")).length < 11 && C.modoPropuesta) aviso("Número de WhatsApp de ejemplo: configúralo en config.js. Se abre WhatsApp para elegir contacto.");
      });
    });

    // reflector en La Liga
    var liga = app.querySelector(".liga");
    if (liga && window.matchMedia("(pointer: fine)").matches) {
      var pend = false, ev = null;
      liga.addEventListener("pointermove", function (e) {
        ev = e; if (pend) return; pend = true;
        requestAnimationFrame(function () {
          var r = liga.getBoundingClientRect();
          liga.style.setProperty("--mx", (ev.clientX - r.left) + "px");
          liga.style.setProperty("--my", (ev.clientY - r.top) + "px");
          pend = false;
        });
      });
    }

    // actualizar "abierto ahora" cada minuto
    clearInterval(window.__estadoTimer);
    window.__estadoTimer = setInterval(function () {
      document.querySelectorAll("[data-estado]").forEach(function (el) {
        var e = estado(sede(el.getAttribute("data-estado")));
        el.className = "estado " + e.clase; el.textContent = e.texto;
      });
    }, 60000);
  }

  // visor de fotos
  var visor = null, visorFotos = [], visorI = 0, visorOrigen = null;
  function abrirVisor(fotos, i) {
    if (!visor) {
      visor = document.createElement("div");
      visor.className = "visor"; visor.hidden = true;
      visor.setAttribute("role", "dialog"); visor.setAttribute("aria-modal", "true"); visor.setAttribute("aria-label", "Foto ampliada");
      visor.innerHTML = '<img alt=""><button class="cerrar" type="button" aria-label="Cerrar">×</button><button class="anterior" type="button" aria-label="Foto anterior">‹</button><button class="siguiente" type="button" aria-label="Foto siguiente">›</button>';
      document.body.appendChild(visor);
      visor.querySelector(".cerrar").addEventListener("click", cerrarVisor);
      visor.querySelector(".anterior").addEventListener("click", function () { mostrar(visorI - 1); });
      visor.querySelector(".siguiente").addEventListener("click", function () { mostrar(visorI + 1); });
      visor.addEventListener("click", function (e) { if (e.target === visor) cerrarVisor(); });
      document.addEventListener("keydown", function (e) {
        if (visor.hidden) return;
        if (e.key === "Escape") cerrarVisor();
        if (e.key === "ArrowLeft") mostrar(visorI - 1);
        if (e.key === "ArrowRight") mostrar(visorI + 1);
      });
    }
    visorFotos = fotos; visorOrigen = document.activeElement;
    mostrar(i); visor.hidden = false; document.body.style.overflow = "hidden";
    visor.querySelector(".cerrar").focus();
  }
  function mostrar(i) {
    if (!visorFotos.length) return;
    visorI = (i + visorFotos.length) % visorFotos.length;
    var img = visor.querySelector("img"), src = visorFotos[visorI];
    img.src = src.currentSrc || src.src; img.alt = src.alt;
    var multi = visorFotos.length > 1;
    visor.querySelector(".anterior").hidden = !multi; visor.querySelector(".siguiente").hidden = !multi;
  }
  function cerrarVisor() { visor.hidden = true; document.body.style.overflow = ""; if (visorOrigen) visorOrigen.focus(); }

  // desplazamiento a anclas internas (funciona igual en vista previa y en el sitio)
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-scroll]");
    if (!a) return;
    var destino = document.getElementById(a.getAttribute("data-scroll"));
    if (!destino) return;
    e.preventDefault();
    destino.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    if (a.getAttribute("data-scroll") === "contenido") { destino.setAttribute("tabindex", "-1"); destino.focus({ preventScroll: true }); }
  });

  /* ---------- enrutador ---------- */
  var TITULOS = {
    inicio: "Infinity Gym | La Liga de gimnasios en Hidalgo",
    "aviso-de-privacidad": "Aviso de privacidad | Infinity Gym",
    "404": "Página no encontrada | Infinity Gym"
  };
  function ruta() {
    if (BUNDLE) {
      var h = (location.hash || "").replace(/^#\/?/, "").split("/");
      var p = h[0] || "inicio";
      if (!(p === "inicio" || p === "aviso-de-privacidad" || C.sedes[p])) p = "inicio";
      return { page: p, ancla: h[1] || "" };
    }
    return { page: document.body.getAttribute("data-page") || "inicio", ancla: (location.hash || "").replace("#", "") };
  }
  function render(primera) {
    var r = ruta(), page = r.page, s = C.sedes[page];
    document.body.setAttribute("data-sede", s ? page : "");
    if (s && s.color) document.body.style.setProperty("--acento", s.color); else document.body.style.removeProperty("--acento");
    var main;
    if (page === "inicio") main = paginaInicio();
    else if (page === "aviso-de-privacidad") main = paginaAviso();
    else if (page === "404") main = pagina404();
    else if (s && s.estado === "activa") main = paginaSede(page);
    else if (s) main = paginaProxima(page);
    else main = pagina404();
    var insignia = C.modoPropuesta ? '<div class="insignia-propuesta">Vista de propuesta: los precios, horarios y contactos son de ejemplo.</div>' : "";
    app.innerHTML = insignia + encabezado(page) + '<main id="contenido">' + main + "</main>" + pie() + flotantes(page);
    if (BUNDLE) document.title = TITULOS[page] || ("Infinity Gym " + s.nombre + " | " + s.guardian);
    document.dispatchEvent(new Event("infinity:pagina"));
    iniciarInteracciones(page);
    jsonLd(page);
    atmosfera(s && s.tema ? s.tema : (page === "inicio" ? "brasas" : "humo"));
    capasFondo(page);
    var fig = document.getElementById("figuras"); if (fig && ATM.envoltorio) document.body.appendChild(fig);
    if (r.ancla) {
      var dest = document.getElementById(r.ancla);
      if (dest) setTimeout(function () { dest.scrollIntoView({ block: "start" }); }, primera ? 60 : 0);
    } else if (!primera) window.scrollTo(0, 0);
  }
  if (BUNDLE) window.addEventListener("hashchange", function () { render(false); });
  render(true);
})();

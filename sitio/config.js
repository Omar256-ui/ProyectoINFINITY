/* ==========================================================================
   INFINITY GYM · CONFIGURACIÓN DEL SITIO
   Este es el único archivo que necesitas editar para cambiar datos:
   sedes, horarios, precios, WhatsApp, redes sociales y la conexión con Google Sheets.
   Guarda el archivo y recarga la página. Si cambias fotos, sube el número de "version".
   ========================================================================== */
window.INFINITY = {
  // true = muestra la insignia "Vista de propuesta" y marca los datos de ejemplo.
  // Cámbialo a false cuando todos los datos sean reales.
  modoPropuesta: true,

  // Súbelo (por ejemplo a "20261105") cada vez que reemplaces fotos, para que se vean al instante.
  version: "20261029",

  // URL /exec del Apps Script de Google Sheets (ver google-sheets/CONECTAR-GOOGLE-SHEETS.md).
  // Vacío = los formularios mandan directo a WhatsApp.
  registros: {
    endpoint: "https://script.google.com/macros/s/AKfycbwDfxNo88NXWJiLgc6KpyKxpq5goIDyhtUUm3fC6w-pJ4NYyNBRDiLpovo6apPZOtGuHQ/exec",
    diasMaximosCita: 30
  },

  // Opcional: ruta a un video propio de fondo (ej. "assets/video/humo.mp4").
  // Vacío = sin video de fondo (el cliente pidió quitar el humo).
  videoFondo: "",

  marca: {
    nombre: "Infinity Gym",
    lema: "Siempre parece imposible hasta que se hace.",
    whatsapp: "527714869500",             // 771 486 9500 (número del volante)
    correo: "",                           // EDITAR: ej. contacto@infinitygym.mx
    dominio: "https://www.ejemplo.com",   // EDITAR: dominio final
    redes: { instagram: "https://www.instagram.com/infinity_gym_23/" }
  },

  // Precios generales (iguales en todas las sedes). Los nombres deben coincidir con la hoja "Catálogos".
  planes: [
    { nombre: "Visita del día", precio: 50, detalle: "Un día completo de entrenamiento.", principal: true, meses: 0 },
    { nombre: "Semana", precio: 200, detalle: "Siete días seguidos para tomar ritmo.", principal: true, meses: 0 },
    { nombre: "Quincena", precio: 250, detalle: "Quince días de acceso.", principal: true, meses: 0 },
    { nombre: "Mensualidad", precio: 400, detalle: "Acceso todos los días del mes.", principal: true, destacado: true, meses: 1 },
    { nombre: "Trimestre", precio: 1000, detalle: "Tres meses con un solo pago.", principal: true, meses: 3 },
    { nombre: "Pareja", precio: 600, detalle: "Dos personas, al mes.", principal: true, meses: 0 }   // EDITAR: confirmar si es mensual
  ],
  inscripcion: null,   // EDITAR: monto de inscripción si existe (ej. 150). null = no se muestra.

  tiposCita: ["Visita guiada", "Clase de prueba", "Valoración"],

  // Días: 0 = domingo, 1 = lunes … 6 = sábado. Horarios de EJEMPLO.
  // tema: "humo" (murciélago), "telarana" (araña) o "chispas" (escudo).
  sedes: {
    tezontepec: {
      nombre: "Tezontepec",
      estado: "activa",
      guardian: "El Guardián Nocturno",
      provisional: false,
      emblema: "murcielago",
      tema: "humo",
      color: "#F8CD0C",
      lema: "Siempre parece imposible hasta que se hace.",
      descripcion: "Paredes negras, luz baja y el letrero del murciélago encendido al fondo. Una sede para entrenar concentrado, sin distracciones, a la hora que tu día lo permita.",
      direccion: "Allende 562, Centro, Tezontepec de Aldama, Hgo.",
      referencias: "",
      mapa: "GYM INFINITY 2, Allende 562, Centro, 42760 Tezontepec de Aldama, Hgo.",
      mapaUrl: "https://maps.app.goo.gl/Uqk7M4awYJGNXFiS8",
      whatsapp: "527714869500",
      telefono: "7714869500",
      horario: [
        { dias: [1, 2, 3, 4, 5], abre: "06:00", cierra: "22:00" },
        { dias: [6], abre: "08:00", cierra: "15:00" }
      ],
      horariosCita: ["07:00", "09:00", "11:00", "17:00", "18:00", "19:00", "20:00"],
      areas: [
        ["Peso libre", "Mancuernas, barras y discos para trabajar a tu ritmo."],
        ["Máquinas de discos", "Pecho, espalda y pierna con carga guiada."],
        ["Poleas y crossover", "Torre de poleas para aislar cada músculo."],
        ["Cardio", "Caminadoras y bicicletas para calentar o quemar."],
        ["Zona funcional", "Pasto sintético para trineo, cuerdas y circuitos."],
        ["Estiramiento", "Espejos y espacio para movilidad al final."]
      ],
      coaches: [   // EDITAR: nombres de ejemplo
        ["Daniel R.", "Fuerza e hipertrofia", "Lunes a viernes, mañanas"],
        ["Karla M.", "Funcional y acondicionamiento", "Lunes a viernes, tardes"],
        ["Iván S.", "Rutinas para principiantes", "Sábados"]
      ],
      redes: { facebook: "https://www.facebook.com/share/1Dz2hCZHog/", instagram: "https://www.instagram.com/infinity_gym_23/", google: "https://maps.app.goo.gl/Uqk7M4awYJGNXFiS8" }
    },
    mixquiahuala: {
      nombre: "Mixquiahuala",
      estado: "activa",
      guardian: "El Tejedor",
      provisional: true,
      emblema: "assets/img/emblema-arana.webp",
      tema: "telarana",
      color: "#F0283C",
      lema: "Cada repetición es un hilo más.",
      descripcion: "La Liga en el Valle del Mezquital. Fuerza que se teje sesión tras sesión, con coaches que te acompañan desde el primer día.",
      direccion: "Calle Francisco Javier Mina 7, 1ra Demarcación Poniente, Mixquiahuala, Hgo.",
      referencias: "",
      mapa: "INFINITY GYM - MIXQUIAHUALA, Calle Francisco Javier Mina 7, 1ra Demarcación Poniente, 42700 Mixquiahuala, Hgo.",
      mapaUrl: "https://maps.app.goo.gl/QAoUaGogvMMmd6VP7",
      whatsapp: "527714869500",
      telefono: "7714869500",
      horario: [
        { dias: [1, 2, 3, 4, 5], abre: "06:00", cierra: "22:00" },
        { dias: [6], abre: "08:00", cierra: "15:00" }
      ],
      horariosCita: ["07:00", "09:00", "11:00", "17:00", "18:00", "19:00", "20:00"],
      areas: [
        ["Peso libre", "Mancuernas, barras y discos."],
        ["Racks y multiestaciones", "Sentadilla, press y poleas en una sola estación."],
        ["Máquinas", "Equipo guiado para todo el cuerpo."],
        ["Cardio", "Para calentar, quemar o mejorar condición."],
        ["Zona funcional", "Cajones, circuitos y trabajo con peso corporal."],
        ["Espejos", "Para cuidar la técnica en cada repetición."]
      ],
      coaches: [
        ["Óscar L.", "Powerlifting y fuerza", "Lunes a viernes, mañanas"],
        ["Fernanda T.", "Pérdida de grasa", "Lunes a viernes, tardes"],
        ["Ricardo P.", "Hipertrofia", "Noches y sábados"]
      ],
      redes: { facebook: "https://www.facebook.com/share/18bEDw7gmS/", instagram: "https://www.instagram.com/infinity_gym_23/", google: "https://maps.app.goo.gl/QAoUaGogvMMmd6VP7" }
    },
    progreso: {
      nombre: "Progreso",
      estado: "activa",
      guardian: "El Centinela",
      provisional: true,
      emblema: "assets/img/emblema-escudo.webp",
      tema: "chispas",
      color: "#4C8DFF",
      lema: "Firme hoy, más fuerte mañana.",
      descripcion: "Una nave amplia con pasto sintético, escaladoras, racks y peso libre para entrenar sin esperar turno. Aquí se viene a resistir un día más.",
      direccion: "Francisco I. Madero 9, Centro, Progreso de Obregón, Hgo.",
      referencias: "",
      mapa: "GYM INFINITY, Francisco I Madero 9, Centro, 42730 Progreso de Obregón, Hgo.",
      mapaUrl: "https://maps.app.goo.gl/mS6iqBzLZxZkhutb6",
      whatsapp: "527714869500",
      telefono: "7714869500",
      horario: [
        { dias: [1, 2, 3, 4, 5], abre: "06:00", cierra: "22:00" },
        { dias: [6], abre: "08:00", cierra: "15:00" }
      ],
      horariosCita: ["07:00", "09:00", "11:00", "17:00", "18:00", "19:00", "20:00"],
      areas: [
        ["Peso libre", "Racks de mancuernas y barras de todos los pesos."],
        ["Máquinas de discos", "Equipo de carga guiada para pecho, espalda y pierna."],
        ["Escaladoras", "Cardio de escalera para piernas y condición."],
        ["Racks de sentadilla", "Espacio para sentadilla, press y peso muerto."],
        ["Poleas", "Estaciones de polea alta y baja."],
        ["Zona funcional", "Pasto sintético para trineo y circuitos."]
      ],
      coaches: [
        ["Jorge A.", "Hipertrofia", "Lunes a viernes, mañanas"],
        ["Mariana P.", "Glúteo y pierna", "Lunes a viernes, tardes"],
        ["Luis C.", "Acondicionamiento", "Noches y sábados"]
      ],
      redes: { facebook: "https://www.facebook.com/share/1KTy4Mqw41/", instagram: "https://www.instagram.com/infinity_gym_23/", google: "https://maps.app.goo.gl/mS6iqBzLZxZkhutb6" }
    },
    tlahuelilpan: {
      nombre: "Tlahuelilpan",
      estado: "proximamente",
      guardian: "Por revelar",
      provisional: false,
      emblema: "misterio",
      tema: "humo",
      color: "#D8C7A3",
      lema: "Su Guardián está por revelarse.",
      descripcion: "La cuarta sede de la Liga viene en camino. Únete a la lista y entérate antes que nadie de la fecha de apertura.",
      direccion: "Tlahuelilpan, Hidalgo",
      referencias: "",
      mapa: "Tlahuelilpan, Hidalgo",
      apertura: "Por anunciar",
      whatsapp: "527714869500",
      redes: { instagram: "https://www.instagram.com/infinity_gym_23/" }
    }
  },

  preguntas: [
    ["¿Necesito experiencia para empezar?", "No. Te mostramos el gimnasio y una rutina de inicio para tu primera semana."],
    ["¿Puedo conocer el gimnasio antes de inscribirme?", "Sí. Agenda una visita guiada o una clase de prueba en la sede que prefieras."],
    ["¿Qué llevo el primer día?", "Ropa deportiva, tenis limpios, toalla y agua."],
    ["¿Los precios son iguales en todas las sedes?", "Sí. Visita, semana, quincena, mensualidad, trimestre y pareja cuestan lo mismo en Tezontepec, Mixquiahuala y Progreso."],
    ["¿Cómo puedo pagar?", "En efectivo o por transferencia en recepción."],
    ["¿Mi membresía sirve en todas las sedes?", "Pregunta en recepción: depende del plan que elijas."],
    ["¿Cómo agendo mi visita?", "Entra a la página de tu sede, elige día y hora, y te llevamos a WhatsApp con tu solicitud lista para enviar."]
  ],

  testimonios: [
    ["Llegué sin saber usar una sola máquina. Hoy entreno cinco días a la semana.", "A. R., Tezontepec"],
    ["El ambiente te prende. Con la luz baja y la música no hay forma de distraerse.", "M. G., Tezontepec"],
    ["Me inscribí por un mes y ya voy para un año.", "J. L., Tezontepec"]
  ],

  reglas: [
    "Trae toalla y úsala en bancas y colchonetas.",
    "Usa tenis deportivos limpios.",
    "Regresa discos y mancuernas a su lugar.",
    "Comparte la máquina entre series."
  ]
};

-- Infinity Gym · Esquema MySQL (para cuando se migre de Google Sheets a Hostinger)
-- Mismo modelo que la hoja: sedes, planes con precio por sede, registros con estatus y su historial.
-- Importar en Hostinger: hPanel → Bases de datos → phpMyAdmin → Importar este archivo.

SET NAMES utf8mb4;

CREATE TABLE sedes (
  id            TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  nombre        VARCHAR(40)  NOT NULL UNIQUE,
  estado        ENUM('Activa','Próximamente') NOT NULL DEFAULT 'Activa',
  guardian      VARCHAR(60),
  whatsapp      VARCHAR(15),
  direccion     VARCHAR(200)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE planes (
  id            SMALLINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  nombre        VARCHAR(60)  NOT NULL UNIQUE,
  activo        BOOLEAN      NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE precios (
  sede_id       TINYINT UNSIGNED  NOT NULL,
  plan_id       SMALLINT UNSIGNED NOT NULL,
  precio_mxn    DECIMAL(8,2)      NOT NULL,
  vigente_desde DATE              NOT NULL,
  PRIMARY KEY (sede_id, plan_id, vigente_desde),
  FOREIGN KEY (sede_id) REFERENCES sedes(id),
  FOREIGN KEY (plan_id) REFERENCES planes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE registros (
  id               INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  creado_en        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  origen           ENUM('Sitio web','WhatsApp','Recepción','Facebook','Instagram','TikTok','Recomendación','Otro') NOT NULL,
  nombre           VARCHAR(80)  NOT NULL,
  telefono         VARCHAR(20)  NOT NULL,
  correo           VARCHAR(80),
  sede_id          TINYINT UNSIGNED,
  plan_id          SMALLINT UNSIGNED,
  objetivo         VARCHAR(120),
  tipo_cita        ENUM('Visita guiada','Clase de prueba','Valoración','Inscripción'),
  cita_en          DATETIME,
  estatus          ENUM('Nuevo','Contactado','Cita solicitada','Cita confirmada','Asistió','No asistió','Inscrito','No concretado')
                   NOT NULL DEFAULT 'Nuevo',
  monto_pagado_mxn DECIMAL(8,2),
  forma_pago       ENUM('Efectivo','Transferencia','Tarjeta'),
  motivo_no        ENUM('Precio','Horario','Distancia','Solo comparaba','No respondió','Eligió otro gym','Otro'),
  atendio          VARCHAR(40),
  notas            VARCHAR(300),
  actualizado_en   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  consentimiento   BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (sede_id) REFERENCES sedes(id),
  FOREIGN KEY (plan_id) REFERENCES planes(id),
  INDEX idx_estatus_cita (estatus, cita_en),
  INDEX idx_creado (creado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Cada cambio de estatus queda registrado (quién, cuándo, de qué a qué).
CREATE TABLE historial_estatus (
  id             INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  registro_id    INT UNSIGNED NOT NULL,
  estatus_antes  VARCHAR(20),
  estatus_despues VARCHAR(20) NOT NULL,
  cambiado_en    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cambiado_por   VARCHAR(40),
  FOREIGN KEY (registro_id) REFERENCES registros(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Equivalente a la pestaña "Citas".
CREATE VIEW v_citas_pendientes AS
SELECT r.id, r.cita_en, r.nombre, r.telefono, s.nombre AS sede, p.nombre AS plan, r.tipo_cita, r.estatus,
       CASE
         WHEN DATE(r.cita_en) < CURDATE() AND r.estatus = 'Cita solicitada' THEN 'Vencida sin confirmar'
         WHEN DATE(r.cita_en) < CURDATE() THEN 'Vencida sin resultado'
         WHEN r.estatus = 'Cita solicitada' THEN 'Por confirmar'
         WHEN DATE(r.cita_en) = CURDATE() THEN 'Hoy'
         ELSE 'Próxima'
       END AS situacion
FROM registros r
LEFT JOIN sedes s ON s.id = r.sede_id
LEFT JOIN planes p ON p.id = r.plan_id
WHERE r.estatus IN ('Cita solicitada','Cita confirmada')
ORDER BY r.cita_en;

-- Equivalente al "Resumen por mes" del Panel.
CREATE VIEW v_resumen_mensual AS
SELECT DATE_FORMAT(creado_en, '%Y-%m') AS mes,
       COUNT(*)                                        AS registros,
       SUM(cita_en IS NOT NULL)                        AS con_cita,
       SUM(estatus = 'Inscrito')                       AS inscritos,
       SUM(estatus IN ('No concretado','No asistió'))  AS no_concretados,
       ROUND(SUM(estatus = 'Inscrito') / COUNT(*), 3)  AS conversion,
       COALESCE(SUM(monto_pagado_mxn), 0)              AS ingresos_mxn
FROM registros
GROUP BY mes
ORDER BY mes;

INSERT INTO sedes (nombre, estado, guardian) VALUES
  ('Tezontepec', 'Activa', 'El Guardián Nocturno'),
  ('Mixquiahuala', 'Activa', 'El Jaguar (provisional)'),
  ('Progreso', 'Activa', 'El Fénix (provisional)'),
  ('Tlahuelilpan', 'Próximamente', 'Por revelar');

INSERT INTO planes (nombre) VALUES
  ('Visita del día'), ('Semana'), ('Quincena'), ('Mensualidad'), ('Trimestre'), ('Semestre'), ('Anualidad'),
  ('Estudiante (mensual)'), ('Pareja (mensual)'), ('Adulto mayor (mensual)'), ('Entrenamiento personalizado'),
  ('Lista de espera');

/**
 * data.js — Capa de datos AISLADA del resto de la app.
 *
 * IMPORTANTE (ver PRODUCT.md): el catálogo original (casarivas.com/load_productos_catalog)
 * NO tiene ninguna API pública JSON. Todo se renderiza en servidor con estado de
 * sesión vía formularios POST (patrón Flask + csrf_token firmado con itsdangerous).
 * No hay forma de conectar esta demo a datos reales sin cooperación del sitio
 * (endpoint expuesto) o un backend propio, fuera del alcance de este proyecto
 * (solo frontend vanilla).
 *
 * Esta capa expone la MISMA forma de datos que el catálogo real (PID, SG,
 * Código, Descripción — ver DESIGN.md) pero con contenido de demostración
 * ilustrativo, NO inventario real. Los 43 códigos de subgrupo sí son reales
 * (observados en el <select> del sitio en vivo); sus nombres largos y los
 * productos de ejemplo son ilustrativos.
 *
 * El día que exista una API real, este es el ÚNICO archivo que habría que
 * reemplazar: getProducts() es el único punto de entrada que el resto de la
 * app usa para leer el catálogo.
 */

// Códigos de subgrupo reales, tal como aparecen en el <select> del sitio original.
// Nombres largos = ilustrativos (el sitio original solo muestra la abreviatura).
const SUBGROUPS = [
  { code: "AGU", name: "Agujas / Puntas" },
  { code: "AMP", name: "Amplificadores" },
  { code: "ANT", name: "Antenas" },
  { code: "ARD", name: "Arduino y Microcontroladores" },
  { code: "AT", name: "Alta Tensión" },
  { code: "AUD", name: "Audio" },
  { code: "BAT", name: "Baterías" },
  { code: "CAB", name: "Cables" },
  { code: "CAP", name: "Capacitores" },
  { code: "COB", name: "Cobre / Cableado" },
  { code: "COM", name: "Componentes Varios" },
  { code: "CON", name: "Conectores" },
  { code: "EMP", name: "Empaques" },
  { code: "FLY", name: "Flyback" },
  { code: "FOC", name: "Focos / Iluminación" },
  { code: "FUS", name: "Fusibles" },
  { code: "GRA", name: "Grasas / Lubricantes" },
  { code: "HER", name: "Herramientas" },
  { code: "IC", name: "Circuitos Integrados" },
  { code: "INS", name: "Insumos" },
  { code: "JK", name: "Jacks / Plugs" },
  { code: "MIC", name: "Micrófonos" },
  { code: "MIS", name: "Misceláneo" },
  { code: "MOT", name: "Motores y Ventiladores" },
  { code: "NTE", name: "Sustitutos NTE" },
  { code: "PL", name: "Plástico" },
  { code: "PLA", name: "Placas" },
  { code: "PM", name: "Potenciómetros Mecánicos" },
  { code: "POL", name: "Poleas / Bandas" },
  { code: "POT", name: "Potenciómetros" },
  { code: "RE", name: "Repuestos Eléctricos" },
  { code: "REG", name: "Reguladores" },
  { code: "REL", name: "Relés" },
  { code: "SEM", name: "Semiconductores" },
  { code: "SEP", name: "Separadores" },
  { code: "SOL", name: "Soldadura" },
  { code: "SPK", name: "Bocinas / Parlantes" },
  { code: "SW", name: "Interruptores" },
  { code: "TER", name: "Terminales" },
  { code: "TES", name: "Testers / Multímetros" },
  { code: "TF", name: "Transformadores de Ferrita" },
  { code: "TR", name: "Transformadores" },
  { code: "TUB", name: "Tubos" },
];

// Ícono SVG genérico por subgrupo (línea, mismo trazo en todos — ver DESIGN.md).
// Se usa como placeholder visual: NO son fotos reales de producto.
const ICONS = {
  REL: `<path d="M6 12h4M14 12h4M10 8v8M14 8v8M10 8h4M10 16h4"/><rect x="4" y="4" width="16" height="16" rx="2"/>`,
  MOT: `<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>`,
  FUS: `<rect x="3" y="9" width="18" height="6" rx="3"/><path d="M3 12h18" stroke-dasharray="1.5 2.5"/>`,
  CAP: `<path d="M8 4v16M16 4v16M3 9h5M16 9h5M3 15h5M16 15h5"/>`,
  CON: `<path d="M4 9v6h4l2-3-2-3H4zM20 9v6h-4l-2-3 2-3h4z"/>`,
  BAT: `<rect x="3" y="7" width="15" height="10" rx="1.5"/><path d="M18 10v4M21 10.5v3"/>`,
  FOC: `<circle cx="12" cy="10" r="6"/><path d="M9.5 20h5M10 22h4M10 15.5l4-4M14 15.5l-4-4"/>`,
  HER: `<path d="M14.5 3.5a3 3 0 0 1 4.24 4.24L9 17.5 4 20l2.5-5L16.26 5.24"/>`,
  IC: `<rect x="7" y="7" width="10" height="10" rx="1"/><path d="M9 3v4M12 3v4M15 3v4M9 17v4M12 17v4M15 17v4M3 9h4M3 12h4M3 15h4M17 9h4M17 12h4M17 15h4"/>`,
  CAB: `<path d="M4 7c4 0 4 10 8 10s4-10 8-10"/>`,
  SW: `<rect x="7" y="3" width="10" height="18" rx="5"/><circle cx="12" cy="8" r="2.4"/>`,
  AUD: `<path d="M4 10v4h3l5 4V6L7 10H4z"/><path d="M16 8a5 5 0 0 1 0 8M18.5 5.5a9 9 0 0 1 0 13"/>`,
  ANT: `<path d="M12 21V9M7 6l5-4 5 4M5 9l7-3 7 3"/>`,
  AMP: `<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/>`,
  SPK: `<path d="M4 9v6h3l5 4V5L7 9H4z"/><path d="M15.5 9.5a4 4 0 0 1 0 5"/>`,
  TR: `<circle cx="8" cy="12" r="4"/><circle cx="16" cy="12" r="4"/>`,
  TUB: `<rect x="4" y="8" width="16" height="8" rx="4"/>`,
  SOL: `<path d="M6 3l12 12M9 14l-4 4 1 3 3 1 4-4M15 4l3 1 1 3"/>`,
  POT: `<circle cx="12" cy="12" r="7"/><path d="M12 12l4-3"/>`,
  SEM: `<path d="M6 4v16M6 12h9l-3-3M15 9l3 3-3 3"/>`,
  TER: `<path d="M4 12h6M14 12h6M10 8v8M14 8v8"/>`,
  JK: `<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>`,
  MIC: `<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6"/>`,
  ARD: `<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 9v6M11 9v6M15 10.5a1.5 1.5 0 1 1 0 3M18 9v6"/>`,
  TES: `<rect x="6" y="3" width="12" height="14" rx="2"/><path d="M9 9h6M9 12h6M12 17v4"/>`,
  DEFAULT: `<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8v8H8z"/>`,
};

function iconFor(sg) {
  return ICONS[sg] || ICONS.DEFAULT;
}

// Catálogo de demostración. Los dos primeros productos replican exactamente
// los observados en vivo en el sitio original (misma Desc/PID/SG/Cod); el
// resto es contenido ilustrativo para poder demostrar búsqueda, filtros,
// orden y paginación con un volumen realista.
const PRODUCTS = [
  { pid: 16743, desc: 'SOCKET BASE 5Pines CON CABLES PARA RELAY DE 5Pin 40ARB EA-25', sg: 'REL', cod: '13-PRO1005NA', web: true },
  { pid: 14800, desc: 'VENT 120Vac 4.7" x 1.5" METALICO 120mm x 120mm x 38mm VN-583', sg: 'MOT', cod: '14-020-110V', web: true },
  { pid: 20101, desc: 'RELAY 12VDC 5 PINES 40A BOBINA AZUL USO AUTOMOTRIZ', sg: 'REL', cod: '13-PRO1006NA', web: true },
  { pid: 20102, desc: 'RELAY 24VDC 4 PINES 30A CONTACTO SENCILLO', sg: 'REL', cod: '13-PRO1007NA', web: false },
  { pid: 20103, desc: 'BASE PORTA RELAY 5 PINES CON SOPORTE METALICO', sg: 'REL', cod: '13-PRO1008NA', web: true },
  { pid: 20201, desc: 'VENT 12Vdc 3" x 3" x 1" PLASTICO BALERO SLEEVE', sg: 'MOT', cod: '14-021-012V', web: true },
  { pid: 20202, desc: 'VENT 220Vac 4" x 4" x 1.5" METALICO BAJO RUIDO', sg: 'MOT', cod: '14-022-220V', web: true },
  { pid: 20203, desc: 'MOTOR PASO A PASO NEMA 17 BIPOLAR 1.8 GRADOS', sg: 'MOT', cod: '14-030-NEMA17', web: true },
  { pid: 20301, desc: 'FUSIBLE VIDRIO 5x20mm 1A 250V RAPIDO', sg: 'FUS', cod: '15-FUS-1A', web: true },
  { pid: 20302, desc: 'FUSIBLE VIDRIO 5x20mm 5A 250V RAPIDO', sg: 'FUS', cod: '15-FUS-5A', web: true },
  { pid: 20303, desc: 'FUSIBLE CERAMICO 6x30mm 10A 250V LENTO', sg: 'FUS', cod: '15-FUS-10AL', web: true },
  { pid: 20304, desc: 'PORTA FUSIBLE EN LINEA PARA CABLE CALIBRE 18', sg: 'FUS', cod: '15-FUS-PORT', web: false },
  { pid: 20401, desc: 'CAPACITOR ELECTROLITICO 1000uF 25V RADIAL', sg: 'CAP', cod: '16-CAP-1000-25', web: true },
  { pid: 20402, desc: 'CAPACITOR CERAMICO 104 50V (0.1uF)', sg: 'CAP', cod: '16-CAP-104', web: true },
  { pid: 20403, desc: 'CAPACITOR ELECTROLITICO 470uF 35V RADIAL', sg: 'CAP', cod: '16-CAP-470-35', web: true },
  { pid: 20404, desc: 'CAPACITOR DE ARRANQUE MOTOR 35uF 250VAC', sg: 'CAP', cod: '16-CAP-ARR35', web: true },
  { pid: 20501, desc: 'CONECTOR JST XH 2.54mm 2 PINES MACHO-HEMBRA', sg: 'CON', cod: '17-CON-JST2', web: true },
  { pid: 20502, desc: 'CONECTOR MOLEX 4 PINES PARA FUENTE DE PODER', sg: 'CON', cod: '17-CON-MLX4', web: true },
  { pid: 20503, desc: 'TERMINAL FASTON HEMBRA 6.3mm AISLADO', sg: 'CON', cod: '17-CON-FAST63', web: false },
  { pid: 20601, desc: 'BATERIA RECARGABLE 12V 7Ah SELLADA UPS', sg: 'BAT', cod: '18-BAT-12V7A', web: true },
  { pid: 20602, desc: 'BATERIA LITIO 18650 3.7V 2600mAh RECARGABLE', sg: 'BAT', cod: '18-BAT-18650', web: true },
  { pid: 20603, desc: 'BATERIA ALCALINA AA BLISTER 4 UNIDADES', sg: 'BAT', cod: '18-BAT-AA4', web: true },
  { pid: 20701, desc: 'FOCO LED E27 9W LUZ BLANCA 6500K', sg: 'FOC', cod: '19-FOC-LED9W', web: true },
  { pid: 20702, desc: 'TIRA LED 5050 RGB 5M CON CONTROL REMOTO', sg: 'FOC', cod: '19-FOC-RGB5M', web: true },
  { pid: 20703, desc: 'FOCO AHORRADOR ESPIRAL 20W ROSCA E27', sg: 'FOC', cod: '19-FOC-AH20W', web: false },
  { pid: 20801, desc: 'CAUTIN 40W PUNTA FINA CON SOPORTE INCLUIDO', sg: 'HER', cod: '20-HER-CAU40', web: true },
  { pid: 20802, desc: 'PINZA PELACABLE AUTOMATICA 10-24 AWG', sg: 'HER', cod: '20-HER-PINZ', web: true },
  { pid: 20803, desc: 'MULTIMETRO DIGITAL AUTORANGO CON BUZZER', sg: 'TES', cod: '20-TES-MULTI', web: true },
  { pid: 20901, desc: 'CIRCUITO INTEGRADO LM7805 REGULADOR 5V TO-220', sg: 'IC', cod: '21-IC-7805', web: true },
  { pid: 20902, desc: 'CIRCUITO INTEGRADO NE555 TEMPORIZADOR DIP-8', sg: 'IC', cod: '21-IC-555', web: true },
  { pid: 20903, desc: 'CIRCUITO INTEGRADO ARDUINO NANO ATMEGA328', sg: 'ARD', cod: '21-ARD-NANO', web: true },
  { pid: 21001, desc: 'CABLE THHN CALIBRE 12 AWG NEGRO 1 METRO', sg: 'CAB', cod: '22-CAB-THHN12', web: true },
  { pid: 21002, desc: 'CABLE UTP CAT6 GRIS 1 METRO PARA RED', sg: 'CAB', cod: '22-CAB-UTP6', web: true },
  { pid: 21003, desc: 'CABLE COAXIAL RG6 PARA ANTENA 1 METRO', sg: 'CAB', cod: '22-CAB-RG6', web: false },
  { pid: 21101, desc: 'INTERRUPTOR DE PALANCA 3 POSICIONES ON-OFF-ON', sg: 'SW', cod: '23-SW-3POS', web: true },
  { pid: 21102, desc: 'MICROSWITCH PALANCA CORTA 5A 125VAC', sg: 'SW', cod: '23-SW-MICRO', web: true },
  { pid: 21201, desc: 'BOCINA 4 OHM 3W PARA RADIO PORTATIL', sg: 'SPK', cod: '24-SPK-4OHM3W', web: true },
  { pid: 21202, desc: 'BOCINA COAXIAL 6.5 PULGADAS 2 VIAS AUTO', sg: 'SPK', cod: '24-SPK-COAX65', web: true },
  { pid: 21301, desc: 'ANTENA WIFI 2.4GHZ 5DBI CONECTOR RP-SMA', sg: 'ANT', cod: '25-ANT-WIFI24', web: true },
  { pid: 21401, desc: 'AMPLIFICADOR CLASE D 2X50W MODULO PLACA', sg: 'AMP', cod: '26-AMP-D250W', web: true },
  { pid: 21501, desc: 'TRANSFORMADOR 110-220V 5A CENTRAL', sg: 'TR', cod: '27-TR-5A', web: false },
  { pid: 21502, desc: 'TRANSFORMADOR AUDIO SALIDA 3W PARA BOCINA', sg: 'TR', cod: '27-TR-AUD3W', web: true },
  { pid: 21601, desc: 'TUBO TERMOENCOGIBLE 6mm NEGRO 1 METRO', sg: 'TUB', cod: '28-TUB-6MM', web: true },
  { pid: 21701, desc: 'ESTAÑO PARA SOLDAR 60/40 ROLLO 100G 1mm', sg: 'SOL', cod: '29-SOL-EST100G', web: true },
  { pid: 21801, desc: 'POTENCIOMETRO LINEAL 10K CON EJE 15mm', sg: 'POT', cod: '30-POT-10K', web: true },
  { pid: 21901, desc: 'TRANSISTOR NPN 2N3055 POTENCIA TO-3', sg: 'SEM', cod: '31-SEM-2N3055', web: true },
  { pid: 22001, desc: 'TERMINAL DE OJO CALIBRE 14-16 AWG PAQUETE 10', sg: 'TER', cod: '32-TER-OJO1416', web: false },
  { pid: 22101, desc: 'PLUG JACK 3.5mm STEREO METALICO PARA CABLE', sg: 'JK', cod: '33-JK-35MM', web: true },
  { pid: 22201, desc: 'MICROFONO ELECTRET OMNIDIRECCIONAL 6mm', sg: 'MIC', cod: '34-MIC-ELECT6', web: true },
  { pid: 22301, desc: 'ARDUINO UNO R3 ORIGINAL PLACA DE DESARROLLO', sg: 'ARD', cod: '35-ARD-UNO', web: true },
  { pid: 22302, desc: 'MODULO SENSOR ULTRASONICO HC-SR04', sg: 'ARD', cod: '35-ARD-HCSR04', web: true },
  { pid: 22401, desc: 'MULTIMETRO ANALOGICO AGUJA USO GENERAL', sg: 'TES', cod: '36-TES-ANALOG', web: true },
];

/**
 * Punto de entrada ÚNICO que el resto de la app usa para leer el catálogo.
 * Firma pensada para que conectar una API real sea reemplazar solo este
 * cuerpo por un fetch(), sin tocar ui.js/cart.js.
 *
 * @param {object} filters
 * @param {string} filters.q        texto libre (busca en Desc y Cod)
 * @param {string} filters.plu      PID exacto o parcial
 * @param {string} filters.sg       código de subgrupo ('' = todos)
 * @param {string} filters.cod      código de fabricante/interno (parcial)
 * @param {boolean} filters.conImagen  solo productos "con imagen" (demo: todos tienen ícono, así que este flag no filtra nada — se conserva por fidelidad funcional con el original)
 * @param {boolean} filters.soloWeb    solo productos marcados como visibles en la tienda web
 * @param {'plu'|'sg'|'codigo'} filters.orden
 * @param {number} page   1-indexed
 * @param {number} perPage
 * @returns {{items: object[], total: number, totalPages: number, page: number}}
 */
function getProducts({ q = '', plu = '', sg = '', cod = '', conImagen = false, soloWeb = false, orden = 'plu' } = {}, page = 1, perPage = 12) {
  let items = PRODUCTS.slice();

  if (plu.trim()) {
    items = items.filter((p) => String(p.pid).includes(plu.trim()));
  }
  if (sg) {
    items = items.filter((p) => p.sg === sg);
  }
  if (cod.trim()) {
    const needle = cod.trim().toLowerCase();
    items = items.filter((p) => p.cod.toLowerCase().includes(needle));
  }
  if (q.trim()) {
    const needle = q.trim().toLowerCase();
    items = items.filter(
      (p) => p.desc.toLowerCase().includes(needle) || p.cod.toLowerCase().includes(needle) || String(p.pid).includes(needle)
    );
  }
  if (soloWeb) {
    items = items.filter((p) => p.web);
  }
  // conImagen: en el sitio original filtra productos sin foto. En esta demo
  // todos los productos tienen ícono, así que el filtro se conserva en la UI
  // (fidelidad funcional) pero no reduce resultados.

  items.sort((a, b) => {
    if (orden === 'sg') return a.sg.localeCompare(b.sg) || a.pid - b.pid;
    if (orden === 'codigo') return a.cod.localeCompare(b.cod);
    return a.pid - b.pid; // 'plu'
  });

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * perPage;
  const pageItems = items.slice(start, start + perPage);

  return { items: pageItems, total, totalPages, page: safePage };
}

function getSubgroupName(code) {
  const found = SUBGROUPS.find((s) => s.code === code);
  return found ? found.name : code;
}

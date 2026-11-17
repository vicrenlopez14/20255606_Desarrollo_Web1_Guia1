/* =====================================================
   EJERCICIO COMPLEMENTARIO 2
   Consumo de la API "Free-to-Play Games Database" (RapidAPI)
   Endpoints utilizados:
     a. Listado : GET /api/games?platform=&category=&sort-by=
     b. Detalle : GET /api/game?id=
   ===================================================== */

const API_HOST = "free-to-play-games-database.p.rapidapi.com";
const API_URL = `https://${API_HOST}/api`;
const STORAGE_KEY = "guia7_rapidapi_key";
const POR_PAGINA = 24;

// Referencias a elementos del DOM
const formFiltros = document.getElementById("idFiltros");
const cmbPlataforma = document.getElementById("idPlataforma");
const cmbCategoria = document.getElementById("idCategoria");
const cmbOrden = document.getElementById("idOrden");
const txtBuscar = document.getElementById("idBuscar");
const btnCargar = document.getElementById("idBtnCargar");
const btnMas = document.getElementById("idBtnMas");
const estado = document.getElementById("idEstado");
const contador = document.getElementById("idContador");
const listado = document.getElementById("idListado");

const tituloDetalle = document.getElementById("idTituloDetalle");
const cuerpoDetalle = document.getElementById("idCuerpoDetalle");
const linkJugar = document.getElementById("idLinkJugar");
const modalDetalle = new bootstrap.Modal(document.getElementById("idModalDetalle"));

const formKey = document.getElementById("idFormKey");
const txtApiKey = document.getElementById("idApiKey");
const btnBorrarKey = document.getElementById("idBtnBorrarKey");
const modalKey = new bootstrap.Modal(document.getElementById("idModalKey"));

// Estado de la aplicacion
let juegos = [];          // listado completo devuelto por la API
let filtrados = [];       // listado luego de aplicar la busqueda por nombre
let mostrados = 0;        // cuantas tarjetas se han dibujado
let solicitudDetalle = 0; // evita mostrar un detalle viejo si se hace clic rapido

/* ---------- Utilidades ---------- */

const leerKey = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) || "";
  } catch {
    return "";
  }
};

const guardarKey = (key) => {
  try {
    if (key) localStorage.setItem(STORAGE_KEY, key);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* localStorage no disponible: la key solo vive en esta sesion */
  }
};

const limpiarNodo = (nodo) => {
  while (nodo.firstChild) nodo.removeChild(nodo.firstChild);
};

// Crea un elemento con clases y texto opcional
const crear = (etiqueta, clases = "", texto = "") => {
  const el = document.createElement(etiqueta);
  if (clases) el.className = clases;
  if (texto !== "") el.textContent = texto;
  return el;
};

const formatearFecha = (texto) => {
  if (!texto) return "—";
  const fecha = new Date(`${texto}T00:00:00`);
  return isNaN(fecha) ? texto : fecha.toLocaleDateString("es-SV", { year: "numeric", month: "long", day: "numeric" });
};

// Error personalizado con un mensaje amigable para el usuario
class ApiError extends Error {
  constructor(mensaje, status = 0) {
    super(mensaje);
    this.status = status;
  }
}

/* ---------- Peticiones a la API ---------- */

const solicitar = async (ruta, parametros = {}) => {
  const key = leerKey();
  if (!key) {
    throw new ApiError("Necesita configurar su API Key de RapidAPI para consultar la información.", 401);
  }

  const url = new URL(`${API_URL}/${ruta}`);
  Object.entries(parametros).forEach(([clave, valor]) => {
    if (valor !== "" && valor !== null && valor !== undefined) url.searchParams.set(clave, valor);
  });

  let respuesta;
  try {
    respuesta = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": key,
        "x-rapidapi-host": API_HOST,
      },
    });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor. Verifique su conexión a internet.");
  }

  let datos = null;
  try {
    datos = await respuesta.json();
  } catch {
    /* la respuesta no trae JSON */
  }

  if (!respuesta.ok) {
    if (respuesta.status === 401 || respuesta.status === 403) {
      throw new ApiError("La API Key no es válida o no está suscrita al plan gratuito de esta API.", respuesta.status);
    }
    if (respuesta.status === 429) {
      throw new ApiError("Se alcanzó el límite de solicitudes del plan gratuito. Intente más tarde.", 429);
    }
    if (respuesta.status === 404) {
      throw new ApiError((datos && datos.status_message) || "No se encontraron resultados.", 404);
    }
    throw new ApiError(`El servidor respondió con un error (${respuesta.status}).`, respuesta.status);
  }

  return datos;
};

/* ---------- Mensajes de estado ---------- */

const mostrarCargando = (contenedor, texto) => {
  limpiarNodo(contenedor);
  const caja = crear("div", "d-flex align-items-center justify-content-center gap-2 py-5 text-body-secondary");
  const spinner = crear("div", "spinner-border text-primary");
  spinner.setAttribute("role", "status");
  caja.appendChild(spinner);
  caja.appendChild(crear("span", "", texto));
  contenedor.appendChild(caja);
};

const mostrarError = (contenedor, error, reintentar) => {
  limpiarNodo(contenedor);
  const alerta = crear("div", "alert alert-danger d-flex flex-wrap align-items-center gap-2");
  alerta.setAttribute("role", "alert");
  alerta.appendChild(crear("i", "bi bi-exclamation-triangle-fill"));
  alerta.appendChild(crear("span", "me-auto", error.message));

  if (error.status === 401 || error.status === 403) {
    const btnKey = crear("button", "btn btn-sm btn-outline-danger", "Configurar API Key");
    btnKey.type = "button";
    btnKey.addEventListener("click", () => modalKey.show());
    alerta.appendChild(btnKey);
  } else if (reintentar) {
    const btnReintentar = crear("button", "btn btn-sm btn-outline-danger", "Reintentar");
    btnReintentar.type = "button";
    btnReintentar.addEventListener("click", reintentar);
    alerta.appendChild(btnReintentar);
  }
  contenedor.appendChild(alerta);
};

const mostrarInfo = (contenedor, texto) => {
  limpiarNodo(contenedor);
  const alerta = crear("div", "alert alert-info", texto);
  alerta.setAttribute("role", "status");
  contenedor.appendChild(alerta);
};

/* ---------- a. Listado de recursos ---------- */

const crearTarjeta = (juego) => {
  const col = crear("div", "col");
  const card = crear("article", "card h-100 juego-card");
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", `Ver detalle de ${juego.title}`);

  const img = crear("img", "card-img-top");
  img.src = juego.thumbnail;
  img.alt = juego.title;
  img.loading = "lazy";
  card.appendChild(img);

  const body = crear("div", "card-body d-flex flex-column");
  body.appendChild(crear("h2", "card-title h6 fw-bold", juego.title));
  body.appendChild(crear("p", "card-text small text-body-secondary", juego.short_description));

  const etiquetas = crear("div", "mt-auto d-flex flex-wrap gap-1");
  etiquetas.appendChild(crear("span", "badge text-bg-primary", juego.genre));
  etiquetas.appendChild(crear("span", "badge text-bg-secondary", juego.platform));
  body.appendChild(etiquetas);
  card.appendChild(body);

  const abrir = () => cargarDetalle(juego.id, juego.title);
  card.addEventListener("click", abrir);
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      abrir();
    }
  });

  col.appendChild(card);
  return col;
};

const dibujarSiguientes = () => {
  const siguientes = filtrados.slice(mostrados, mostrados + POR_PAGINA);
  siguientes.forEach((juego) => listado.appendChild(crearTarjeta(juego)));
  mostrados += siguientes.length;

  contador.textContent = filtrados.length
    ? `Mostrando ${mostrados} de ${filtrados.length} juegos`
    : "";
  btnMas.classList.toggle("d-none", mostrados >= filtrados.length);
};

const aplicarBusqueda = () => {
  const texto = txtBuscar.value.trim().toLowerCase();
  filtrados = texto ? juegos.filter((j) => j.title.toLowerCase().includes(texto)) : juegos;
  mostrados = 0;
  limpiarNodo(listado);

  if (juegos.length && !filtrados.length) {
    mostrarInfo(estado, `Ningún juego coincide con "${txtBuscar.value.trim()}".`);
  } else {
    limpiarNodo(estado);
  }
  dibujarSiguientes();
};

const cargarListado = async () => {
  btnCargar.disabled = true;
  limpiarNodo(listado);
  contador.textContent = "";
  btnMas.classList.add("d-none");
  mostrarCargando(estado, "Cargando juegos…");

  try {
    const datos = await solicitar("games", {
      platform: cmbPlataforma.value,
      category: cmbCategoria.value,
      "sort-by": cmbOrden.value,
    });

    juegos = Array.isArray(datos) ? datos : [];
    if (!juegos.length) {
      mostrarInfo(estado, "La API no devolvió juegos para los filtros seleccionados.");
      return;
    }
    aplicarBusqueda();
  } catch (error) {
    juegos = [];
    if (error.status === 404) {
      mostrarInfo(estado, "No hay juegos para la combinación de filtros seleccionada.");
    } else {
      mostrarError(estado, error, cargarListado);
    }
  } finally {
    btnCargar.disabled = false;
  }
};

/* ---------- b. Detalle de un recurso ---------- */

const filaDato = (lista, termino, valor) => {
  lista.appendChild(crear("dt", "col-sm-4", termino));
  lista.appendChild(crear("dd", "col-sm-8", valor || "—"));
};

const dibujarDetalle = (juego) => {
  limpiarNodo(cuerpoDetalle);
  tituloDetalle.textContent = juego.title;

  const img = crear("img", "img-fluid rounded mb-3 w-100");
  img.src = juego.thumbnail;
  img.alt = juego.title;
  cuerpoDetalle.appendChild(img);

  const etiquetas = crear("div", "d-flex flex-wrap gap-1 mb-3");
  etiquetas.appendChild(crear("span", "badge text-bg-primary", juego.genre));
  etiquetas.appendChild(crear("span", "badge text-bg-secondary", juego.platform));
  etiquetas.appendChild(crear("span", "badge text-bg-success", juego.status));
  cuerpoDetalle.appendChild(etiquetas);

  const datos = crear("dl", "row small");
  filaDato(datos, "Desarrollador", juego.developer);
  filaDato(datos, "Distribuidor", juego.publisher);
  filaDato(datos, "Lanzamiento", formatearFecha(juego.release_date));
  cuerpoDetalle.appendChild(datos);

  cuerpoDetalle.appendChild(crear("h2", "h6 fw-bold", "Descripción"));
  // La descripcion puede traer etiquetas HTML: se convierte a texto plano con DOMParser
  const descripcion = new DOMParser().parseFromString(juego.description || "", "text/html").body.textContent;
  cuerpoDetalle.appendChild(crear("p", "detalle-descripcion small", descripcion.trim() || juego.short_description));

  const req = juego.minimum_system_requirements;
  if (req) {
    cuerpoDetalle.appendChild(crear("h2", "h6 fw-bold mt-3", "Requisitos mínimos"));
    const lista = crear("dl", "row small");
    filaDato(lista, "Sistema operativo", req.os);
    filaDato(lista, "Procesador", req.processor);
    filaDato(lista, "Memoria", req.memory);
    filaDato(lista, "Gráficos", req.graphics);
    filaDato(lista, "Almacenamiento", req.storage);
    cuerpoDetalle.appendChild(lista);
  }

  if (Array.isArray(juego.screenshots) && juego.screenshots.length) {
    cuerpoDetalle.appendChild(crear("h2", "h6 fw-bold mt-3", "Capturas"));
    const galeria = crear("div", "detalle-capturas");
    juego.screenshots.forEach((captura, i) => {
      const imgCaptura = crear("img");
      imgCaptura.src = captura.image;
      imgCaptura.alt = `${juego.title} — captura ${i + 1}`;
      imgCaptura.loading = "lazy";
      galeria.appendChild(imgCaptura);
    });
    cuerpoDetalle.appendChild(galeria);
  }

  if (juego.game_url) {
    linkJugar.href = juego.game_url;
    linkJugar.classList.remove("d-none");
  }
};

const cargarDetalle = async (id, titulo) => {
  const numero = ++solicitudDetalle;
  tituloDetalle.textContent = titulo;
  linkJugar.classList.add("d-none");
  mostrarCargando(cuerpoDetalle, "Cargando detalle…");
  modalDetalle.show();

  try {
    const juego = await solicitar("game", { id });
    if (numero !== solicitudDetalle) return; // el usuario ya pidio otro juego
    dibujarDetalle(juego);
  } catch (error) {
    if (numero !== solicitudDetalle) return;
    if (error.status === 401 || error.status === 403) modalDetalle.hide();
    mostrarError(cuerpoDetalle, error, () => cargarDetalle(id, titulo));
    if (error.status === 401 || error.status === 403) mostrarError(estado, error);
  }
};

/* ---------- Eventos ---------- */

formFiltros.addEventListener("submit", (e) => {
  e.preventDefault();
  cargarListado();
});

// Al cambiar un filtro de la API se vuelve a consultar el listado
[cmbPlataforma, cmbCategoria, cmbOrden].forEach((cmb) => cmb.addEventListener("change", cargarListado));

// La busqueda por nombre se hace sobre los datos ya descargados
txtBuscar.addEventListener("input", () => {
  if (juegos.length) aplicarBusqueda();
});

btnMas.addEventListener("click", dibujarSiguientes);

document.getElementById("idModalKey").addEventListener("shown.bs.modal", () => {
  txtApiKey.value = leerKey();
  txtApiKey.focus();
});

formKey.addEventListener("submit", (e) => {
  e.preventDefault();
  const key = txtApiKey.value.trim();
  if (!key) {
    txtApiKey.classList.add("is-invalid");
    return;
  }
  txtApiKey.classList.remove("is-invalid");
  guardarKey(key);
  modalKey.hide();
  cargarListado();
});

btnBorrarKey.addEventListener("click", () => {
  guardarKey("");
  txtApiKey.value = "";
  modalKey.hide();
  juegos = [];
  limpiarNodo(listado);
  contador.textContent = "";
  btnMas.classList.add("d-none");
  mostrarError(estado, new ApiError("Se eliminó la API Key guardada.", 401));
});

/* ---------- Inicio ---------- */

if (leerKey()) {
  cargarListado();
} else {
  mostrarError(
    estado,
    new ApiError("Para ver el catálogo configure su API Key de RapidAPI (plan gratuito).", 401)
  );
}

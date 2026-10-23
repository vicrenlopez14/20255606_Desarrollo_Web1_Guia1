const pedidos = [];
let precioMaximo = null;

const formPedido = document.querySelector("#idFormPedido");
const inputProducto = document.querySelector("#idProducto");
const inputPrecio = document.querySelector("#idPrecio");
const inputCantidad = document.querySelector("#idCantidad");
const inputPrecioMaximo = document.querySelector("#idPrecioMaximo");
const btnFiltrar = document.querySelector("#idBtnFiltrar");
const btnMostrarTodos = document.querySelector("#idBtnMostrarTodos");
const btnLimpiar = document.querySelector("#idBtnLimpiar");
const cuerpoTabla = document.querySelector("#idCuerpoTabla");
const totalUnidades = document.querySelector("#idTotalUnidades");
const montoTotal = document.querySelector("#idMontoTotal");

const moneda = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function crearPedido(producto, precio, cantidad) {
  return { producto: producto.trim(), precio: Number(precio), cantidad: Number(cantidad) };
}

function validarPedido(pedido) {
  const errores = {};
  if (pedido.producto === "") {
    errores.producto = "Ingrese el nombre del producto.";
  }
  if (!Number.isFinite(pedido.precio) || pedido.precio <= 0) {
    errores.precio = "El precio debe ser mayor que cero.";
  }
  if (!Number.isInteger(pedido.cantidad) || pedido.cantidad <= 0) {
    errores.cantidad = "La cantidad debe ser un número entero positivo.";
  }
  return errores;
}

function calcularSubtotal(pedido) {
  return pedido.precio * pedido.cantidad;
}

function filtrarPorPrecio(lista, maximo) {
  return maximo === null ? lista : lista.filter(pedido => pedido.precio <= maximo);
}

function calcularTotalUnidades(lista) {
  return lista.reduce((total, pedido) => total + pedido.cantidad, 0);
}

function calcularMontoTotal(lista) {
  return lista.reduce((total, pedido) => total + calcularSubtotal(pedido), 0);
}

function crearCelda(texto, clase) {
  const celda = document.createElement("td");
  celda.textContent = texto;
  if (clase) {
    celda.className = clase;
  }
  return celda;
}

function crearFila(pedido) {
  const fila = document.createElement("tr");
  fila.append(
    crearCelda(pedido.producto),
    crearCelda(moneda.format(pedido.precio), "text-end"),
    crearCelda(pedido.cantidad, "text-end"),
    crearCelda(moneda.format(calcularSubtotal(pedido)), "text-end")
  );
  return fila;
}

function crearFilaVacia() {
  const fila = document.createElement("tr");
  const celda = crearCelda(
    pedidos.length === 0 ? "No hay pedidos registrados." : "Ningún pedido cumple el filtro.",
    "text-center text-muted"
  );
  celda.colSpan = 4;
  fila.append(celda);
  return fila;
}

function renderizarTabla(lista) {
  const filas = lista.length > 0 ? lista.map(crearFila) : [crearFilaVacia()];
  cuerpoTabla.replaceChildren(...filas);
}

function renderizarTotales(lista) {
  totalUnidades.textContent = calcularTotalUnidades(lista);
  montoTotal.textContent = moneda.format(calcularMontoTotal(lista));
}

function actualizarVista() {
  const visibles = filtrarPorPrecio(pedidos, precioMaximo);
  renderizarTabla(visibles);
  renderizarTotales(visibles);
}

function marcarCampo(input, mensaje) {
  input.classList.toggle("is-invalid", Boolean(mensaje));
  input.nextElementSibling.textContent = mensaje || "";
}

function mostrarErrores(errores) {
  marcarCampo(inputProducto, errores.producto);
  marcarCampo(inputPrecio, errores.precio);
  marcarCampo(inputCantidad, errores.cantidad);
}

function quitarFiltro() {
  precioMaximo = null;
  inputPrecioMaximo.value = "";
  marcarCampo(inputPrecioMaximo, "");
}

function agregarPedido(evento) {
  evento.preventDefault();
  const pedido = crearPedido(inputProducto.value, inputPrecio.value, inputCantidad.value);
  const errores = validarPedido(pedido);
  mostrarErrores(errores);
  if (Object.keys(errores).length > 0) {
    return;
  }
  pedidos.push(pedido);
  formPedido.reset();
  inputProducto.focus();
  quitarFiltro();
  actualizarVista();
}

function filtrarProductos() {
  const valor = inputPrecioMaximo.value.trim();
  const maximo = Number(valor);
  if (valor === "" || !Number.isFinite(maximo) || maximo < 0) {
    marcarCampo(inputPrecioMaximo, "Ingrese un precio máximo válido.");
    return;
  }
  marcarCampo(inputPrecioMaximo, "");
  precioMaximo = maximo;
  actualizarVista();
}

function mostrarTodos() {
  quitarFiltro();
  actualizarVista();
}

function limpiarPedidos() {
  pedidos.length = 0;
  quitarFiltro();
  actualizarVista();
}

formPedido.addEventListener("submit", agregarPedido);
btnFiltrar.addEventListener("click", filtrarProductos);
btnMostrarTodos.addEventListener("click", mostrarTodos);
btnLimpiar.addEventListener("click", limpiarPedidos);

actualizarVista();

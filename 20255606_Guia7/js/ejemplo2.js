// Obteniendo la referencia de los elementos
// por medio de arreglos asociativos
// aqui se esta utilizando el atributo name de cada elemento
const formulario = document.forms["frmRegistro"];
const button = document.forms["frmRegistro"].elements["btnRegistro"];
const buttonRecorrer = document.forms["frmRegistro"].elements["btnRecorrer"];

// CREANDO MODAL CON BOOTSTRAP
const modal = new bootstrap.Modal(document.getElementById("idModal"), {});

// OBTENIENDO LA REFERENCIA DEL CUERPO DEL MODAL
// PARA IMPRIMIR EL RESULTADO
const bodyModal = document.getElementById("idBodyModal");
const tituloModal = document.getElementById("modalLabel");

// Recorrer el formulario
const recorrerFormulario = function () {
  let totText = 0;
  let totRadio = 0;
  let totCheck = 0;
  let totDate = 0;
  let totSelect = 0;
  let totFile = 0;
  let totPass = 0;
  let totEmail = 0;

  // Recorriendo elementos del formulario
  let elementos = formulario.elements;
  let totalElementos = elementos.length;

  for (let index = 0; index < totalElementos; index++) {
    // Accediendo a cada hijo del formulario
    let elemento = elementos[index];

    // verificando el tipo de control en el formulario
    let tipoElemento = elemento.type;
    // verificando el tipo de nodo
    let tipoNode = elemento.nodeName;

    // Contabilizando el total de INPUT TYPE = TEXT
    if (tipoElemento == "text" && tipoNode == "INPUT") {
      console.log(elemento);
      totText++;
    }
    // Contabilizando el total de INPUT TYPE = PASSWORD
    else if (tipoElemento == "password" && tipoNode == "INPUT") {
      console.log(elemento);
      totPass++;
    }
    // Contabilizando el total de INPUT TYPE = EMAIL
    else if (tipoElemento == "email" && tipoNode == "INPUT") {
      console.log(elemento);
      totEmail++;
    }
    // Contabilizando el total de INPUT TYPE = RADIO
    else if (tipoElemento == "radio" && tipoNode == "INPUT") {
      console.log(elemento);
      totRadio++;
    }
    // Contabilizando el total de INPUT TYPE = CHECKBOX
    else if (tipoElemento == "checkbox" && tipoNode == "INPUT") {
      console.log(elemento);
      totCheck++;
    }
    // Contabilizando el total de INPUT TYPE = FILE
    else if (tipoElemento == "file" && tipoNode == "INPUT") {
      console.log(elemento);
      totFile++;
    }
    // Contabilizando el total de INPUT TYPE = DATE
    else if (tipoElemento == "date" && tipoNode == "INPUT") {
      console.log(elemento);
      totDate++;
    }
    // Contabilizando el total de SELECT
    else if (tipoNode == "SELECT") {
      console.log(elemento);
      totSelect++;
    }
  }

  let resultado = `
    Total de input[type="text"] = ${totText}<br>
    Total de input[type="password"] = ${totPass}<br>
    Total de input[type="radio"] = ${totRadio}<br>
    Total de input[type="checkbox"] = ${totCheck}<br>
    Total de input[type="date"] = ${totDate}<br>
    Total de input[type="email"] = ${totEmail}<br>
    Total de input[type="file"] = ${totFile}<br>
    Total de select = ${totSelect}<br>
  `;

  tituloModal.textContent = "Elementos del formulario";
  bodyModal.innerHTML = resultado;
  //Funcion que permite mostrar el modal de Bootstrap
  //Esta funcion es definida por Bootstrap
  modal.show();
};

/* =====================================================
   EJERCICIO COMPLEMENTARIO 1
   Validacion del formulario y tabla creada con DOM
   (sin innerHTML: solo createElement, createTextNode,
   appendChild, setAttribute, removeChild, etc.)
   ===================================================== */

// Referencias a los controles
const txtNombre = document.getElementById("idNombre");
const txtApellidos = document.getElementById("idApellidos");
const txtFechaNac = document.getElementById("idFechaNac");
const txtCorreo = document.getElementById("idCorreo");
const txtPassword = document.getElementById("idPassword");
const txtPasswordRepetir = document.getElementById("idPasswordRepetir");
const cmbPais = document.getElementById("idCmPais");
const fileAvatar = document.getElementById("idArchivo");
const intereses = document.querySelectorAll("#idIntereses input[type='checkbox']");
const carreras = document.querySelectorAll("input[name='idRdCarrera']");
const contenedorErrores = document.getElementById("idErrores");

// Expresion regular para validar el correo electronico
const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Devuelve la fecha actual en formato yyyy-mm-dd (hora local)
const fechaActual = function () {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${hoy.getFullYear()}-${mes}-${dia}`;
};

// La fecha de nacimiento no puede superar el dia de hoy
txtFechaNac.setAttribute("max", fechaActual());

// Obtiene el texto del label asociado a un control
const textoLabel = function (control) {
  const label = document.querySelector(`label[for='${control.id}']`);
  return label ? label.textContent.trim() : control.id;
};

// Elimina todos los hijos de un nodo
const limpiarNodo = function (nodo) {
  while (nodo.firstChild) {
    nodo.removeChild(nodo.firstChild);
  }
};

// Marca/desmarca un control como invalido usando clases de Bootstrap
const marcarControl = function (control, invalido) {
  if (invalido) {
    control.classList.add("is-invalid");
    control.classList.remove("is-valid");
  } else {
    control.classList.remove("is-invalid");
    control.classList.add("is-valid");
  }
};

// Muestra la lista de errores en una alerta creada con DOM
const mostrarErrores = function (errores) {
  limpiarNodo(contenedorErrores);
  if (errores.length == 0) return;

  const alerta = document.createElement("div");
  alerta.setAttribute("class", "alert alert-danger");
  alerta.setAttribute("role", "alert");

  const titulo = document.createElement("h5");
  titulo.setAttribute("class", "alert-heading");
  titulo.appendChild(document.createTextNode("Revise la información del formulario"));
  alerta.appendChild(titulo);

  const lista = document.createElement("ul");
  lista.setAttribute("class", "mb-0");
  for (const error of errores) {
    const item = document.createElement("li");
    item.appendChild(document.createTextNode(error));
    lista.appendChild(item);
  }
  alerta.appendChild(lista);

  contenedorErrores.appendChild(alerta);
  contenedorErrores.scrollIntoView({ behavior: "smooth", block: "center" });
};

// Valida el formulario y devuelve el arreglo de errores encontrados
const validarFormulario = function () {
  const errores = [];

  // a. Campos vacios
  const camposTexto = [txtNombre, txtApellidos, txtFechaNac, txtCorreo, txtPassword, txtPasswordRepetir];
  for (const campo of camposTexto) {
    const vacio = campo.value.trim() == "";
    marcarControl(campo, vacio);
    if (vacio) errores.push(`El campo "${textoLabel(campo)}" no puede estar vacío.`);
  }

  // b. Fecha de nacimiento no mayor a la fecha actual
  if (txtFechaNac.value != "" && txtFechaNac.value > fechaActual()) {
    marcarControl(txtFechaNac, true);
    errores.push("La fecha de nacimiento no puede ser mayor a la fecha actual.");
  }

  // c. Correo electronico con expresion regular
  if (txtCorreo.value.trim() != "" && !regexCorreo.test(txtCorreo.value.trim())) {
    marcarControl(txtCorreo, true);
    errores.push("El correo electrónico no tiene un formato válido (ej. usuario@dominio.com).");
  }

  // d. Contraseñas iguales
  if (txtPassword.value != "" && txtPasswordRepetir.value != "" && txtPassword.value != txtPasswordRepetir.value) {
    marcarControl(txtPassword, true);
    marcarControl(txtPasswordRepetir, true);
    errores.push("Las contraseñas no coinciden.");
  }

  // e. Al menos un interes seleccionado
  const interesSeleccionado = Array.from(intereses).some((ck) => ck.checked);
  intereses.forEach((ck) => marcarControl(ck, !interesSeleccionado));
  if (!interesSeleccionado) errores.push("Seleccione al menos un interés.");

  // f. Carrera seleccionada
  const carreraSeleccionada = Array.from(carreras).some((rd) => rd.checked);
  carreras.forEach((rd) => marcarControl(rd, !carreraSeleccionada));
  if (!carreraSeleccionada) errores.push("Seleccione la carrera que estudia.");

  // g. Pais de origen seleccionado
  const paisInvalido = cmbPais.value == "";
  marcarControl(cmbPais, paisInvalido);
  if (paisInvalido) errores.push("Seleccione un país de origen.");

  return errores;
};

// Crea una fila <tr><th>campo</th><td>valor</td></tr>
const crearFila = function (campo, valor) {
  const fila = document.createElement("tr");
  const th = document.createElement("th");
  th.setAttribute("scope", "row");
  th.appendChild(document.createTextNode(campo));
  const td = document.createElement("td");
  td.appendChild(document.createTextNode(valor));
  fila.appendChild(th);
  fila.appendChild(td);
  return fila;
};

// Construye la tabla con la informacion capturada y la muestra en el modal
const mostrarTablaRegistro = function () {
  const interesesSel = Array.from(intereses)
    .filter((ck) => ck.checked)
    .map((ck) => textoLabel(ck));
  const carreraSel = Array.from(carreras).find((rd) => rd.checked);
  const fecha = txtFechaNac.value.split("-").reverse().join("/");

  const datos = [
    ["Nombres", txtNombre.value.trim()],
    ["Apellidos", txtApellidos.value.trim()],
    ["Fecha de nacimiento", fecha],
    ["Correo electrónico", txtCorreo.value.trim()],
    ["Contraseña", "•".repeat(txtPassword.value.length)],
    ["Intereses", interesesSel.join(", ")],
    ["Carrera", textoLabel(carreraSel)],
    ["País de origen", cmbPais.options[cmbPais.selectedIndex].text],
    ["Avatar", fileAvatar.files.length > 0 ? fileAvatar.files[0].name : "Sin archivo"],
  ];

  // Creando la tabla con DOM
  const tabla = document.createElement("table");
  tabla.setAttribute("class", "table table-striped table-bordered align-middle mb-0");

  const thead = document.createElement("thead");
  thead.setAttribute("class", "table-dark");
  const filaEncabezado = document.createElement("tr");
  for (const encabezado of ["Campo", "Valor"]) {
    const th = document.createElement("th");
    th.setAttribute("scope", "col");
    th.appendChild(document.createTextNode(encabezado));
    filaEncabezado.appendChild(th);
  }
  thead.appendChild(filaEncabezado);
  tabla.appendChild(thead);

  const tbody = document.createElement("tbody");
  for (const [campo, valor] of datos) {
    tbody.appendChild(crearFila(campo, valor));
  }
  tabla.appendChild(tbody);

  // Limpiando el modal y agregando la tabla
  limpiarNodo(bodyModal);
  const contenedorTabla = document.createElement("div");
  contenedorTabla.setAttribute("class", "table-responsive");
  contenedorTabla.appendChild(tabla);
  bodyModal.appendChild(contenedorTabla);

  tituloModal.textContent = "Registro enviado correctamente";
  modal.show();
};

// Quita el estado de error cuando el usuario corrige un campo
formulario.addEventListener("input", (event) => {
  const control = event.target;
  if (control.classList.contains("is-invalid")) {
    control.classList.remove("is-invalid");
  }
  if (control.type == "checkbox" || control.type == "radio") {
    const grupo = control.type == "checkbox" ? intereses : carreras;
    grupo.forEach((item) => item.classList.remove("is-invalid"));
  }
});

// agregando eventos a los botones
button.onclick = () => {
  const errores = validarFormulario();
  mostrarErrores(errores);
  if (errores.length == 0) {
    mostrarTablaRegistro();
  }
};

buttonRecorrer.onclick = () => {
  recorrerFormulario();
};

//Accediendo a los elementos html
const inputNombre = document.getElementById("idTxtNombre");
const inputApellido = document.getElementById("idTxtApellido");
const inputFechaNacimiento = document.getElementById("idTxtFechaNacimiento");
const inputRdMasculino = document.getElementById("idRdMasculino");
const inputRdFemenino = document.getElementById("idRdFemenino");
const cmbPais = document.getElementById("idCmbPais");
const inputDireccion = document.getElementById("idTxtDireccion");
const inputNombrePais = document.getElementById("idNombrePais");

const buttonAgregarPaciente = document.getElementById("idBtnAgregar");
const buttonLimpiarPaciente = document.getElementById("idBtnLimpiar");
const buttonMostrarPaciente = document.getElementById("idBtnMostrar");
const buttonAgregarPais = document.getElementById("idBtnAddPais");

const notificacion = document.getElementById("idNotificacion");
// Componente de Bootstrap
const toast = new bootstrap.Toast(notificacion);
const mensaje = document.getElementById("idMensaje");

//Componente modal
const idModal = document.getElementById("idModal");

const claveAlmacenamiento = "arrayPaciente";

//Arreglo global de pacientes
let arrayPaciente = JSON.parse(localStorage.getItem(claveAlmacenamiento)) || [];

let indiceEdicion = null;

const guardarPacientes = () => {
  localStorage.setItem(claveAlmacenamiento, JSON.stringify(arrayPaciente));
};

/*
Creando una funcion para que limpie el formulario
siempre que se cargue la pagina o cuando se presione
el boton limpiar del formulario
*/

const limpiarForm = () => {
  inputNombre.value = "";
  inputApellido.value = "";
  inputFechaNacimiento.value = "";
  inputRdMasculino.checked = false;
  inputRdFemenino.checked = false;
  cmbPais.value = 0;
  inputDireccion.value = "";
  inputNombrePais.value = "";
  indiceEdicion = null;

  inputNombre.focus();
};

/*
Funcion para validar el ingreso del paciente
*/

const addPaciente = function () {
  let nombre = inputNombre.value;
  let apellido = inputApellido.value;
  let fechaNacimiento = inputFechaNacimiento.value;
  let sexo =
    inputRdMasculino.checked == true
      ? "Hombre"
      : inputRdFemenino.checked == true
      ? "Mujer"
      : "";
  let pais = cmbPais.value;
  let labelPais = cmbPais.options[cmbPais.selectedIndex].text;
  let direccion = inputDireccion.value;

  if (
    nombre != "" &&
    apellido != "" &&
    fechaNacimiento != "" &&
    sexo != "" &&
    pais != 0 &&
    direccion != ""
  ) {
    const edicion = indiceEdicion !== null;
    const paciente = new Array(
      nombre,
      apellido,
      fechaNacimiento,
      sexo,
      labelPais,
      direccion
    );

    if (edicion) {
      arrayPaciente[indiceEdicion] = paciente;
      mensaje.innerHTML = "Se ha actualizado el paciente";
    } else {
      //Agregando informacion al arreglo paciente
      arrayPaciente.push(paciente);
      //Asignando un mensaje a nuestra notificacion
      mensaje.innerHTML = "Se ha registrado un nuevo paciente";
    }
    guardarPacientes();
    //Llamando al componente de Bootstrap
    toast.show();

    //Limpiando formulario
    limpiarForm();

    if (edicion) {
      imprimirPacientes();
    }
  } else {
    //Asignando un mensaje a nuestra notificacion
    mensaje.innerHTML = "Faltan campos por completar";
    //Llamando al componente de Bootstrap
    toast.show();
  }
};

//Funcion que imprime la ficha de los pacientes registrados
function imprimirFilas() {
  let $fila = "";
  let contador = 1;

  arrayPaciente.forEach((element) => {
    $fila += `<tr>
                <td scope="row" class="text-center fw-bold">${contador}</td>
                <td>${element[0]}</td>
                <td>${element[1]}</td>
                <td>${element[2]}</td>
                <td>${element[3]}</td>
                <td>${element[4]}</td>
                <td>${element[5]}</td>
                <td>
                    <button id="idBtnEditar${contador}" type="button" class="btn btn-primary" alt="Editar">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button id="idBtnEliminar${contador}" type="button" class="btn btn-danger" alt="Eliminar">
                        <i class="bi bi-trash3-fill"></i>
                    </button>
                </td>
            </tr>`;
    contador++;
  });
  return $fila;
}

const asignarOpciones = () => {
  arrayPaciente.forEach((element, indice) => {
    document.getElementById(`idBtnEditar${indice + 1}`).onclick = () => {
      editarPaciente(indice);
    };
    document.getElementById(`idBtnEliminar${indice + 1}`).onclick = () => {
      eliminarPaciente(indice);
    };
  });
};

const imprimirPacientes = () => {
  let $table = `<div class="table-responsive">
                    <table class="table table-striped table-hover table-bordered">
                        <tr>
                            <th scope="col" class="text-center" style="width:5%">#</th>
                            <th scope="col" class="text-center" style="width:15%">Nombre</th>
                            <th scope="col" class="text-center" style="width:15%">Apellido</th>
                            <th scope="col" class="text-center" style="width:10%">Fecha nacimiento</th>
                            <th scope="col" class="text-center" style="width:10%">Sexo</th>
                            <th scope="col" class="text-center" style="width:10%">Pais</th>
                            <th scope="col" class="text-center" style="width:25%">Dirección</th>
                            <th scope="col" class="text-center" style="width:10%">Opciones</th>
                        </tr>
                        ${imprimirFilas()}
                    </table>
                </div>
            `;
  document.getElementById("idTablaPacientes").innerHTML = $table;
  asignarOpciones();
};

const editarPaciente = (indice) => {
  const paciente = arrayPaciente[indice];
  inputNombre.value = paciente[0];
  inputApellido.value = paciente[1];
  inputFechaNacimiento.value = paciente[2];
  inputRdMasculino.checked = paciente[3] == "Hombre";
  inputRdFemenino.checked = paciente[3] == "Mujer";

  let opcionPais = Array.from(cmbPais.options).find(
    (option) => option.text == paciente[4]
  );
  if (!opcionPais) {
    opcionPais = document.createElement("option");
    opcionPais.textContent = paciente[4];
    opcionPais.value = cmbPais.children.length;
    cmbPais.appendChild(opcionPais);
  }
  cmbPais.value = opcionPais.value;

  inputDireccion.value = paciente[5];
  indiceEdicion = indice;

  window.scrollTo({ top: 0, behavior: "smooth" });
  inputNombre.focus();
};

const eliminarPaciente = (indice) => {
  if (confirm("¿Desea eliminar al paciente seleccionado?")) {
    arrayPaciente.splice(indice, 1);
    guardarPacientes();

    if (indiceEdicion === indice) {
      limpiarForm();
    } else if (indiceEdicion !== null && indiceEdicion > indice) {
      indiceEdicion--;
    }

    if (arrayPaciente.length > 0) {
      imprimirPacientes();
    } else {
      document.getElementById("idTablaPacientes").innerHTML = "Ninguno";
    }

    mensaje.innerHTML = "Se ha eliminado el paciente";
    toast.show();
  }
};

// Contador global de los option correspondiente
// al select (cmb) pais
let contadorGlobalOption = cmbPais.children.length;
const addPais = () => {
  let paisNew = inputNombrePais.value;

  if (paisNew != "") {
    // Creando nuevo option con la API DOM
    let option = document.createElement("option");
    option.textContent = paisNew;
    option.value = contadorGlobalOption + 1;

    //Agregando el nuevo option en el select
    cmbPais.appendChild(option);

    //Asignando un mensaje a nuestra notificacion
    mensaje.innerHTML = "Pais agregado correctamente";
    //Llamando al componente de Bootstrap
    toast.show();
  } else {
    //Asignando un mensaje a nuestra notificacion
    mensaje.innerHTML = "Faltan campos por completar";
    //Llamando al componente de Bootstrap
    toast.show();
  }
};

// Agregando eventos a los botones y utilizando funciones tipo flecha
buttonLimpiarPaciente.onclick = () => {
  limpiarForm();
};

buttonAgregarPaciente.onclick = () => {
  addPaciente();
};

buttonMostrarPaciente.onclick = () => {
  imprimirPacientes();
};

buttonAgregarPais.onclick = () => {
  addPais();
};

// Se agrega el focus en el campo nombre país del modal
idModal.addEventListener("shown.bs.modal", () => {
  inputNombrePais.value = "";
  inputNombrePais.focus();
});

//Ejecutar funcion al momento de cargar la pagina HTML
limpiarForm();

if (arrayPaciente.length > 0) {
  imprimirPacientes();
}

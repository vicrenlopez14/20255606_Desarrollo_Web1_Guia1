const letras = "A-Za-zÁÉÍÓÚÜÑáéíóúüñ";

const campos = [
  {
    id: "idTxtCarnet",
    nombre: "Carnet",
    patron: /^[A-Za-z]{2}[0-9]{3}$/,
    descripcion: "Dos letras seguidas de tres números",
    ejemplo: "AB001",
  },
  {
    id: "idTxtNombreCompleto",
    nombre: "Nombre completo",
    patron: new RegExp(`^[${letras}]+( [${letras}]+)+$`),
    descripcion: "Dos o más palabras formadas solo por letras, separadas por un espacio",
    ejemplo: "Ana María López",
  },
  {
    id: "idTxtDui",
    nombre: "DUI",
    patron: /^[0-9]{8}-[0-9]$/,
    descripcion: "Ocho números, un guion y un número",
    ejemplo: "01234567-8",
  },
  {
    id: "idTxtNit",
    nombre: "NIT",
    patron: /^[0-9]{4}-[0-9]{6}-[0-9]{3}-[0-9]$/,
    descripcion: "Cuatro, seis y tres números, y un número final, separados por guiones",
    ejemplo: "0614-010190-101-3",
  },
  {
    id: "idTxtFechaNacimiento",
    nombre: "Fecha de nacimiento",
    patron: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/[0-9]{4}$/,
    descripcion: "Día (01-31), mes (01-12) y año de cuatro dígitos separados por diagonal",
    ejemplo: "25/12/2000",
  },
  {
    id: "idTxtCorreo",
    nombre: "Correo electrónico",
    patron: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/,
    descripcion: "Usuario, arroba y dominio con una extensión de al menos dos letras",
    ejemplo: "estudiante@correo.com",
  },
  {
    id: "idTxtEdad",
    nombre: "Edad",
    patron: /^[0-9]{1,3}$/,
    descripcion: "Entre uno y tres números",
    ejemplo: "21",
  },
];

const formulario = document.getElementById("idFormValidacion");
const botonValidar = document.getElementById("idBtnValidar");
const botonLimpiar = document.getElementById("idBtnLimpiarValidacion");
const resultado = document.getElementById("idResultadoValidacion");
const cuerpoPatrones = document.getElementById("idCuerpoPatrones");

const validarCampo = (campo) => {
  const elemento = document.getElementById(campo.id);
  const valido = campo.patron.test(elemento.value.trim());
  elemento.classList.toggle("is-valid", valido);
  elemento.classList.toggle("is-invalid", !valido);
  return valido;
};

const validarFormulario = () => {
  const invalidos = campos.filter((campo) => !validarCampo(campo));

  if (invalidos.length == 0) {
    resultado.className = "alert alert-success mt-3";
    resultado.innerHTML = "Todos los datos del estudiante son válidos";
  } else {
    resultado.className = "alert alert-danger mt-3";
    resultado.innerHTML = `Revise los campos: ${invalidos
      .map((campo) => campo.nombre)
      .join(", ")}`;
  }
};

const limpiarFormulario = () => {
  formulario.reset();
  campos.forEach((campo) => {
    document
      .getElementById(campo.id)
      .classList.remove("is-valid", "is-invalid");
  });
  resultado.className = "d-none";
  resultado.innerHTML = "";
  document.getElementById(campos[0].id).focus();
};

const imprimirPatrones = () => {
  let filas = "";
  campos.forEach((campo) => {
    filas += `<tr>
                <th scope="row">${campo.nombre}</th>
                <td><code>${campo.patron.source}</code></td>
                <td>${campo.descripcion}</td>
                <td>${campo.ejemplo}</td>
              </tr>`;
  });
  cuerpoPatrones.innerHTML = filas;
};

campos.forEach((campo) => {
  document.getElementById(campo.id).addEventListener("input", () => {
    validarCampo(campo);
  });
});

botonValidar.onclick = () => {
  validarFormulario();
};

botonLimpiar.onclick = () => {
  limpiarFormulario();
};

imprimirPatrones();

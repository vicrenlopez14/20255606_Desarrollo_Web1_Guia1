const numeroAleatorio = Math.floor(Math.random() * 25) + 1;
const numeroIntentos = 3;
let intentos = 1;

function generarNumeroAleatorio() {
  let mensaje;
  const parrafo = document.querySelector("#idParrafo");

  if (intentos <= numeroIntentos) {
    let numero = prompt(
      "¿Que número se ha generado (Intento " + intentos + ")?"
    );

    if (numero == numeroAleatorio) {
      mensaje = `¡Es sorprente, pudiste adivinar el numero oculto (${numeroAleatorio}).
        Refresque la página para volver a jugar.`;
    } else if (intentos == numeroIntentos) {
      mensaje = `Su numero de intentos ha terminado.
        El numero oculto era: ${numeroAleatorio}. Refresque la página para volver a jugar.`;
    } else {
      const pista = numero < numeroAleatorio ? "más alto" : "más bajo";
      mensaje = `El número que buscas es ${pista} que ${numero}. Vuelve a intentar. Quedan ${
        numeroIntentos - intentos
      } intentos`;
    }

    intentos++;
  } else {
    mensaje = `Su numero de intentos ha terminado.
      El numero oculto era: ${numeroAleatorio}. Refresque la página para volver a jugar.`;
  }

  parrafo.innerHTML = mensaje;
}

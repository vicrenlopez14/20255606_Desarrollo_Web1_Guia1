# Guía de laboratorio Nº 2 — Respuestas

**Víctor René López Huezo** · Carnet 20255606 · Desarrollo Web I · Ciclo 03-2026

---

## Ejercicio 1 — Paso 15: equivalencia de `rem` a píxeles

El elemento `html` tiene `font-size: 20px`, y `1rem` equivale siempre al tamaño de
fuente del elemento raíz. Por lo tanto la conversión es `valor_en_rem × 20`:

| Medida   | Cálculo    | Equivalencia |
|----------|------------|--------------|
| `3.4rem` | 3.4 × 20   | **68 px**    |
| `1.4rem` | 1.4 × 20   | **28 px**    |
| `0.95rem`| 0.95 × 20  | **19 px**    |
| `0.7rem` | 0.7 × 20   | **14 px**    |

La diferencia con `em` es que `rem` siempre toma como referencia el elemento raíz
(`html`) y no el tamaño de fuente del elemento padre, por lo que el valor no se
acumula al anidar elementos.

---

## Ejercicio 1 — Paso 21: selector de atributos

```css
a[href^="http"] {
    padding: 3px 10px;
    border: 1px solid var(--color-borde);
    border-radius: 20px;
}
```

El único enlace de la página cuyo `href` empieza con `http` es
`https://www.imdb.com`; los tres enlaces del menú empiezan con `#`, así que no se
ven afectados. No se agregó ninguna clase ni se modificó el HTML.

Equivalente usando el valor exacto del atributo, como aparece en la Tabla 1:

```css
a[href="https://www.imdb.com"] { ... }
```

---

## Ejercicio 1 — Paso 22: `:first-child` + `:first-letter`

```css
.bloque p:first-child:first-letter {
    color: var(--color-dorado);
    font-family: var(--fuente-titulos);
    font-size: 1.9rem;
}
```

Razonamiento:

- En la Sinopsis, el primer `<p>` es el primer hijo de `.sinopsis-texto`.
- En la Crítica, el primer `<p>` es el primer hijo de `.critica-texto`.
- El párrafo `.mas-info` **no** se ve afectado porque dentro de `#ficha` lo
  preceden el `<h2>` y el `<dl>`, así que no cumple `:first-child`.

---

## Ejercicio 1 — Paso 23: selector de hijos + `:first-child` + `:first-line`

```css
main > .bloque:first-child p:first-child:first-line {
    text-decoration: underline;
    text-decoration-color: var(--color-dorado);
}
```

`main > .bloque:first-child` aísla únicamente el primer bloque de la página
(la sección Sinopsis, que es el primer hijo de `main`). Dentro de ese bloque se
toma el primer párrafo y, de ese párrafo, su primera línea. La Crítica queda
fuera porque su sección no es el primer hijo de `main`.

---

## Ejercicio 2 — Paso 11: completar el patrón del tablero

```css
#tablero > div:nth-child(even) p:nth-child(even) {
    background-color: var(--celda-clara);
}
```

En el paso 10 se aclararon las celdas impares de las filas impares. Para
completar el damero hace falta la combinación contraria: las celdas pares de las
filas pares. Entre ambas reglas cubren exactamente las 32 casillas claras, sin
agregar una sola clase al HTML.

Con fórmulas en lugar de palabras clave, la regla equivalente sería:

```css
#tablero > div:nth-child(2n) p:nth-child(2n) { ... }
```

---

## Archivos de la entrega

| Archivo | Contenido |
|---|---|
| `pelicula.html` | Ejercicio 1 — ficha de la película *Altamar* |
| `css/style.css` | Estilos del Ejercicio 1, incluidos los pasos 21, 22 y 23 |
| `tablero.html` | Ejercicio 2 — tablero de damas |
| `css/estilo_tablero.css` | Estilos del Ejercicio 2, incluido el paso 11 |
| `biografia.html` | Ejercicio complementario 1 — biografía |
| `css/biografia.css` | Estilos de la biografía |
| `img/` | `hero.jpg`, `still.jpg` y `perfil.jpg` |
| `../index.html` | Ejercicio complementario 2 — índice del repositorio |

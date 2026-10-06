# Casa Rivas Electrónica — reporte de CSS Grid

## Propósito y alcance

Conservar la tienda de componentes electrónicos de El Salvador, su composición, contenido y funciones (búsqueda, filtros, orden, paginación, carrito y navegación móvil), no rediseñarla. El trabajo queda exclusivamente en `casa_rivas_2`. El Grid principal nuevo organiza el inicio; los Grid internos y el Flex de componentes ya existentes se conservan. Los estilos productivos se mantienen en [css/styles.css](css/styles.css), enlazado desde HTML, sin estilos inline ni creación de etiquetas de estilo desde el render.

Archivos productivos modificados respecto del snapshot previo:

| Archivo | Cambio |
|---|---|
| [index.html](index.html) | Añade `catalog-page` al `body` y `catalog-main` al `main`, conservando IDs, contenido y scripts. |
| [css/styles.css](css/styles.css) | Añade los dos Grid globales y sus áreas; traslada el escalonado de animación a 100 reglas externas `nth-child`. Conserva los Grid internos y breakpoints. |
| [js/app.js](js/app.js) | `productCardHtml(p)` deja de recibir `index` y de emitir `style="--card-index:…"`. El render, filtros y carrito conservan su lógica. |

## Contenedores, hijos directos y pistas reales

La tabla describe el HTML de inicio y las tarjetas generadas por `app.js`, no todos los descendientes. Salvo los dos Grid globales, **no hay filas explícitas ni áreas nombradas** en estos contenedores: las filas son implícitas, de tamaño `auto`, y los ítems en flujo se colocan por orden DOM (`grid-auto-flow: row`, valor predeterminado). Un hijo absoluto/fijo o con `display:none` no consume una celda normal.

| Contenedor / origen | Hijos DIRECTOS reales | Columnas y filas | Gap, áreas y ubicación |
|---|---|---|---|
| `body.catalog-page` / **nuevo global** | `a.skip-link`, `header.site-header`, `main.catalog-main`, `div.cart-backdrop`, `aside.cart-drawer`, `div.toast`, `footer.site-footer` y cuatro `script` | 1 columna explícita `minmax(0, 1fr)`; 3 filas explícitas `auto auto auto`; no se requieren filas implícitas para los ítems en flujo | `gap:0`; áreas `"header" "main" "footer"`, asignadas mediante selectores de hijo directo. Skip-link, backdrop, drawer y toast son fijos (backdrop/toast además se ocultan inicialmente); scripts no generan cajas. Solo header/main/footer ocupan las tres filas. |
| `main.catalog-main` / **nuevo global** | `section.catalog-hero`, `section.catalog-section#catalogo`, `section.full-bleed.editorial-strip` | 1 columna explícita `minmax(0, 1fr)`; 3 filas explícitas `auto auto auto` | `gap:0`; áreas `"hero" "catalog" "editorial"`; cada sección se asigna a su área. Catálogo: `width:100%`, con el max-width y padding existentes. |
| `.header-inner` / existente | `button.menu-toggle`, `a.brand`, `nav.primary-nav`, `button.header-action` | `auto minmax(170px, 1fr) auto auto`; fila implícita `auto` | `gap:clamp(18px, 3vw, 52px)`; centrado vertical. En escritorio el menú está oculto: marca, nav y carrito se auto-colocan en las primeras tres columnas; la cuarta queda vacía. |
| `.catalog-hero` / existente | `div.catalog-hero-copy`, `div.hero-object`, `a.scroll-cue` | `minmax(300px, .85fr) 1.15fr`; una fila implícita con copy y objeto | `gap:40px`, `align-items:center`; cue absoluto no ocupa celda. `::after` decorativo también es absoluto. |
| `.section-intro` / existente | `div` con eyebrow/título y `p` descriptivo | `minmax(0, 1.1fr) minmax(260px, .55fr)`; una fila implícita | `gap:48px`, alineados al final; párrafo con `justify-self:end`. |
| `.search-form` / existente | `label.sr-only`, `svg.search-icon`, `input#search-input`, `span.search-hint` | `auto 1fr auto`; una fila implícita de tres ítems en flujo | `gap:15px`, centrado vertical; label absoluto accesible no ocupa celda. |
| `.filters-bar` / existente | Cinco `div.filter-group`: categoría (`filter-wide`), PLU/PID, código, ordenar y opciones (`filter-options`) | `1.45fr repeat(3, minmax(130px, 1fr)) 1.15fr`; una fila implícita en escritorio ancho | `gap:clamp(18px, 2vw, 34px)`, alineados al final. Cada `.filter-group` también usa Grid: una columna implícita y dos filas implícitas para label/control; `gap:10px` (opciones: `12px`, checkbox-label y `div.radio-row`). |
| `.product-grid#product-grid` / existente | `article.product-card` creados por JS; sección vacía en el HTML inicial | `repeat(5, minmax(0, 1fr))`; filas implícitas `auto`, tantas como `ceil(N / columnas)` | `column-gap:clamp(18px, 2.3vw, 36px)`; `row-gap:clamp(54px, 7vw, 94px)`; orden del resultado, izquierda a derecha y luego nueva fila. Por defecto N=10: dos filas en escritorio ancho. Sin resultados se oculta. |
| `.product-actions` / existente | `label.sr-only`, `input.qty-input`, `button.btn-primary` | `48px 1fr`; una fila implícita | `gap:8px`; label absoluto no ocupa celda, cantidad en primera columna y Agregar en segunda. |
| `.footer-inner` / existente | `div.footer-brand`, dos `div.footer-links` (Explora y Contacto) | `1fr auto auto`; una fila implícita | `gap:clamp(70px, 12vw, 180px)`; colocación por orden DOM. `.site-footer` tiene como hijos este div y `.footer-bottom`, pero no es contenedor Grid interno. |

Otros Grid internos conservados en inicio: `.menu-lines` (dos `i`, columna implícita, gap 5px), `.hero-object` (dos spans orbitales absolutos y SVG en una celda implícita centrada), `.product-media` (SVG centrado en celda implícita) y, al renderizar carrito, `.cart-line` (icono y cuerpo, `72px 1fr`, gap 18px) y `.cart-line-icon` (SVG centrado). No son el Grid principal del sitio.

### Responsive: reglas acumulativas `max-width`

| Umbral inclusivo | Cambios de Grid del inicio |
|---|---|
| `1180px` | Productos: 4 columnas. Filtros: `repeat(4, 1fr)`; categoría y opciones abarcan 2 columnas. Auto-colocación: categoría/PLU/código en fila 1; orden/opciones en fila 2. |
| `900px` | Header: `1fr auto 1fr`; menú visible, marca centrada, carrito al final. Nav pasa a `position:fixed`, fuera de celdas. Hero: `1fr`; objeto pasa a absoluto. Intro: `1fr`, dos filas, gap 26px y párrafo al inicio. Productos: 3 columnas. Altura de header: 68px. |
| `700px` | Header gap 12px. Búsqueda: `auto 1fr`, hint oculto. Filtros: `1fr 1fr`, categoría y opciones span 2 (cuatro filas: categoría; PLU/código; orden; opciones). Productos: 2 columnas, gap horizontal 15px. Acciones: `42px 1fr`. Footer: `1fr 1fr`, gap vertical 55px / horizontal 30px; marca `grid-column:1 / -1`, enlaces en fila 2. |
| `480px` | Filtros: `1fr`, spans restablecidos a `auto` (5 filas). Productos: `1fr`, gap vertical 58px. Padding lateral de secciones 18px; paginación y footer-bottom se apilan con Flex. |

Los Grid globales mantienen una columna y sus tres filas/áreas en todos los tamaños: no se reordenan contenido ni lectura. Los estilos compartidos de Servicios/Visítanos permanecen existentes; las clases globales nuevas se aplican solo al catálogo.

## Por qué estas propiedades y qué mejora en DX

- `minmax(0, 1fr)` deja que la pista se contraiga sin imponer el mínimo intrínseco del contenido, repartiendo el ancho disponible. `minmax(170px, 1fr)` y `minmax(130px, 1fr)` conservan mínimos específicos de header/filtros antes de activar los breakpoints.
- `fr` reparte el espacio disponible entre pistas flexibles; `.85fr/1.15fr` o `1.1fr/.55fr` expresan proporciones, no porcentajes rígidos del viewport.
- Filas `auto` crecen con el contenido. Las áreas nombradas hacen explícita la ubicación de secciones globales sin cambiar el DOM. `align-items:start` y `align-content:start` evitan estirar verticalmente el layout global y preservan el header sticky.
- `gap` separa pistas sin añadir márgenes a cada tarjeta. Los globales usan cero porque el espaciado visual ya está en padding/márgenes internos; añadir separación global sí cambiaría el diseño.
- DX: clases semánticas y áreas facilitan localizar el layout principal en CSS externo y modificarlo sin tocar render/datos. Es una reorganización técnica, no un rediseño.
- Flex sigue permitido y conservado donde conviene una dimensión: nav, marca, botones, radio/checkbox, tarjeta y cuerpo, paginación, editorial, drawer, enlaces y parte inferior del footer. Usar Flex dentro de ítems Grid no elimina el Grid principal obligatorio.

### Animación externa y tamaño de página

Antes, cada tarjeta recibía `style="--card-index:…"` y CSS calculaba el retraso. Ahora `.product-card:nth-child(1)` hasta `(100)` conservan el escalonado: `(posición - 1) × 55ms`, de 0 a 5445ms, sin CSS generado por JS. El índice se reinicia con cada render/página. El selector de tamaño ofrece 2, 5, 10, 20, 30, 50 y 100; por eso se cubren hasta 100 hijos. El dataset actual tiene 52 productos: las reglas 53–100 no coinciden hoy. No asignan filas ni columnas; únicamente retrasos. Movimiento reducido sigue respetado.

## Trazabilidad: antes, primera generación y final

- [evidencias-grid/antes/](evidencias-grid/antes/) es el snapshot de fuentes **previas** a los cambios productivos, con sumas de verificación; las capturas baseline viven separadas en [capturas/](evidencias-grid/capturas/). No es la primera generación del reto.
- [evidencias-grid/generado-inicial/](evidencias-grid/generado-inicial/) preserva la **primera generación** de la solución Grid. La comparación directa de `index.html`, `css/styles.css` y `js/app.js` contra producción no presenta diferencias.
- El código **final productivo** está en los archivos enlazados al inicio de este reporte, no en los snapshots. Cambios de primera generación a final: **ningún cambio productivo** en esos tres archivos; se añadieron evidencias de verificación y documentación. QA no exigió correcciones productivas.
- Respecto de `antes/`, la generación incorporó las dos clases HTML, los dos Grid globales/áreas y la sustitución del índice inline por `nth-child` externo. No se modifican aquí baseline ni generado-inicial.

## Evidencia visual y verificación real

Método y condiciones: [README baseline](evidencias-grid/README.md), [README posterior](evidencias-grid/verificacion-actual/README.md), [script QA](evidencias-grid/verificar-actual.cjs) y [comparador](evidencias-grid/compare-images.py). Chrome 154.0.8037.98 headless, Playwright 1.56.1, DPR 1, esquema claro, locale `es-SV`, zona `America/El_Salvador`, movimiento reducido, servidor local y mismos datos. Se espera `networkidle`, se desactivan animaciones/transiciones y se fuerzan visibles los elementos `data-reveal`. Son capturas full page; la altura de imagen puede superar la del viewport.

La [salida actual del comparador](evidencias-grid/verificacion-actual/comparacion-visual.txt) registra las **siete comparaciones en 100.0000% de píxeles bajo tolerancia RGB 16 y SSIM global 100.0000%**, todas PASS para el mínimo 85%. La tolerancia es delta máximo por canal ≤16, no una afirmación de igualdad exacta de cada canal. Es un resultado bajo condiciones controladas, no una garantía universal ni una medida absoluta de percepción humana.

| Página / viewport CSS | Antes | Después | Píxeles / SSIM global |
|---|---|---|---|
| Inicio 1440×900 | [PNG](evidencias-grid/capturas/inicio-1440x900-full.png) | [PNG](evidencias-grid/verificacion-actual/capturas/inicio-1440x900-full.png) | 100% / 100% |
| Inicio 900×900 | [PNG](evidencias-grid/capturas/inicio-900x900-full.png) | [PNG](evidencias-grid/verificacion-actual/capturas/inicio-900x900-full.png) | 100% / 100% |
| Inicio 390×844 | [PNG](evidencias-grid/capturas/inicio-390x844-full.png) | [PNG](evidencias-grid/verificacion-actual/capturas/inicio-390x844-full.png) | 100% / 100% |
| Servicios 1440×900 | [PNG](evidencias-grid/capturas/servicios-1440x900-full.png) | [PNG](evidencias-grid/verificacion-actual/capturas/servicios-1440x900-full.png) | 100% / 100% |
| Servicios 390×844 | [PNG](evidencias-grid/capturas/servicios-390x844-full.png) | [PNG](evidencias-grid/verificacion-actual/capturas/servicios-390x844-full.png) | 100% / 100% |
| Visítanos 1440×900 | [PNG](evidencias-grid/capturas/visitanos-1440x900-full.png) | [PNG](evidencias-grid/verificacion-actual/capturas/visitanos-1440x900-full.png) | 100% / 100% |
| Visítanos 390×844 | [PNG](evidencias-grid/capturas/visitanos-390x844-full.png) | [PNG](evidencias-grid/verificacion-actual/capturas/visitanos-390x844-full.png) | 100% / 100% |

Resultados funcionales registrados: [JSON E2E](evidencias-grid/verificacion-actual/resultado-e2e.json), [salida E2E](evidencias-grid/verificacion-actual/e2e-output.txt) y [controles estáticos](evidencias-grid/verificacion-actual/comandos-estaticos.txt). El script verifica rutas locales, búsqueda, filtros, orden, paginación, carrito, menú móvil, Grid computado en body/main, sticky, ausencia de estilos inline/runtime y overflow. Este reporte documenta esas ejecuciones previas; no afirma una nueva ejecución de QA al escribir documentación.

### Reproducir desde la raíz del repositorio

Los comandos usan las carpetas temporales de dependencias registradas en el README; deben existir en esta máquina. Chrome debe estar en la ruta que declara el script. En otra máquina se necesita preparar esos entornos y ajustar sus rutas, sin añadir dependencias productivas.

```sh
# Terminal 1 (si el puerto no está ya servido):
python3 -m http.server 4173 --directory casa_rivas_2

# Terminal 2: captura posterior y pruebas; no reescribir el baseline.
NODE_PATH=/private/var/folders/nn/zvwm35493zx0w93p30_2x24r0000gn/T/opencode/casa-rivas-baseline-playwright/node_modules \
  node casa_rivas_2/evidencias-grid/verificar-actual.cjs

for antes in casa_rivas_2/evidencias-grid/capturas/*-full.png; do
  PYTHONPATH=/private/var/folders/nn/zvwm35493zx0w93p30_2x24r0000gn/T/opencode/casa-rivas-baseline-py \
    python3 casa_rivas_2/evidencias-grid/compare-images.py "$antes" \
    "casa_rivas_2/evidencias-grid/verificacion-actual/capturas/$(basename "$antes")"
done

for archivo in casa_rivas_2/js/{app,cart,data,site}.js; do
  node --check "$archivo" || break
done
git diff --check
```

## Herramienta, demostración y pendientes

Herramienta del trabajo: **OpenCode**. Supervisor indicado para este encargo: **GPT-6 Astra**. No se atribuyen modelos a subagentes ni se inventan herramientas empleadas en guías anteriores. **Pendiente del estudiante:** confirmar que la herramienta elegida es distinta de la utilizada en guías 1 y 2. La [instrucción conservada](evidencias-grid/INSTRUCCION.md) está etiquetada como resumen fiel, no cita literal.

Mini guion propuesto para demo (no ejecutado como entrega de video):

1. Abrir inicio desktop y CSS, mostrar áreas del body/main y señalar sus hijos directos. Mostrar catálogo y navegación móvil.
2. En DevTools, cambiar temporalmente `.product-grid` de 5 a 4 columnas, o su `column-gap` a `48px`. Explicar que auto-colocación genera más filas o que el gap reduce el espacio disponible para pistas `fr`, sin cambiar los productos.
3. Restaurar la declaración original o recargar sin guardar. Mostrar de nuevo el aspecto base; no dejar el cambio de demo en producción ni en snapshots.
4. Enseñar las parejas de capturas y resultados, aclarando tolerancia y condiciones; demostrar búsqueda, paginación y carrito.

**Pendientes del usuario:** grabar el video, publicar la entrega y aportar sus enlaces; confirmar la diferencia de herramienta frente a guías 1/2. No se afirma que estas acciones se hayan realizado.

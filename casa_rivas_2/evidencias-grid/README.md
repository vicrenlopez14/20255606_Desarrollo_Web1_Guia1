# Baseline visual — Casa Rivas 2

Generado antes de cambios de producción. Los únicos archivos copiados son fuentes originales de HTML/CSS/JS en `antes/`; no son contenido generado.

## Capturas full page

| Ruta | Viewport CSS | Evidencia |
|---|---:|---|
| `/index.html` | 1440×900 | `capturas/inicio-1440x900-full.png` |
| `/index.html` | 900×900 | `capturas/inicio-900x900-full.png` |
| `/index.html` | 390×844 | `capturas/inicio-390x844-full.png` |
| `/servicios.html` | 1440×900 | `capturas/servicios-1440x900-full.png` |
| `/servicios.html` | 390×844 | `capturas/servicios-390x844-full.png` |
| `/visitanos.html` | 1440×900 | `capturas/visitanos-1440x900-full.png` |
| `/visitanos.html` | 390×844 | `capturas/visitanos-390x844-full.png` |

Condiciones fijas: Chrome 154.0.8037.98 en modo headless, Playwright 1.56.1, DPR 1, esquema claro, locale `es-SV`, zona `America/El_Salvador`, `prefers-reduced-motion: reduce`. Tras `networkidle`, el script desactiva animaciones/transiciones y hace visibles los elementos `[data-reveal]`. No hay solicitudes externas de fuentes o datos en estas páginas.

## Recaptura

El paquete Playwright se instaló fuera del repositorio, en una carpeta temporal aprobada. Inicie un servidor desde la raíz del repo y ejecute:

```sh
python3 -m http.server 4173 --directory casa_rivas_2
NODE_PATH=/private/var/folders/nn/zvwm35493zx0w93p30_2x24r0000gn/T/opencode/casa-rivas-baseline-playwright/node_modules \
  node casa_rivas_2/evidencias-grid/capturar-baseline.cjs
```

## Umbral cuantitativo

`compare-images.py` compara imágenes RGB de mismas dimensiones. Aprueba si **al menos 85.00%** de píxeles tienen delta máximo por canal ≤16; además informa SSIM global RGB. Ejemplo:

```sh
PYTHONPATH=/private/var/folders/nn/zvwm35493zx0w93p30_2x24r0000gn/T/opencode/casa-rivas-baseline-py \
  python3 casa_rivas_2/evidencias-grid/compare-images.py \
  casa_rivas_2/evidencias-grid/capturas/inicio-1440x900-full.png \
  RUTA_A_CAPTURA_POSTERIOR.png
```

La candidata debe obtenerse con el mismo script, viewport, navegador, DPR, servidor local, datos y condiciones de movimiento. La autocomparación se conserva en `autocomparacion.txt`.

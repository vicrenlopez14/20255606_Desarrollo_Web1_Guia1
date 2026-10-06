# Verificación posterior

Se preservaron `../antes/` y `../generado-inicial/` sin escribir en ellos. Las siete capturas actuales están en `capturas/` y se compararon contra `../capturas/` con el mismo navegador, DPR, viewport, locale, zona horaria y movimiento reducido descritos en el baseline.

- `comparacion-visual.txt`: salida real de los siete comparadores.
- `resultado-e2e.json` y `e2e-output.txt`: navegación local, filtros, búsqueda, orden, paginación, carrito, menú móvil, grid computado, sticky, overflow y consola/red.
- `comandos-estaticos.txt`: sintaxis JS, whitespace de Git, estilos inline/DOM estático y recuento de reglas.

Resultado de inspección manual de las capturas: inicio desktop y Servicios/Visítanos móvil conservan jerarquía, texto, rutas y composición; no se observan recortes ni desbordamiento horizontal. La salida vigente de `comparacion-visual.txt` registra las siete comparaciones con `pixel_similarity=100.0000%` (tolerancia RGB 16) y `global_ssim=100.0000%`, bajo las condiciones controladas del baseline.

Las 100 reglas `nth-child` cubren el máximo configurable de 100 elementos por página, pero el dataset actual tiene 52 productos: las reglas 53–100 no coinciden con contenido actual. No afecta la captura/función actual; es sobrecobertura de mantenimiento.

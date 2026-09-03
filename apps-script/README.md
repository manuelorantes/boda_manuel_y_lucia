# Apps Script de la Pokédex

`Codigo.gs` es el receptor de las fotos. Esta copia es la de referencia; la que
se ejecuta vive en Google, enlazada a la hoja `Pokédex boda`. **Si cambias una,
cambia la otra**, o dejarán de coincidir sin que nadie se entere.

## Por qué existe

GitHub Pages es estático: no hay servidor donde recibir archivos. Google Forms
tampoco vale, porque su pregunta de "subir archivo" exige que el invitado entre
en Google desde el propio formulario y no admite envíos externos.

## Cómo se despliega

1. Abre la hoja `Pokédex boda` → **Extensiones → Apps Script**.
2. Pega el contenido de `Codigo.gs` y guarda.
3. **Implementar → Nueva implementación → Aplicación web.**
   - Ejecutar como: **Yo**.
   - Quién tiene acceso: **Cualquier usuario**.
4. Autoriza los permisos (Drive y Hojas de cálculo).
5. Copia la URL `https://script.google.com/macros/s/.../exec`.

Cada vez que toques el código: **Implementar → Administrar implementaciones →
editar (lápiz) → Versión: Nueva versión → Implementar**. Si te saltas ese paso
la URL sigue sirviendo la versión antigua y parece que tu cambio no ha hecho
nada. Es el error clásico de Apps Script.

## Lo que hay que rellenar antes

- `CLIENT_ID`: el ID de cliente OAuth, cuando esté creado. Mientras ponga
  `PENDIENTE`, **ningún envío se aceptará**: es a propósito, para no aceptar
  fotos sin identidad verificada.
- `FOLDER_ID`: ya puesto.

## Decisiones que conviene no deshacer

**Las fotos son privadas.** Nunca se comparten por enlace. Cuando alguien entra
desde otro móvil, es el script quien se las devuelve tras comprobar que son
suyas. Si algún día se marcan como "cualquiera con el enlace" para ir más
rápido, esas fotos quedan accesibles para quien tenga la URL.

**La hoja solo se escribe añadiendo filas.** Nunca se modifica ninguna. Es lo
que permite que cincuenta personas suban fotos a la vez sin pisarse. El
recuento del ganador sale de las fórmulas de la pestaña `Resumen`, no del
script.

**No se guarda el correo de nadie**, solo el identificador interno de Google
(`sub`) y el nombre de la cuenta.

## Límites que importan

| | |
|---|---|
| Ejecuciones simultáneas | **30** — el cuello de botella real |
| Tamaño por petición | ~50 MB (las fotos van a ~80 KB) |
| Espacio en Drive | 15 GB compartidos con Gmail |

Lo de las 30 ejecuciones importa el día de la boda: si se anuncia una hora
límite para enviar, los envíos se amontonan en ese minuto y parte fallarán. La
web reintenta con espera aleatoria, pero conviene no anunciar una hora exacta.

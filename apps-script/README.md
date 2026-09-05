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
- `ADMIN_EMAIL`: **no va en el código.** Este fichero está versionado en un
  repositorio público, así que el correo de la cuenta maestra se guarda en las
  propiedades del proyecto: **Configuración del proyecto → Propiedades de la
  secuencia de comandos → Añadir propiedad**, clave `ADMIN_EMAIL` y valor el
  correo. Sin ella el panel no deja entrar a nadie y los retos se quedan como
  estén, que es el fallo más prudente de los dos posibles.

## Los retos de los gimnasios

Qué gimnasios están abiertos **no se decide en la web**: es un estado
compartido, porque cuando los novios abren un reto tiene que abrirse para los
ciento y pico invitados a la vez. Vive en la pestaña `Gimnasios` de la hoja.

### Puesta en marcha, una sola vez

En el editor de Apps Script, selecciona `prepararGimnasios` en el desplegable
de funciones y pulsa **Ejecutar**. Crea la pestaña con los ocho retos, los seis
primeros abiertos y los dos últimos bloqueados. Si la pestaña ya existe no la
toca, para no borrar los textos ya escritos.

| Columna | Para qué |
|---|---|
| `id` | Empareja la fila con la tarjeta de la web. Tiene que coincidir con `src/data/pokedex.ts` |
| `bloqueado` | Casilla. Marcada = el invitado solo ve el candado y el cartel |
| `reto` | Título. **Se puede dejar vacía**: si lo está, manda el texto de la web |
| `descripcion` | El texto del líder del gimnasio, igual |
| `actualizado` | Lo escribe el panel; es informativo |

### Dónde vive el texto de los retos

En la web, en `src/data/pokedex.ts`, los ocho. Esta pestaña decide **si un reto
está abierto**, no qué dice.

Que el texto esté en el repositorio (que es público) significa que un invitado
con ganas puede leer los dos retos bloqueados mirando el código fuente antes de
que se abran. Es una decisión tomada a conciencia: a cambio, la pantalla de
gimnasios se lee entera aunque el móvil se quede sin cobertura en el Valle de
Lecrín o el Apps Script no conteste, que el día de la boda pesa más.

Las columnas `reto` y `descripcion` son un apaño para el mismo día: si vienen
escritas, mandan sobre el texto de la web. Sirve para corregir una errata sin
volver a desplegar la página.

### Quién puede cambiarlos

Solo la cuenta guardada en la propiedad `ADMIN_EMAIL`. La comprobación es aquí,
contra el correo del token que Google ha verificado: la web se limita a
preguntar y a pintar lo que se le responda.

Ese correo no está ni en el repositorio ni en el HTML publicado: solo en las
propiedades del proyecto de Apps Script, que no se comparten. Desde fuera no hay
forma de saber cuál es, ni de deducir que existe una cuenta maestra.

Los novios abren y cierran retos desde `/panel/`, una página a la que **no
enlaza nada**. También se puede hacer marcando la casilla `bloqueado` a mano en
la hoja, que es el plan B si el móvil no coopera el día de la boda.

Los invitados leen el estado sin identificarse: los gimnasios están abiertos a
todo el mundo. La respuesta se guarda medio minuto en la caché del script,
porque ese día la piden todos los móviles a la vez y las ejecuciones
simultáneas son el recurso escaso.

## Decisiones que conviene no deshacer

**Las fotos son privadas.** Nunca se comparten por enlace. Cuando alguien entra
desde otro móvil, es el script quien se las devuelve tras comprobar que son
suyas. Si algún día se marcan como "cualquiera con el enlace" para ir más
rápido, esas fotos quedan accesibles para quien tenga la URL.

**La pestaña `Capturas` solo se escribe añadiendo filas.** Nunca se modifica
ninguna. Es lo que permite que cincuenta personas suban fotos a la vez sin
pisarse. El recuento del ganador sale de las fórmulas de la pestaña `Resumen`,
no del script.

La pestaña `Gimnasios` sí modifica filas, pero ahí solo escribe la cuenta
maestra y con un `LockService` de por medio: son ocho filas y un único dedo, no
cincuenta móviles.

**No se guarda el correo de nadie**, solo el identificador interno de Google
(`sub`) y el nombre de la cuenta. El correo se lee de un token para reconocer a
la cuenta maestra y se queda en memoria mientras dura la petición: no se
escribe en ninguna hoja ni se le devuelve a la web.

## Límites que importan

| | |
|---|---|
| Ejecuciones simultáneas | **30** — el cuello de botella real |
| Tamaño por petición | ~50 MB (las fotos van a ~80 KB) |
| Espacio en Drive | 15 GB compartidos con Gmail |

Lo de las 30 ejecuciones importa el día de la boda: si se anuncia una hora
límite para enviar, los envíos se amontonan en ese minuto y parte fallarán. La
web reintenta con espera aleatoria, pero conviene no anunciar una hora exacta.

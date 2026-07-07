# TRAPICHEO

Juego en HTML inspirado en *Papers, Please*: eres un dealer en un banco de parque
y debes saldar una deuda de 500 € con tu proveedor en **10 días**.

**Juega aquí:** https://julioalbertoo.github.io/dealer/

No necesita servidor ni dependencias: también puedes abrir `index.html`
directamente en cualquier navegador.

## El bucle de un día

Cada día tiene tres fases:

1. **Mañana** — Lees «Lo que se oye por el barrio» 👂: los rumores del día, cada
   uno con su emoji según de quién avise (🚔 poli, 💸 moroso, 💉 yonki,
   🔪 ladrón, 🐍 rival). Son las pistas para detectar a los malos. Después el
   proveedor te prepara automáticamente el stock que tiene sentido llevarse:
   suficiente para los clientes esperados, sin fundirte el colchón que
   necesitas para los gastos de la noche. El precio de la dosis sube cada día
   (15 € el día 1, +2 € por día).

2. **Parque** — Entre 6 y 10 clientes se acercan a tu banco. Con cada uno puedes:

   | Acción | Qué hace |
   |---|---|
   | 💬 Charlar | El cliente suelta una línea; algunos tells están en cómo hablan |
   | 👁 Observar | Describes su aspecto; otros tells están en la pinta |
   | 💶 Ver la pasta | Examinas sus billetes (series, tinta, calderilla, fajos...) |
   | ↑ Regatear | Intentas subir el precio 10 €; cómo reaccione también es pista |
   | ✔ Vender / ✘ Rechazar | La decisión final |

   Cada acción de investigación gasta la **paciencia** del cliente (3–5 puntos,
   los círculos de la ficha). Si se agota, se va y pierdes la venta.

3. **Noche** — Resumen de la jornada y las cuentas: comida (20 €), alquiler
   (30 €) y el plazo obligatorio de la deuda (40 €). Después, **la deuda se
   amortiza automáticamente**: todo lo que sobre va directo al proveedor,
   guardándote 80 € de colchón para el material del día siguiente (la última
   noche se entrega todo, sin colchón). Si no puedes cubrir los gastos, estás
   acabado.

## A quién debes evitar

| Tipo | Qué te hace si le vendes |
|---|---|
| Moroso | Paga con billetes falsos o pide fiado: pierdes la dosis |
| Yonki | Paga la mitad, monta escándalos y puede birlarte otra dosis |
| Policía infiltrado | Redada: pierdes todo el stock y el día acaba huyendo. Al tercer aviso, arrestado |
| Ladrón | Te atraca: se lleva la dosis y el 40 % de tu caja |
| Dealer rival | Te quema el punto: al día siguiente vienen menos clientes |

Rechazar también tiene coste: si rechazas a un cliente normal pierdes la venta,
y un yonki rechazado puede montar un escándalo que espante a otro cliente.

### Los tells y los rumores

Cada tipo malo tiene 2–3 tells posibles (en su **aspecto**, su **forma de
hablar** o su **dinero**), pero solo **uno está activo cada día**, y los rumores
de la mañana te chivan cuál es:

- **Días 1–3**: rumores explícitos de todos los tipos presentes.
- **Días 4–7**: mezcla de rumores claros y vagos; aparecen **falsas alarmas**
  (clientes normales con pinta sospechosa).
- **Días 8–10**: solo rumores vagos, y de únicamente dos tipos.

La dificultad también crece en número: 1 malo el día 1, hasta 4–5 al final.

## Finales

- **Retirado con éxito** 🟢 — sobrevives 10 días con la deuda saldada.
- **Superviviente pelado** — sobrevives, pero la deuda sigue viva.
- **Arruinado** 🔴 — no puedes pagar los gastos de una noche.
- **Arrestado** 🔴 — le vendes a un tercer policía.

Tu mejor partida se guarda en `localStorage` y se muestra en la pantalla de
título.

## Música

Suena un loop de **techno de fondo** (132 BPM) sintetizado en directo con Web
Audio —bombo, charles, bajo acid y stabs—, sin ficheros de audio. Arranca al
pulsar EMPEZAR y se silencia con el botón 🔊/🔇 de la esquina superior derecha.

## Versionado y despliegue

En el pie de la página se muestra la versión (`v1.<n>`). El workflow
[`pages.yml`](.github/workflows/pages.yml) la estampa en `js/version.js` en
cada push a `main` (usando el recuento de commits, así se incrementa sola) y
publica el resultado en la rama `gh-pages`, que es la que sirve GitHub Pages.
En local se ve `dev`.

## Estructura

- `index.html` — pantallas del juego (título, mañana, parque, noche, final)
- `style.css` — estética pixel/retro, sprites en CSS
- `js/data.js` — contenido: tells, diálogos, rumores, emojis, finales
- `js/game.js` — lógica: generación de días y clientes, acciones, economía
- `js/musica.js` — techno de fondo con Web Audio
- `js/version.js` — versión mostrada en el pie (la estampa el workflow)

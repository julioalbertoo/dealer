# TRAPICHEO

Juego en HTML inspirado en *Papers, Please*: eres un dealer en un banco de parque
y debes saldar una deuda de 500 € con tu proveedor en **10 días**.

## Cómo jugar

Abre `index.html` en cualquier navegador. No necesita servidor ni dependencias.

- **Por la mañana** lees los rumores del barrio (las pistas del día) y compras
  stock al proveedor. El precio de la dosis sube cada día.
- **En el parque**, entre 6 y 10 clientes se acercan a tu banco. Con cada uno
  puedes **charlar**, **observar su aspecto**, **pedir ver el dinero** y
  **regatear**... pero cada acción gasta su paciencia. Al final: vender o rechazar.
- **Por la noche** llega el resumen del día y los gastos: comida, alquiler y el
  plazo de la deuda. Si no puedes pagar, estás acabado.

## A quién debes evitar

| Tipo | Qué te hace |
|---|---|
| Moroso | Paga con billetes falsos o pide fiado: pierdes la dosis |
| Yonki | Paga la mitad, monta escándalos y puede birlarte otra dosis |
| Policía infiltrado | Pierdes todo el stock y el día acaba huyendo. Al tercero, arrestado |
| Ladrón | Te atraca: se lleva la dosis y parte de tu caja |
| Dealer rival | Te quema el punto: al día siguiente vienen menos clientes |

Cada día, cada tipo tiene un «tell» activo (en su aspecto, su forma de hablar o
su dinero) y los rumores de la mañana te chivan cuál es... al principio. A partir
del día 4 los rumores se vuelven vagos y aparecen falsas alarmas.

## Finales

- **Retirado con éxito** — sobrevives 10 días con la deuda saldada.
- **Superviviente pelado** — sobrevives, pero la deuda sigue viva.
- **Arruinado** — no puedes pagar los gastos de una noche.
- **Arrestado** — le vendes a un tercer policía.

## Estructura

- `index.html` — pantallas del juego
- `style.css` — estética pixel/retro
- `js/data.js` — contenido: tells, diálogos, rumores, finales
- `js/game.js` — lógica: generación de días y clientes, acciones, economía

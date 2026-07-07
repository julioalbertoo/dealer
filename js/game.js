/* ============ TRAPICHEO — lógica del juego ============ */

/* ---------- utilidades ---------- */
const $ = s => document.querySelector(s);
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const eur = n => `${n} €`;

function barajar(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- estado global ---------- */
const CFG = {
  DIAS: 10,
  DINERO_INICIAL: 150,
  DEUDA_INICIAL: 500,
  COSTE_BASE: 15,
  COSTE_SUBIDA: 2,
  GASTO_COMIDA: 20,
  GASTO_ALQUILER: 30,
  PLAZO_DEUDA: 40,
  BUSTS_ARRESTO: 3
};

let S = null;      // estado de partida
let D = null;      // estado del día
let C = null;      // cliente actual
let compraCant = 0;

function nuevaPartida() {
  S = {
    dia: 1,
    dinero: CFG.DINERO_INICIAL,
    deuda: CFG.DEUDA_INICIAL,
    stock: 0,
    busts: 0,
    quemado: false,        // punto quemado hoy (por rival de ayer)
    quemadoManana: false,
    totalVendido: 0
  };
}

const costeDosis = dia => CFG.COSTE_BASE + CFG.COSTE_SUBIDA * (dia - 1);

/* ---------- pantallas ---------- */
function pantalla(id) {
  document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
  $(id).classList.add('activa');
}

/* ============================================================
   GENERACIÓN DEL DÍA
   ============================================================ */
function tiposMalosDisponibles(dia) {
  const t = ['moroso', 'yonki'];
  if (dia >= 2) t.push('poli');
  if (dia >= 3) t.push('ladron');
  if (dia >= 4) t.push('rival');
  return t;
}

function numMalos(dia) {
  if (dia <= 1) return 1;
  if (dia <= 3) return 2;
  if (dia <= 5) return 2 + ri(0, 1);
  if (dia <= 7) return 3;
  if (dia <= 9) return 3 + ri(0, 1);
  return 4;
}

function generarDia() {
  const dia = S.dia;

  // un tell activo por tipo malo, para todo el día
  const tellsDia = {};
  for (const tipo in TELLS) tellsDia[tipo] = pick(TELLS[tipo]);

  let n = ri(6, 10);
  if (S.quemado) n = Math.max(4, n - 2);

  const pool = tiposMalosDisponibles(dia);
  const pesos = { moroso: 3, yonki: 3, poli: 2.5, ladron: 2, rival: 1.5 };
  let malosN = Math.min(numMalos(dia) + (S.quemado ? 1 : 0), n - 2);

  const malos = [];
  let polis = 0;
  while (malos.length < malosN) {
    const total = pool.reduce((s, t) => s + pesos[t], 0);
    let r = Math.random() * total, elegido = pool[0];
    for (const t of pool) { r -= pesos[t]; if (r <= 0) { elegido = t; break; } }
    if (elegido === 'poli' && polis >= 2) continue;
    if (elegido === 'poli') polis++;
    malos.push(elegido);
  }

  const tipos = barajar(
    malos.concat(Array(n - malos.length).fill('normal'))
  );

  const nombres = barajar(NOMBRES);
  const clientes = tipos.map((tipo, i) => crearCliente(tipo, nombres[i % nombres.length], tellsDia));

  D = {
    clientes,
    idx: -1,
    log: [],
    ganado: 0,
    perdido: 0,
    rumores: generarRumores(malos, tellsDia),
    redada: false
  };
}

function generarRumores(malos, tellsDia) {
  const presentes = [...new Set(malos)];
  const rumores = [];

  if (S.dia <= 3) {
    presentes.forEach(t => rumores.push(`${EMOJI_RUMOR[t]} ${tellsDia[t].rumor}`));
  } else if (S.dia <= 7) {
    const orden = barajar(presentes);
    orden.forEach((t, i) => {
      if (i < 2) rumores.push(`${EMOJI_RUMOR[t]} ${tellsDia[t].rumor}`);
      else rumores.push(`${EMOJI_RUMOR[t]} ${tellsDia[t].rumorVago}`);
    });
  } else {
    const orden = barajar(presentes).slice(0, 2);
    orden.forEach(t => rumores.push(`${EMOJI_RUMOR[t]} ${tellsDia[t].rumorVago}`));
  }

  rumores.push(pick(RUMORES_RELLENO));
  if (S.quemado) rumores.unshift('🔥 Tu punto está quemado: ayer le vendiste a la competencia. Hoy vendrá menos gente de fiar.');
  return barajar(rumores);
}

/* ============================================================
   CREACIÓN DE CLIENTES
   ============================================================ */
function crearCliente(tipo, nombre, tellsDia) {
  const tell = tipo === 'normal' ? null : tellsDia[tipo];
  const oferta = pick([25, 30, 35, 40]);

  const c = {
    tipo, nombre, tell,
    oferta,
    precio: oferta,
    maxPaga: oferta + pick([5, 10, 15, 20]),
    paciencia: ri(3, 5),
    pacienciaMax: 0,
    charlaIdx: 0,
    lineas: [],
    aspecto: '',
    aspectoVisto: false,
    pastaVista: false,
    regateoFallido: false,
    sprite: generarSprite(tipo, tell)
  };
  c.pacienciaMax = c.paciencia;

  // aspecto
  if (tell && tell.dominio === 'aspecto') {
    c.aspecto = tell.aspecto;
  } else if (tipo === 'normal' && S.dia >= 4 && Math.random() < 0.3) {
    c.aspecto = pick(ASPECTO_FALSA_ALARMA);
  } else {
    c.aspecto = pick(ASPECTO_NEUTRO);
  }

  // líneas de charla
  const neutras = barajar(CHARLA_NEUTRA[tipo] || CHARLA_NEUTRA.normal);
  if (tell && tell.dominio === 'charla') {
    c.lineas = [neutras[0], tell.linea, neutras[1] || neutras[0]];
  } else {
    c.lineas = [neutras[0], neutras[1] || neutras[0]];
  }

  return c;
}

function generarSprite(tipo, tell) {
  const cfg = {
    piel: pick(['#c99b72', '#b98d64', '#a97f5c', '#8a6248', '#d9a97e']),
    pelo: pick(['#3b2a1c', '#1e1a16', '#5a4632', '#6e6e6e', '#7a3a2a']),
    ropa: pick(['#5a5f6e', '#6e4a4a', '#4a6e5a', '#54506e', '#6e6a4a', '#474747']),
    pantalon: pick(['#3f3a44', '#2f3a4f', '#4a4038', '#35332f']),
    zapa: pick(['#2c2a28', '#3a3230', '#243040']),
    clases: []
  };
  if (tell && tell.sprite) {
    if (tell.sprite.clase) cfg.clases.push(tell.sprite.clase);
    if (tell.sprite.extra) cfg.clases.push(...tell.sprite.extra.split(' '));
  }
  // accesorio aleatorio solo si el tell no viste al cliente
  if (!cfg.clases.length && Math.random() < 0.3) {
    cfg.clases.push(pick(['acc-gorra', 'acc-capucha', 'acc-gafas']));
  }
  return cfg;
}

/* ============================================================
   PANTALLA: MAÑANA
   ============================================================ */
function irManana() {
  generarDia();
  compraCant = 0;

  $('#m-dia').textContent = `DÍA ${S.dia}`;
  $('#m-proveedor-frase').textContent = pick(FRASES_PROVEEDOR);

  const ul = $('#m-rumores');
  ul.innerHTML = '';
  D.rumores.forEach(r => {
    const li = document.createElement('li');
    li.textContent = r;
    ul.appendChild(li);
  });

  renderCompra();
  pantalla('#s-manana');
}

/* El proveedor te prepara solo la cantidad que tiene sentido llevarse:
   suficiente para los clientes que se esperan hoy, sin fundirte el
   colchón que necesitas para los gastos de la noche. */
function calcularCompraAuto() {
  const coste = costeDosis(S.dia);
  const objetivo = Math.max(0, D.clientes.length - S.stock);
  if (objetivo === 0) return 0;
  const colchon = 60;
  let cant = Math.floor((S.dinero - colchon) / coste);
  // si el colchón no deja ni un mínimo, tira de él: sin material no hay negocio
  const minimo = Math.min(objetivo, 3);
  if (cant < minimo) cant = Math.min(minimo, Math.floor(S.dinero / coste));
  return Math.max(0, Math.min(objetivo, cant));
}

function renderCompra() {
  const coste = costeDosis(S.dia);
  compraCant = calcularCompraAuto();
  $('#m-coste').textContent = eur(coste);
  $('#m-stock').textContent = `${S.stock} dosis`;
  $('#m-cantidad').textContent = compraCant;
  $('#m-total').textContent = eur(compraCant * coste);
  $('#m-dinero').textContent = eur(S.dinero - compraCant * coste);
  $('#m-deuda').textContent = eur(S.deuda);
  if (compraCant > 0) {
    $('#m-nota').textContent = 'Coges lo que da de sí la caja sin quedarte sin colchón para la noche.';
  } else if (S.stock > 0) {
    $('#m-nota').textContent = 'Hoy tiras del stock que ya tienes.';
  } else {
    $('#m-nota').textContent = 'No te llega ni para una dosis. Mal día para el negocio.';
  }
  $('#b-salir-parque').textContent =
    (S.stock + compraCant) > 0 ? 'SALIR AL PARQUE →' : 'SALIR SIN MATERIAL →';
}

/* ============================================================
   PANTALLA: PARQUE
   ============================================================ */
function irParque() {
  S.dinero -= compraCant * costeDosis(S.dia);
  S.stock += compraCant;
  pantalla('#s-parque');
  actualizarBarra();
  if (S.stock <= 0) {
    // sin material no hay jornada
    D.cerrando = true;
    limpiarDialogo();
    $('#f-nombre').textContent = '';
    $('#f-oferta').textContent = '';
    $('#f-paciencia').textContent = '';
    setAcciones(false);
    narrar('Sales al parque sin nada que vender. Te sientas un rato, miras a las palomas y recoges.', 'narrador');
    mostrarSiguiente('CERRAR EL DÍA →');
    return;
  }
  siguienteCliente();
}

function actualizarBarra() {
  $('#b-dia').textContent = `DÍA ${S.dia}/${CFG.DIAS}`;
  $('#b-dinero').textContent = `💰 ${eur(S.dinero)}`;
  $('#b-stock').textContent = `📦 ${S.stock} dosis`;
  $('#b-deuda').textContent = `Deuda: ${eur(S.deuda)}`;
  const total = D ? D.clientes.length : 0;
  const idx = D ? Math.min(D.idx + 1, total) : 0;
  $('#b-cliente').textContent = `Cliente ${idx}/${total}`;
}

function limpiarDialogo() { $('#dialogo').innerHTML = ''; }

function narrar(texto, clase) {
  const p = document.createElement('p');
  p.className = clase || 'narrador';
  p.textContent = texto;
  $('#dialogo').appendChild(p);
  $('#dialogo').scrollTop = $('#dialogo').scrollHeight;
}

function setAcciones(activas) {
  ['#a-charlar', '#a-observar', '#a-pasta', '#a-regatear', '#a-vender', '#a-rechazar']
    .forEach(id => { $(id).disabled = !activas; });
  $('#acciones').classList.toggle('oculto', false);
  $('#post-cliente').classList.add('oculto');
}

function mostrarSiguiente(texto) {
  $('#acciones').classList.add('oculto');
  $('#post-cliente').classList.remove('oculto');
  $('#b-siguiente').textContent = texto || 'SIGUIENTE →';
}

function renderPaciencia() {
  if (!C) { $('#f-paciencia').textContent = ''; return; }
  const p = Math.max(0, C.paciencia);
  $('#f-paciencia').textContent = '●'.repeat(p) + '○'.repeat(C.pacienciaMax - p);
}

function renderFicha() {
  $('#f-nombre').textContent = C.nombre;
  if (C.precio > C.oferta) {
    $('#f-oferta').innerHTML =
      `Quiere 1 dosis · paga <s class="precio-viejo">${C.oferta} €</s> <b class="precio-nuevo">${C.precio} €</b>`;
  } else {
    $('#f-oferta').innerHTML = `Quiere 1 dosis · paga <b class="precio-base">${C.precio} €</b>`;
  }
  renderPaciencia();
}

/* marca de forma visible que el cliente ha aceptado pagar más */
function marcarSubidaPrecio(delta) {
  renderFicha();
  const oferta = $('#f-oferta');
  oferta.classList.remove('precio-sube');
  void oferta.offsetWidth; // reinicia la animación
  oferta.classList.add('precio-sube');
  const badge = document.createElement('span');
  badge.className = 'badge-subida';
  badge.textContent = `+${delta} €`;
  $('#ficha').appendChild(badge);
  setTimeout(() => badge.remove(), 1500);
}

function renderSprite(c) {
  const el = $('#sprite');
  el.className = 'sprite';
  void el.offsetWidth; // reinicia la animación de llegada
  el.style.setProperty('--piel', c.sprite.piel);
  el.style.setProperty('--pelo', c.sprite.pelo);
  el.style.setProperty('--ropa', c.sprite.ropa);
  el.style.setProperty('--pantalon', c.sprite.pantalon);
  el.style.setProperty('--zapa', c.sprite.zapa);
  c.sprite.clases.forEach(cl => el.classList.add(cl));
}

function siguienteCliente() {
  if (S.stock <= 0) {
    C = null;
    D.cerrando = true;
    limpiarDialogo();
    narrar('Sin material que vender. Recoges y te largas antes de llamar la atención.', 'aviso');
    $('#f-nombre').textContent = '';
    $('#f-oferta').textContent = '';
    $('#f-paciencia').textContent = '';
    mostrarSiguiente('CERRAR EL DÍA →');
    return;
  }
  D.idx++;
  if (D.idx >= D.clientes.length) {
    finDelDia('fin');
    return;
  }
  C = D.clientes[D.idx];
  actualizarBarra();
  limpiarDialogo();
  renderSprite(C);
  renderFicha();
  setAcciones(true);
  narrar(`Se acerca alguien al banco. Dice llamarse ${C.nombre}.`, 'narrador');
  narrar(`Quiere una dosis y ofrece ${eur(C.oferta)}.`, 'narrador');
}

/* ---------- coste de paciencia ---------- */
function gastarPaciencia() {
  C.paciencia--;
  renderPaciencia();
  if (C.paciencia <= 0) {
    narrar(pick(TEXTOS.pacienciaAgotada), 'aviso');
    despedirCliente(`${C.nombre} se ha ido harto de esperar`);
    return true;
  }
  return false;
}

/* ---------- acciones ---------- */
function accCharlar() {
  const linea = C.lineas[Math.min(C.charlaIdx, C.lineas.length - 1)];
  C.charlaIdx++;
  narrar(linea, 'cliente-habla');
  gastarPaciencia();
}

function accObservar() {
  narrar(`(Observas) ${C.aspecto}`, 'narrador');
  if (!C.aspectoVisto) {
    C.aspectoVisto = true;
    gastarPaciencia();
  }
}

function accPasta() {
  const info = infoPasta(C);
  renderPasta(info);
  $('#modal-pasta').classList.remove('oculto');
  if (!C.pastaVista) {
    C.pastaVista = true;
    // la paciencia se descuenta al cerrar el modal, para que se vea el dinero
  } else {
    C.pastaGratis = true;
  }
}

function cerrarPasta() {
  $('#modal-pasta').classList.add('oculto');
  if (!C) return;
  if (!C.pastaGratis && !C.pastaCobrada) {
    C.pastaCobrada = true;
    gastarPaciencia();
  }
}

function accRegatear() {
  const antes = C.precio;
  const nuevo = C.precio + 10;
  switch (C.tipo) {
    case 'poli':
      C.precio = nuevo;
      narrar(REGATEO.poli, 'cliente-habla');
      break;
    case 'moroso':
      C.precio = nuevo;
      narrar(REGATEO.moroso, 'cliente-habla');
      break;
    case 'ladron':
      C.precio = nuevo;
      narrar(REGATEO.ladron, 'cliente-habla');
      break;
    case 'rival':
      C.precio = nuevo;
      narrar(REGATEO.rival, 'cliente-habla');
      break;
    case 'yonki':
      narrar(REGATEO.yonki, 'cliente-habla');
      break;
    default: // normal
      if (C.regateoFallido) {
        narrar(pick(REGATEO.normal_sevá), 'aviso');
        despedirCliente(`${C.nombre} se fue por apretarle con el precio`);
        return;
      }
      if (nuevo <= C.maxPaga) {
        C.precio = nuevo;
        narrar(pick(REGATEO.normal_acepta), 'cliente-habla');
      } else {
        C.regateoFallido = true;
        narrar(pick(REGATEO.normal_rechaza), 'cliente-habla');
      }
  }
  if (C.precio > antes) {
    narrar(`(Trato mejorado: ahora paga ${eur(C.precio)})`, 'bueno');
    marcarSubidaPrecio(C.precio - antes);
  } else {
    renderFicha();
  }
  gastarPaciencia();
}

/* ---------- inspección del dinero ---------- */
function infoPasta(c) {
  const modo = (c.tell && c.tell.billetes) ? c.tell.billetes : 'normal';
  const precio = c.precio;

  const desglose = p => {
    const b = [];
    let resto = p;
    while (resto >= 50) { b.push(50); resto -= 50; }
    while (resto >= 20) { b.push(20); resto -= 20; }
    while (resto >= 10) { b.push(10); resto -= 10; }
    while (resto >= 5) { b.push(5); resto -= 5; }
    return b.length ? b : [5];
  };
  const serieAleatoria = () =>
    'VX' + String(ri(1000000, 9999999));

  switch (modo) {
    case 'correlativos': {
      const base = ri(1000000, 9998000);
      return {
        billetes: desglose(precio).map((den, i) => ({ den, serie: 'NC' + (base + i), clases: 'nuevo' })),
        desc: c.tell.dineroDesc
      };
    }
    case 'tinta':
      return {
        billetes: desglose(precio).map(den => ({ den, serie: serieAleatoria(), clases: 'tinta' })),
        desc: c.tell.dineroDesc
      };
    case 'serieRepetida': {
      const serie = serieAleatoria();
      return {
        billetes: desglose(precio).map(den => ({ den, serie, clases: '' })),
        desc: c.tell.dineroDesc
      };
    }
    case 'calderilla':
      return {
        billetes: [{ den: 10, serie: serieAleatoria(), clases: 'arrugado' }],
        monedas: ri(4, 8),
        desc: c.tell.dineroDesc
      };
    case 'fajo':
      return { fajo: true, desc: c.tell.dineroDesc };
    case 'nada':
      return { billetes: [], desc: c.tell.dineroDesc };
    default:
      return {
        billetes: desglose(precio).map(den => ({ den, serie: serieAleatoria(), clases: '' })),
        desc: `Billetes usados, normales y corrientes. La cuenta sale: ${eur(precio)}.`
      };
  }
}

function renderPasta(info) {
  const cont = $('#billetes');
  cont.innerHTML = '';
  if (info.fajo) {
    const f = document.createElement('div');
    f.className = 'fajo';
    cont.appendChild(f);
  }
  (info.billetes || []).forEach(b => {
    const el = document.createElement('div');
    el.className = `billete b${b.den} ${b.clases}`.trim();
    el.innerHTML = `<span class="den">${b.den} €</span><span class="serie">Nº ${b.serie}</span>`;
    cont.appendChild(el);
  });
  for (let i = 0; i < (info.monedas || 0); i++) {
    const m = document.createElement('span');
    m.className = 'moneda';
    m.textContent = '€';
    cont.appendChild(m);
  }
  if (!cont.children.length) {
    cont.innerHTML = '<p class="narrador">— No hay nada que ver. —</p>';
  }
  $('#pasta-desc').textContent = info.desc;
}

/* ---------- animación de intercambio: dinero y dosis ---------- */
let intercambioTimer = null;
function animarIntercambio(conBillete = true) {
  const cont = $('#intercambio');
  clearTimeout(intercambioTimer);
  cont.querySelector('.vuela-billete').classList.toggle('oculto', !conBillete);
  // ocultar y volver a mostrar reinicia las animaciones CSS
  cont.classList.add('oculto');
  void cont.offsetWidth;
  cont.classList.remove('oculto');
  intercambioTimer = setTimeout(() => cont.classList.add('oculto'), 1250);
}

/* ---------- resolución: vender / rechazar ---------- */
function accVender() {
  setAcciones(false);
  let trato = false;        // hubo intercambio de mano a mano
  let tratoConBillete = true;

  switch (C.tipo) {
    case 'normal': {
      S.stock--;
      S.dinero += C.precio;
      D.ganado += C.precio;
      S.totalVendido++;
      trato = true;
      narrar(pick(TEXTOS.ventaOk), 'bueno');
      registrar(`Venta a ${C.nombre}: +${eur(C.precio)}`, 'ingreso');
      break;
    }
    case 'moroso': {
      S.stock--;
      D.perdido += costeDosis(S.dia);
      trato = true;
      tratoConBillete = C.tell.id !== 'fiado'; // al fiado no le ves un billete
      if (C.tell.id === 'fiado') {
        narrar('Le fías la dosis. Te jura que mañana te paga el doble. No lo volverás a ver en tu vida.', 'malo');
        registrar(`${C.nombre} se llevó una dosis de fiado (era un moroso): 0 €`, 'gasto');
      } else {
        narrar('Cierras el trato. Horas después, al recontar la caja... el billete es FALSO. Te han timado.', 'malo');
        registrar(`${C.nombre} pagó con billetes falsos (moroso): dosis perdida`, 'gasto');
      }
      break;
    }
    case 'yonki': {
      S.stock--;
      const paga = Math.floor(C.precio / 2);
      S.dinero += paga;
      D.ganado += paga;
      trato = true;
      narrar(`Rebusca por todos los bolsillos y solo junta ${eur(paga)}. Lo coges por no montar numerito.`, 'aviso');
      registrar(`Venta a ${C.nombre} (yonki), pagó corto: +${eur(paga)}`, 'ingreso');
      if (S.stock > 0 && Math.random() < 0.4) {
        S.stock--;
        D.perdido += costeDosis(S.dia);
        narrar('Con el lío de las monedas... ¡te ha birlado otra dosis del bolsillo! Será cabrón.', 'malo');
        registrar(`${C.nombre} te birló una dosis extra`, 'gasto');
      }
      break;
    }
    case 'ladron': {
      S.stock--;
      const roba = Math.floor(S.dinero * 0.4);
      S.dinero -= roba;
      D.perdido += roba + costeDosis(S.dia);
      narrar(`Sacas el material... y saca una navaja. «La dosis, la caja, todo.» Se lleva ${eur(roba)} y la dosis.`, 'malo');
      registrar(`${C.nombre} te atracó (ladrón): −${eur(roba)} y una dosis`, 'gasto');
      break;
    }
    case 'rival': {
      S.stock--;
      S.dinero += C.precio;
      D.ganado += C.precio;
      S.quemadoManana = true;
      trato = true;
      narrar('Paga sin rechistar y se va sonriendo... demasiado interesado en tu esquina. Mal asunto.', 'aviso');
      registrar(`Venta a ${C.nombre}: +${eur(C.precio)} · era un DEALER RIVAL, tu punto queda quemado`, 'gasto');
      break;
    }
    case 'poli': {
      redada();
      return;
    }
  }
  actualizarBarra();
  if (trato) {
    // el billete y la dosis cruzan el aire antes de que el cliente se vaya
    animarIntercambio(tratoConBillete);
    setTimeout(() => { irseSprite(); mostrarSiguiente(); }, 1050);
  } else {
    irseSprite();
    mostrarSiguiente();
  }
}

function accRechazar() {
  setAcciones(false);

  if (C.tipo === 'normal') {
    narrar(pick(TEXTOS.rechazoNormal), 'narrador');
    registrar(`Rechazaste a ${C.nombre}... y era un cliente normal. Venta perdida (${eur(C.precio)})`, 'gasto');
  } else if (C.tipo === 'yonki') {
    if (Math.random() < 0.5 && D.idx < D.clientes.length - 1) {
      D.clientes.pop();
      narrar('«¡¿CÓMO QUE NO?!» Monta un pollo tremendo, a gritos. Medio parque mirando. Un cliente que venía... da media vuelta.', 'malo');
      registrar(`${C.nombre} (yonki) montó un escándalo: un cliente menos hoy`, 'gasto');
      actualizarBarra();
    } else {
      narrar('Rezonga, escupe al suelo y se arrastra hacia el puente. Mejor así.', 'narrador');
      registrar(`Rechazaste a ${C.nombre} (yonki). Sin incidentes`, '');
    }
  } else {
    const nombreTipo = { poli: 'POLICÍA INFILTRADO', moroso: 'moroso', ladron: 'ladrón', rival: 'dealer rival' }[C.tipo];
    narrar(pick(TEXTOS.rechazoMalo), 'bueno');
    registrar(`Rechazaste a ${C.nombre}: era un ${nombreTipo} ✔`, 'ingreso');
  }
  irseSprite();
  mostrarSiguiente();
}

function despedirCliente(motivoLog) {
  setAcciones(false);
  const tipoReal = C.tipo === 'normal' ? 'cliente normal'
    : { poli: 'POLICÍA INFILTRADO', moroso: 'moroso', yonki: 'yonki', ladron: 'ladrón', rival: 'dealer rival' }[C.tipo];
  registrar(`${motivoLog} (era: ${tipoReal})`, C.tipo === 'normal' ? 'gasto' : '');
  irseSprite();
  mostrarSiguiente();
}

function registrar(texto, clase) {
  D.log.push({ texto, clase });
}

function irseSprite() {
  $('#sprite').classList.add('irse');
}

/* ---------- redada ---------- */
function redada() {
  D.redada = true;
  S.busts++;
  const dosisPerdidas = S.stock;
  D.perdido += dosisPerdidas * costeDosis(S.dia);
  S.stock = 0;

  $('#flash-poli').classList.remove('oculto');

  setTimeout(() => {
    $('#flash-poli').classList.add('oculto');

    if (S.busts >= CFG.BUSTS_ARRESTO) {
      finalPartida('arrestado');
      return;
    }

    limpiarDialogo();
    $('#sprite').classList.add('oculto');
    narrar('¡Era un POLI! Placas por todas partes. Tiras el material a la fuente y sales corriendo entre los setos.', 'malo');
    narrar(`Pierdes las ${dosisPerdidas} dosis que te quedaban. El día se acabó.`, 'malo');
    narrar(`(Aviso nº ${S.busts} de la policía: al tercero, te arrestan.)`, 'aviso');
    registrar(`REDADA: le vendiste a un poli. Pierdes ${dosisPerdidas} dosis y sales corriendo`, 'gasto');
    actualizarBarra();
    mostrarSiguiente('HUIR AL RESUMEN →');
  }, 1800);
}

/* ---------- fin del día ---------- */
function clickSiguiente() {
  if (D.redada || D.cerrando) { finDelDia(); return; }
  siguienteCliente();
}

function finDelDia() {
  C = null;
  irNoche();
}

/* ============================================================
   PANTALLA: NOCHE
   ============================================================ */
function irNoche() {
  $('#n-titulo').textContent = `FIN DEL DÍA ${S.dia}`;

  const ul = $('#n-log');
  ul.innerHTML = '';
  if (!D.log.length) {
    const li = document.createElement('li');
    li.textContent = 'Un día muerto. Ni una operación.';
    ul.appendChild(li);
  }
  D.log.forEach(e => {
    const li = document.createElement('li');
    li.textContent = e.texto;
    if (e.clase) li.className = e.clase;
    ul.appendChild(li);
  });

  // gastos de la noche
  const plazo = Math.min(CFG.PLAZO_DEUDA, S.deuda);
  const gastos = [
    { nombre: 'Comida', importe: CFG.GASTO_COMIDA },
    { nombre: 'Alquiler del cuchitril', importe: CFG.GASTO_ALQUILER },
  ];
  if (plazo > 0) gastos.push({ nombre: 'Plazo de la deuda (proveedor)', importe: plazo });
  const totalGastos = gastos.reduce((s, g) => s + g.importe, 0);

  const gul = $('#n-gastos');
  gul.innerHTML = '';
  gastos.forEach(g => {
    const li = document.createElement('li');
    li.className = 'gasto';
    li.textContent = `${g.nombre}: ${eur(g.importe)}`;
    gul.appendChild(li);
  });

  const nota = $('#n-nota-deuda');

  if (S.dinero < totalGastos) {
    // no puedes pagar: ruina
    const li = document.createElement('li');
    li.className = 'gasto';
    li.textContent = `Tienes ${eur(S.dinero)} y debes pagar ${eur(totalGastos)}. No llega.`;
    gul.appendChild(li);
    $('#n-dinero').textContent = eur(S.dinero);
    $('#n-dinero').className = 'rojo';
    $('#n-deuda').textContent = eur(S.deuda);
    nota.textContent = 'No llegas ni a cubrir los gastos. Se acabó.';
    $('#b-continuar').textContent = 'NO PUEDES PAGAR...';
    S.arruinado = true;
  } else {
    S.dinero -= totalGastos;
    S.deuda -= plazo;

    // amortización automática: lo que sobra va directo a la deuda,
    // guardando un colchón para el material de mañana (la última noche, todo)
    const colchon = S.dia >= CFG.DIAS ? 0 : 80;
    const amort = Math.min(S.deuda, Math.max(0, S.dinero - colchon));
    if (amort > 0) {
      S.dinero -= amort;
      S.deuda -= amort;
      const li = document.createElement('li');
      li.className = 'amortizacion';
      li.textContent = `Amortización automática de deuda: ${eur(amort)}`;
      gul.appendChild(li);
    }

    if (S.deuda <= 0) {
      nota.textContent = '✔ Deuda saldada con el proveedor. Lo que ganes ya es tuyo.';
    } else if (amort > 0) {
      nota.textContent = `Lo que sobra tras los gastos va directo al proveedor. Te guardas ${eur(colchon)} de colchón para el material de mañana.`;
    } else {
      nota.textContent = 'Hoy no ha sobrado nada para adelantar deuda.';
    }

    $('#n-dinero').textContent = eur(S.dinero);
    $('#n-dinero').className = '';
    $('#n-deuda').textContent = eur(S.deuda);
    $('#b-continuar').textContent = S.dia >= CFG.DIAS ? 'VER CÓMO ACABA →' : 'DORMIR →';
    S.arruinado = false;
  }
  nota.classList.toggle('verde', !S.arruinado && S.deuda <= 0);
  pantalla('#s-noche');
}

function clickContinuar() {
  if (S.arruinado) { finalPartida('arruinado'); return; }
  if (S.dia >= CFG.DIAS) {
    finalPartida(S.deuda <= 0 ? 'retirado' : 'pelado');
    return;
  }
  S.dia++;
  S.quemado = S.quemadoManana;
  S.quemadoManana = false;
  irManana();
}

/* ============================================================
   FINALES Y RÉCORD
   ============================================================ */
function finalPartida(clave) {
  const fin = FINALES[clave];
  $('#fin-titulo').textContent = fin.titulo;
  $('#fin-titulo').className = fin.clase;
  $('#fin-texto').textContent = fin.texto;
  $('#fin-stats').textContent =
    `Días en el banco: ${S.dia} · Ventas totales: ${S.totalVendido} · Dinero final: ${eur(S.dinero)} · Deuda: ${eur(S.deuda)}`;
  guardarRecord(clave);
  pantalla('#s-final');
}

function guardarRecord(clave) {
  try {
    const prev = JSON.parse(localStorage.getItem('trapicheo_record') || 'null');
    const actual = { resultado: FINALES[clave].titulo, dia: S.dia, dinero: S.dinero };
    if (!prev || actual.dia > prev.dia || (actual.dia === prev.dia && actual.dinero > prev.dinero)) {
      localStorage.setItem('trapicheo_record', JSON.stringify(actual));
    }
  } catch (e) { /* localStorage no disponible: sin récord */ }
}

function mostrarRecord() {
  try {
    const r = JSON.parse(localStorage.getItem('trapicheo_record') || 'null');
    if (r) {
      const el = $('#titulo-record');
      el.textContent = `Mejor partida: ${r.resultado} — día ${r.dia}, ${eur(r.dinero)}`;
      el.classList.remove('oculto');
    }
  } catch (e) { /* nada */ }
}

/* ============================================================
   ARRANQUE Y EVENTOS
   ============================================================ */
function empezar() {
  Musica.encender();   // el clic en EMPEZAR es el gesto que desbloquea el audio
  pintarBotonMusica();
  nuevaPartida();
  irManana();
}

function pintarBotonMusica() {
  const b = $('#b-musica');
  b.textContent = Musica.activa() ? '🔊' : '🔇';
  b.title = Musica.activa() ? 'Silenciar el techno' : 'Poner el techno';
}

document.addEventListener('DOMContentLoaded', () => {
  mostrarRecord();
  $('#pie-version').textContent =
    `TRAPICHEO ${typeof VERSION !== 'undefined' ? VERSION : ''}`.trim();

  $('#b-empezar').addEventListener('click', empezar);
  $('#b-reiniciar').addEventListener('click', () => { mostrarRecord(); empezar(); });

  $('#b-salir-parque').addEventListener('click', irParque);

  $('#a-charlar').addEventListener('click', accCharlar);
  $('#a-observar').addEventListener('click', accObservar);
  $('#a-pasta').addEventListener('click', accPasta);
  $('#a-regatear').addEventListener('click', accRegatear);
  $('#a-vender').addEventListener('click', accVender);
  $('#a-rechazar').addEventListener('click', accRechazar);
  $('#b-cerrar-pasta').addEventListener('click', cerrarPasta);

  $('#b-siguiente').addEventListener('click', clickSiguiente);
  $('#b-continuar').addEventListener('click', clickContinuar);

  $('#b-musica').addEventListener('click', () => {
    Musica.alternar();
    pintarBotonMusica();
  });
});

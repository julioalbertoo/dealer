/* ============ TRAPICHEO — contenido: nombres, tells, diálogos, rumores ============ */

const NOMBRES = [
  'Tono', 'La Peque', 'El Chino', 'Marga', 'Rubén', 'El Lolo', 'Vane',
  'Piojo', 'Santi', 'La Yoli', 'Curro', 'El Flaco', 'Andrea', 'Nacho',
  'La Turbo', 'Josemi', 'El Peras', 'Sonia', 'Guille', 'La Chunga',
  'Dani', 'El Grillo', 'Patri', 'Moha', 'La Vecina', 'Íker', 'El Largo'
];

/* Cada tipo malo tiene 2-3 tells posibles. Cada día se activa UNO por tipo
   y el rumor matinal puede chivarlo (explícito los primeros días, vago después). */
const TELLS = {

  poli: [
    {
      id: 'zapatos', dominio: 'aspecto',
      aspecto: 'Ropa del montón, gastada... pero las zapatillas son blancas impolutas, recién sacadas de la caja. Nadie del barrio estrena así.',
      rumor: 'Soplo del día: los infiltrados van con zapatillas nuevas relucientes. Míralos a los pies.',
      rumorVago: 'La pasma anda cerca. Fíjate bien en los pies de la gente.',
      sprite: { clase: 'zapas-nuevas' }
    },
    {
      id: 'jerga', dominio: 'charla',
      linea: '«Hola, buenas. ¿Sería posible adquirir alguna sustancia estupefaciente?»',
      rumor: 'Dicen que los novatos de la secreta hablan como un atestado: «sustancias», «estupefacientes»... Aquí nadie habla así.',
      rumorVago: 'Desconfía de quien hable demasiado fino para este parque.'
    },
    {
      id: 'pasta', dominio: 'dinero',
      dineroDesc: 'Billetes nuevos, tiesos, planchados. La numeración es correlativa, uno detrás de otro. Como recién salidos de comisaría.',
      rumor: 'La brigada paga con billetes recién impresos y numeración seguida. Pídeles ver la pasta antes de nada.',
      rumorVago: 'Circula pasta demasiado limpia por el parque. Tú mira los números.',
      billetes: 'correlativos'
    }
  ],

  moroso: [
    {
      id: 'tinta', dominio: 'dinero',
      dineroDesc: 'Algo no cuadra: la tinta está corrida y el color tira a verdoso. Esto lo han impreso en un garaje.',
      rumor: 'Circulan billetes falsos con la tinta corrida y el color raro. Revisa lo que te den.',
      rumorVago: 'Hay pasta falsa moviéndose por el barrio. Revisa los billetes.',
      billetes: 'tinta'
    },
    {
      id: 'serie', dominio: 'dinero',
      dineroDesc: 'Espera... todos los billetes tienen EL MISMO número de serie. Fotocopias con mucho morro.',
      rumor: 'Ojo: hay billetes falsos clavaditos unos a otros, repiten hasta el número de serie.',
      rumorVago: 'Hay pasta falsa moviéndose por el barrio. Revisa los billetes.',
      billetes: 'serieRepetida'
    },
    {
      id: 'fiado', dominio: 'dinero',
      dineroDesc: '«¿La pasta? Es que hoy no llevo, tío... pero mañana te pago el doble, palabra.» No enseña ni un billete.',
      linea: '«Hoy ando pillado, pero tú me conoces, ¿no? Mañana te lo pago todo junto.»',
      rumor: 'Anda por ahí un jeta pidiendo fiado a todo el que vende. A ese ni agua.',
      rumorVago: 'Alguien va por ahí viviendo del cuento. Que nadie te dé palabras en vez de billetes.',
      billetes: 'nada'
    }
  ],

  yonki: [
    {
      id: 'marcas', dominio: 'aspecto',
      aspecto: 'Brazos llenos de marcas, ojeras hasta el suelo y no para de rascarse el cuello. Está con el mono encima.',
      rumor: 'Los colgados del puente están bajando al parque. Dinero corto y broncas gratis.',
      rumorVago: 'Mucho colgado suelto hoy. Tú verás a quién le vendes.',
      sprite: { clase: 'acc-marcas', extra: 'palido temblor' }
    },
    {
      id: 'suplica', dominio: 'charla',
      linea: '«Porfa, porfa, tío... aunque sea media, lo que sea, que llevo un mono que me muero...»',
      rumor: 'Si te suplican la dosis antes de saludar, ya sabes lo que hay: problemas.',
      rumorVago: 'Mucho colgado suelto hoy. Tú verás a quién le vendes.',
      sprite: { extra: 'palido temblor' }
    },
    {
      id: 'calderilla', dominio: 'dinero',
      dineroDesc: 'Un puñado de monedas pegajosas y un billete arrugado que ha visto cosas. No llega ni a la mitad del precio.',
      rumor: 'Los yonkis van pagando con calderilla y billetes hechos una bola. No te llegará ni a la mitad.',
      rumorVago: 'Mucho colgado suelto hoy. Tú verás a quién le vendes.',
      billetes: 'calderilla',
      sprite: { extra: 'palido' }
    }
  ],

  ladron: [
    {
      id: 'bulto', dominio: 'aspecto',
      aspecto: 'Lleva un bulto sospechoso bajo la chaqueta, a la altura del cinturón. Y te aseguro que no es una fiambrera.',
      rumor: 'Están atracando a la gente del oficio. El palo lo da uno con un bulto bajo la chaqueta.',
      rumorVago: 'Han pinchado a dos vendedores esta semana. No enseñes la caja a cualquiera.',
      sprite: { clase: 'acc-bulto' }
    },
    {
      id: 'apartado', dominio: 'charla',
      linea: '«Aquí hay mucho ojo, ¿no? Vente detrás de los setos y lo hacemos tranquilos, tú y yo solos.»',
      rumor: 'Si alguien insiste en llevarte a un sitio apartado para el cambio, es un palo seguro.',
      rumorVago: 'Han pinchado a dos vendedores esta semana. Tú no te muevas del banco.',
      sprite: { clase: 'acc-capucha' }
    },
    {
      id: 'niega', dominio: 'dinero',
      dineroDesc: '«¿La pasta? Primero saca tú el material y luego hablamos de pasta.» No suelta un billete ni de broma.',
      rumor: 'El que no quiera enseñarte el dinero por delante, va a por tu caja, no a por tu material.',
      rumorVago: 'Han pinchado a dos vendedores esta semana. Dinero por delante, siempre.',
      billetes: 'nada'
    }
  ],

  rival: [
    {
      id: 'preguntas', dominio: 'charla',
      linea: '«Oye... ¿a cuánto lo estás dejando tú? ¿Y quién te lo pasa, si se puede saber? Por curiosidad.»',
      rumor: 'Un dealer de otro barrio anda husmeando el parque y preguntando por proveedores. Ni media palabra.',
      rumorVago: 'Alguien pregunta demasiado por tu esquina. Boca cerrada.',
    },
    {
      id: 'pinta', dominio: 'aspecto',
      aspecto: 'Cadena de oro, riñonera cara y zapatillas de 200 pavos. Y mira tu banco como quien mide un local antes de alquilarlo.',
      rumor: 'El fulano que va husmeando puntos de venta gasta cadena de oro y riñonera. Que no se siente en tu banco.',
      rumorVago: 'Alguien pregunta demasiado por tu esquina. Boca cerrada.',
      sprite: { clase: 'acc-rinonera', extra: 'acc-cadena' }
    },
    {
      id: 'fajos', dominio: 'dinero',
      dineroDesc: 'Saca un fajo gordo sujeto con una goma roja. Nadie compra UNA dosis paseando un fajo así: eso es capital de negocio.',
      rumor: 'Dicen que el competidor va enseñando fajos con goma roja para impresionar. Un cliente de verdad no lleva eso.',
      rumorVago: 'Alguien pregunta demasiado por tu esquina. Boca cerrada.',
      billetes: 'fajo'
    }
  ]
};

/* ---- contenido neutral (sin tell) por tipo ---- */

const CHARLA_NEUTRA = {
  normal: [
    '«¿Qué pasa? Lo de siempre, porfa, que tengo prisa.»',
    '«Buah, menuda semanita llevo. Ponme una, anda.»',
    '«¿Llevas algo hoy? Es para el finde.»',
    '«Tranqui que vengo de parte del Rata, me dijo que aquí había calidad.»',
    '«Date prisa, que he dejado el coche en doble fila.»',
    '«Al final el Betis sube, ya verás. Bueno, a lo que iba.»'
  ],
  poli: [
    '«Buenas. Vengo de parte de... un colega del barrio. Ya sabes.»',
    '«¿Qué tal el día? ¿Mucho movimiento por aquí?»',
    '«Me han dicho que tú eres el de confianza en este parque.»'
  ],
  moroso: [
    '«¡Hombre! Cuánto tiempo. ¿Me pones lo de siempre?»',
    '«Tú y yo nos entendemos, ¿eh? La gente seria escasea.»'
  ],
  yonki: [
    '«Tío... tío... ¿llevas? Dime que llevas.»',
    '«Es que si no pillo hoy me muero, de verdad te lo digo.»'
  ],
  ladron: [
    '«¿Tú trabajas solo o hay más gente mirando?»',
    '«¿Cuánta gente pasa por aquí al día? Por saber si eres serio.»'
  ],
  rival: [
    '«Bonito banco. Buena sombra, buena visibilidad... buen sitio.»',
    '«¿Hace mucho que trabajas esta zona?»'
  ]
};

const ASPECTO_NEUTRO = [
  'Pinta normal: chándal, mochila y cara de sueño. Podría ser cualquiera del barrio.',
  'Ropa de currante, manos manchadas de pintura. Viene directo del tajo.',
  'Sudadera vieja y auriculares colgando. Ni te mira a los ojos, como todos.',
  'Va con bolsa del súper y zapatillas gastadas. Nada fuera de lo normal.',
  'Parece estudiante: mochila, ojeras de exámenes y prisa.',
  'Un vecino de toda la vida, de los que sacan al perro a estas horas.'
];

/* aspecto sospechoso... pero legal (falsas alarmas, a partir del día 4) */
const ASPECTO_FALSA_ALARMA = [
  'Gafas de sol al atardecer y mirando a todos lados... aunque bueno, también lleva un cucurucho de pipas. Nervios de primerizo, quizá.',
  'Zapatillas bastante nuevas... y una mancha de lejía en el pantalón. Currante que ha cobrado, probablemente.',
  'No para de mirar el móvil y de darse la vuelta. O es su primera vez o le espera alguien impaciente.',
  'Chaqueta abultada... aunque al moverse suena a tupper. Viene de currar, casi seguro.'
];

const REGATEO = {
  normal_acepta: [ '«Uff... venga, va, pero porque eres tú.»', '«Qué atraco... está bien, trato hecho.»' ],
  normal_rechaza: [ '«¿Perdona? Ni de coña, no llevo tanto.»', '«Tú flipas. O el precio de antes o nada.»' ],
  normal_sevá: [ 'Suelta un bufido, te hace una peineta y se larga.', '«Que te den. Me voy con otro.» Y se va.' ],
  poli: '«Sin problema, lo que pidas.» Acepta a la primera, sin pestañear siquiera. Qué generosidad tan rara.',
  yonki: '«¿MÁS? Tío, no llego, no llego... te lo juro, mira, es todo lo que tengo...»',
  moroso: '«Sí, sí, lo que digas, lo que digas.» Demasiadas ganas de cerrar el trato.',
  ladron: '«Que sí, pesao, que te lo pago. Tú saca el material ya.»',
  rival: '«¿Subes el precio, eh?» Sonríe y apunta algo mentalmente. «Interesante margen.»'
};

/* frases del proveedor por la mañana */
const FRASES_PROVEEDOR = [
  '«El material no se fía, ya lo sabes. Pasta por delante.»',
  '«¿Y mi dinero? Cada día que pasa me pongo más nervioso.»',
  '«Buen género hoy. No me lo malvendas a cualquier pringado.»',
  '«Si te trinca la pasma, tú no me conoces. Pero la deuda sigue viva.»',
  '«El precio sube, la vida sube, todo sube. No me mires así.»'
];

/* emoji que acompaña al rumor según el tipo del que avisa */
const EMOJI_RUMOR = {
  poli: '🚔',
  moroso: '💸',
  yonki: '💉',
  ladron: '🔪',
  rival: '🐍'
};

/* rumores de relleno (ambiente, no dan pistas) */
const RUMORES_RELLENO = [
  '🎡 Van a poner una feria en el descampado. Más gente, más ruido, más de todo.',
  '☀️ La del quiosco dice que este año el verano viene largo.',
  '📹 El Ayuntamiento quiere poner cámaras en el parque... llevan años diciéndolo.',
  '🍻 Dicen que el bar de Paco vuelve a abrir. Ya era hora.',
  '🎶 Ha vuelto el rumano del acordeón. Prepárate para oír «Despacito» ocho horas.'
];

/* resultado de las ventas, textos */
const TEXTOS = {
  ventaOk: [ 'Apretón de manos rápido, sobre al bolsillo. Un placer hacer negocios.', 'Cambio limpio y disimulado. Así da gusto.' ],
  rechazoNormal: [ 'Se va rebotado murmurando. Una venta menos.', '«Pues nada, ya buscaré en otro lado...» Se marcha.' ],
  rechazoMalo: [ 'Se aleja despacio. Algo te dice que has esquivado una buena.', 'Se marcha sin discutir demasiado. Sospechoso... o suerte.' ],
  pacienciaAgotada: [ 'Se cansa de tanto interrogatorio, resopla y se larga.', '«¿Pero tú vendes o das la brasa?» Se va sin comprar.' ]
};

/* finales */
const FINALES = {
  arrestado: {
    titulo: 'ARRESTADO',
    clase: 'rojo',
    texto: 'Tercera vez que le vendes a un policía. Esta vez no llegas ni a la fuente: dos de paisano te placan contra el césped. Se acabó el negocio, el banco y el parque. Tu proveedor, eso sí, te manda recuerdos... y la factura.'
  },
  arruinado: {
    titulo: 'ARRUINADO',
    clase: 'rojo',
    texto: 'No te queda ni para pagar la comida y el cuchitril donde duermes. El proveedor deja de coger tus llamadas, que en este negocio es lo peor que puede pasar. Abandonas el parque con los bolsillos vacíos.'
  },
  retirado: {
    titulo: 'RETIRADO CON ÉXITO',
    clase: 'verde',
    texto: 'Diez días, deuda saldada y los bolsillos llenos. Le entregas el último sobre al proveedor, le regalas el banco a las palomas y desapareces del barrio. Hay quien dice que ahora tienes un bar en la costa. Hay quien dice muchas cosas.'
  },
  pelado: {
    titulo: 'SUPERVIVIENTE... PELADO',
    clase: '',
    texto: 'Has sobrevivido a los diez días, que no es poco. Pero la deuda sigue viva, y el proveedor no olvida. Esta noche duermes tranquilo; mañana... mañana vuelves al banco. Esto no se acaba nunca.'
  }
};

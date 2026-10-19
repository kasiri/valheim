export const BOSSES = [
  { id: 'eikthyr', name: 'Eikthyr', biome: 'Praderas', icon: '⚡', description: 'El ciervo místico canalizador de las tormentas.', reward: 'Asta dura (Pico de asta)' },
  { id: 'el_sabio', name: 'El Sabio', biome: 'Bosque Negro', icon: '🌲', description: 'El gran anciano arbóreo de las sombras del bosque.', reward: 'Llave del pantano' },
  { id: 'bonemass', name: 'Masa de Huesos', biome: 'Pantano', icon: '☣️', description: 'Abominación tóxica nacida de la podredumbre.', reward: 'Deseador (Detector de vetas)' },
  { id: 'moder', name: 'Moder', biome: 'Montaña', icon: '❄️', description: 'La madre dragón de los picos nevados del norte.', reward: 'Lágrima de dragón (Mesa artesana)' },
  { id: 'yagluth', name: 'Yagluth', biome: 'Llanuras', icon: '🔥', description: 'El rey esqueleto destronado de las planicies.', reward: 'Cosa desgarrada (Extractores)' },
  { id: 'la_reina', name: 'La Reina', biome: 'Nieblas', icon: '👑', description: 'La soberana gigantesca del enjambre buscador.', reward: 'Malla del enjambre' },
  { id: 'fader', name: 'Fader', biome: 'Ashlands', icon: '🌋', description: 'El dragón abrasador resucitado de las cenizas.', reward: 'Reliquia de las cenizas' }
];

export const MODS = [
  { name: 'BetterSleepBruh', category: 'Calidad de vida' },
  { name: 'CraftFromContainers', category: 'Fabricación' },
  { name: 'ExpandWorldSize', category: 'Mundo' },
  { name: 'LongerDays', category: 'Mundo' },
  { name: 'ProtectiveWards', category: 'Construcción' },
  { name: 'QuickStackStore', category: 'Inventario' },
  { name: 'ServerDevcommands', category: 'Administración' },
  { name: 'UpgradeWorld', category: 'Administración del mundo' },
  { name: 'VentureValheim.Progression', category: 'Progresión' },
  { name: 'KasiheimPlayers', category: 'Estado web', serverOnly: true }
];

export const RULES = [
  { icon: '👥', title: 'Respeto y convivencia', text: 'No se permiten insultos, acoso, discriminación, toxicidad ni faltas de respeto. El comportamiento hostil hacia otros jugadores puede conllevar sanciones.' },
  { icon: '🔒', title: 'Propiedad y saqueo', text: 'Está prohibido robar objetos, recursos o pertenencias. No aproveches bases, trampas ni estructuras ajenas sin permiso; respeta el trabajo y el progreso de cada jugador.' },
  { icon: '🏚️', title: 'Estructuras y construcción', text: 'No destruyas construcciones ajenas ni bloquees accesos, comerciantes o zonas importantes. Evita construcciones y alteraciones innecesarias del terreno que puedan perjudicar el rendimiento.' },
  { icon: '💬', title: 'Comunicación', text: 'Usa el chat con educación. No hagas spam, publicidad no autorizada ni compartas enlaces sospechosos.' },
  { icon: '⚔️', title: 'PvE y dificultad', text: 'Kasiheim es un servidor PvE: no ataques a otros jugadores. La dificultad general es Normal; los portales permiten transportar materiales que normalmente no pueden cruzarlos.' },
  { icon: '🛡️', title: 'Mods y seguridad', text: 'Usa únicamente los mods autorizados para Kasiheim. No se permiten hacks, exploits, duplicación de objetos ni aprovechar bugs para obtener ventaja o perjudicar a alguien.' },
  { icon: '🆘', title: 'Soporte y objetivo', text: 'Si encuentras un problema, bug o caída, avisa directamente a Kasiri o a la administración. Queremos mantener una comunidad sana, divertida y respetuosa donde todos puedan disfrutar.' }
];

export const GALLERY = [];

export const FAQ_COMMANDS = [
  { cmd: 'playerlist', desc: 'Comando de administración de Server_devcommands. Entra al servidor, abre la consola con F5 y ejecútalo para ver los jugadores conectados. Requiere el mod en el cliente y permisos de administrador.' }
];

export const FAQ_ITEMS = [
  { question: '¿Cómo me conecto al servidor?', answer: 'Usa «Unirse a Kasiheim» en esta página o añade kasiriserver.servegame.com:2458 desde la opción de unirse por IP de Valheim.' },
  { question: '¿Qué dificultad tiene el mundo?', answer: 'La dificultad general es Normal. Los portales permiten transportar metales y otros materiales que normalmente no pueden cruzarlos.' },
  { question: '¿Es un servidor PvP?', answer: 'No. Kasiheim es PvE; no ataques a otros jugadores. Consulta las normas completas antes de empezar.' },
  { question: '¿Qué mods tengo que instalar?', answer: 'La lista muestra plugins detectados en el servidor y no significa que todos deban instalarse en el cliente. Sigue el perfil de r2modman o las instrucciones que publique la administración.' },
  { question: '¿Dónde veo quién está conectado?', answer: 'El estado y los nombres disponibles aparecen en la página «Servidor» y se actualizan automáticamente.' },
  { question: '¿Quién actualiza el progreso de jefes?', answer: 'El progreso por jugador y clan se muestra en «Jefes». La administración registra las derrotas.' },
  { question: '¿Dónde aviso de un problema?', answer: 'Contacta directamente con Kasiri o con la administración de la comunidad.' }
];

export const SOCIAL_LINKS = [
  { name: 'Twitch', url: 'https://www.twitch.tv/kasiri' },
  { name: 'YouTube', url: 'https://www.youtube.com/@kasiri93' },
  { name: 'TikTok', url: 'https://www.tiktok.com/@kasiri_93' },
  { name: 'X', url: 'https://www.twitter.com/kasiri93/' },
  { name: 'Instagram', url: 'https://www.instagram.com/kasiri93/' },
  { name: 'Steam', url: 'https://steamcommunity.com/id/kasiri93/' }
];

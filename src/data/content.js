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
  { name: 'BepInEx Pack Valheim', author: 'denikson', category: 'Core Required', desc: 'Framework esencial para la inyección de código y ejecución de mods en Valheim.', required: true },
  { name: 'Craft From Containers', author: 'aedenthorn', category: 'Calidad de Vida', desc: 'Permite construir, craftear y alimentar estructuras tomando recursos directamente de cofres cercanos.', required: false },
  { name: 'Quick Stack Store', author: 'GoldenJude', category: 'Inventario', desc: 'Guarda automáticamente materiales de tu inventario en cofres cercanos con un solo clic.', required: false },
  { name: 'Valheim Plus Updated', author: 'Grantapher', category: 'Ajustes del Servidor', desc: 'Mejora de rendimiento, modificadores de stamina y balance general del servidor.', required: true },
  { name: 'Equipment and Quick Slots', author: 'RandyKnapp', category: 'UI / Inventario', desc: 'Añade casillas dedicadas para armaduras, pociones y objetos de acceso rápido.', required: false }
];

export const RULES = [
  { title: '1. Respeto y Convivencia', text: 'Mantener un trato cordial en el chat global y en Discord. Prohibido el acoso, la discriminación o la toxicidad.' },
  { title: '2. Política de PvP y Combate', text: 'El PvP está desactivado en la Base Central. Para duelos o guerras acordadas entre clanes, ambos bandos deben encender la marca de PvP manualmente.' },
  { title: '3. Construcción y Modificación del Terreno', text: 'No aplanar áreas masivas sin necesidad para evitar lag en el servidor. Respeta una distancia mínima de 100m con las bases de otros jugadores a menos que haya permiso expreso.' },
  { title: '4. Cofres y Recursos compartidos', text: 'Los cofres marcados como "PÚBLICO" o "COMUNIDAD" son libres. No tomes recursos de bases privadas ajenas sin consentimiento.' },
  { title: '5. Uso de Mods y Trampas', text: 'Está prohibido el uso de cheats mediante consola local (`devcommands`), duplicación de objetos o mods de vuelo en el servidor público. Únicamente están permitidos los mods de la lista oficial.' }
];

export const GALLERY = [
  { title: 'Gran Salón del Clan Kasiheim', author: 'Kasiri_Jarl', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop', tag: 'Bases' },
  { title: 'Victoria contra la Masa de Huesos', author: 'Escuadrón Vikingo', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop', tag: 'Jefes' },
  { title: 'Expedición Nival en las Montañas', author: 'Valkyrie_Thor', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop', tag: 'Aventura' },
  { title: 'Puerto Drakkars de Valhalla', author: 'Lagertha_Build', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop', tag: 'Bases' }
];

export const FAQ_COMMANDS = [
  { cmd: '/s [mensaje]', desc: 'Envía un mensaje de texto normal visible para los jugadores cercanos.' },
  { cmd: '/shout [mensaje]', desc: 'Grita un mensaje que se muestra en pantalla a todos los jugadores del mapa.' },
  { cmd: '/w [mensaje]', desc: 'Susurra a los jugadores que estén pegados a ti.' },
  { cmd: '/resetmap', desc: 'Reinicia la exploración de tu mapa personal si se buguea.' }
];

export const R2MODMAN_CODE = '01a154f3-bd95-7467-882f-0154a0568cea';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, 
  Users, 
  Server, 
  Swords, 
  Copy, 
  Check, 
  ExternalLink, 
  Clock, 
  Wifi, 
  Zap, 
  Flame, 
  Download, 
  ScrollText, 
  Image as ImageIcon, 
  HelpCircle, 
  Terminal, 
  RefreshCw, 
  Crown, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Sliders, 
  Info,
  Sparkles,
  BookOpen,
  Lock,
  Unlock,
  Volume2,
  VolumeX,
  Maximize2
} from 'lucide-react';

// === CONFIGURATION CONSTANTS ===
const DEFAULT_SERVER_HOST = "kasiriserver.servegame.com";
const DEFAULT_SERVER_PORT = 2458;
const R2MODMAN_CODE = "01a154f3-bd95-7467-882f-0154a0568cea";

// === INITIAL BOSS DATA ===
const BOSSES_INITIAL = [
  { id: 'eikthyr', name: 'Eikthyr', biome: 'Praderas', icon: '⚡', defeated: true, date: '2026-09-12', description: 'El ciervo mistico canalizador de las tormentas.', reward: 'Asta dura (Pico de asta)' },
  { id: 'el_sabio', name: 'El Sabio', biome: 'Bosque Negro', icon: '🌲', defeated: true, date: '2026-09-20', description: 'El gran anciano arbóreo de las sombras del bosque.', reward: 'Llave del pantano' },
  { id: 'bonemass', name: 'Masa de Huesos', biome: 'Pantano', icon: '☣️', defeated: true, date: '2026-10-02', description: 'Abominación tóxica nacida de la podredumbre.', reward: 'Deseador (Detector de vetas)' },
  { id: 'moder', name: 'Moder', biome: 'Montaña', icon: '❄️', defeated: false, date: null, description: 'La madre dragón de los picos nevados del norte.', reward: 'Lágrima de dragón (Mesa artesana)' },
  { id: 'yagluth', name: 'Yagluth', biome: 'Llanuras', icon: '🔥', defeated: false, date: null, description: 'El rey esqueleto destronado de las planicies.', reward: 'Cosa desgarrada (Extractores)' },
  { id: 'la_reina', name: 'La Reina', biome: 'Nieblas', icon: '👑', defeated: false, date: null, description: 'La soberana gigantesca del enjambre buscador.', reward: 'Malla del enjambre' },
  { id: 'fader', name: 'Fader', biome: 'Ashlands', icon: '🌋', defeated: false, date: null, description: 'El dragón abrasador resucitado de las cenizas.', reward: 'Reliquia de las cenizas' }
];

// === INITIAL PLAYERS DEMO DATA ===
const PLAYERS_INITIAL = [
  { name: 'Kasiri_Jarl', role: 'Jarl (Admin)', level: 82, timeOnline: '2h 15m', ping: '18ms', avatar: '🛡️', biome: 'Montaña' },
  { name: 'Valkyrie_Thor', role: 'Hersir (Guerrero)', level: 65, timeOnline: '1h 04m', ping: '24ms', avatar: '🪓', biome: 'Bosque Negro' },
  { name: 'Ragnar_Nord', role: 'Hersir (Guerrero)', level: 49, timeOnline: '45m', ping: '32ms', avatar: '🏹', biome: 'Pantano' },
  { name: 'Lagertha_Build', role: 'Constructora', level: 91, timeOnline: '3h 50m', ping: '15ms', avatar: '🔨', biome: 'Base Principal' }
];

// === INITIAL MODS DATA ===
const MODS_INITIAL = [
  { name: 'BepInEx Pack Valheim', author: 'denikson', category: 'Core Required', desc: 'Framework esencial para la inyección de código y ejecución de mods en Valheim.', required: true, clientOnly: false },
  { name: 'Craft From Containers', author: 'aedenthorn', category: 'Calidad de Vida', desc: 'Permite construir, craftear y alimentar estructuras tomando recursos directamente de cofres cercanos.', required: false, clientOnly: true },
  { name: 'Quick Stack Store', author: 'GoldenJude', category: 'Inventario', desc: 'Guarda automáticamente materiales de tu inventario en cofres cercanos con un solo clic.', required: false, clientOnly: true },
  { name: 'Valheim Plus Updated', author: 'Grantapher', category: 'Ajustes del Servidor', desc: 'Mejora de rendimiento, modficiadores de stamina y balance general del servidor.', required: true, clientOnly: false },
  { name: 'Equipment and Quick Slots', author: 'RandyKnapp', category: 'UI / Inventario', desc: 'Añade casillas dedicadas para armaduras, pociones y objetos de acceso rápido.', required: false, clientOnly: true }
];

// === INITIAL RULES DATA ===
const RULES_DATA = [
  { title: '1. Respeto y Convivencia', text: 'Mantener un trato cordial en el chat global y en Discord. Prohibido el acoso, la discriminación o la toxicidad.' },
  { title: '2. Política de PvP y Combate', text: 'El PvP está desactivado en la Base Central. Para duelos o guerras acordadas entre clanes, ambos bandos deben encender la marca de PvP manualmente.' },
  { title: '3. Construcción y Modificación del Terreno', text: 'No aplanar áreas masivas sin necesidad para evitar lag en el servidor. Respeta una distancia mínima de 100m con las bases de otros jugadores a menos que haya permiso expreso.' },
  { title: '4. Cofres y Recursos compartidos', text: 'Los cofres marcados como "PÚBLICO" o "COMUNIDAD" son libres. No tomes recursos de bases privadas ajenas sin consentimiento.' },
  { title: '5. Uso de Mods y Trampas', text: 'Está prohibido el uso de cheats mediante consola local (`devcommands`), duplicación de objetos o mods de vuelo en el servidor público. Únicamente están permitidos los mods de la lista oficial.' }
];

// === COMMUNITY GALLERY DEMO IMAGES ===
const GALLERY_INITIAL = [
  { title: 'Gran Salón del Clan Kasiheim', author: 'Kasiri_Jarl', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop', tag: 'Bases' },
  { title: 'Victoria contra la Masa de Huesos', author: 'Escuadrón Vikingo', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop', tag: 'Jefes' },
  { title: 'Expedición Nival en las Montañas', author: 'Valkyrie_Thor', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop', tag: 'Aventura' },
  { title: 'Puerto Drakkars de Valhalla', author: 'Lagertha_Build', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop', tag: 'Bases' }
];

export default function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [copiedIp, setCopiedIp] = useState(false);
  const [copiedModCode, setCopiedModCode] = useState(false);
  
  // Server State Management
  const [isOnline, setIsOnline] = useState(true);
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [serverPing, setServerPing] = useState(22);
  const [serverVersion, setServerVersion] = useState("v0.218.15 (Bog Witch)");
  const [players, setPlayers] = useState(PLAYERS_INITIAL);
  const [bosses, setBosses] = useState(BOSSES_INITIAL);
  
  // Admin & Editing States
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Background Particles Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate minor ping fluctuation
      setServerPing(prev => Math.floor(Math.max(14, Math.min(45, prev + (Math.random() * 6 - 3)))));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Copy IP Helper
  const handleCopyIp = () => {
    navigator.clipboard.writeText(`${DEFAULT_SERVER_HOST}:${DEFAULT_SERVER_PORT}`);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2500);
  };

  // Copy Mod Code Helper
  const handleCopyModCode = () => {
    navigator.clipboard.writeText(R2MODMAN_CODE);
    setCopiedModCode(true);
    setTimeout(() => setCopiedModCode(false), 2500);
  };

  // Refresh server state simulation
  const handleRefreshServer = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  // Toggle Boss Status (Admin Mode or Interactive Demo)
  const toggleBossStatus = (bossId) => {
    setBosses(prev => prev.map(b => {
      if (b.id === bossId) {
        const nextState = !b.defeated;
        return {
          ...b,
          defeated: nextState,
          date: nextState ? new Date().toISOString().split('T')[0] : null
        };
      }
      return b;
    }));
  };

  // Calculate Boss Progress Percentage
  const defeatedCount = useMemo(() => bosses.filter(b => b.defeated).length, [bosses]);
  const progressPercent = useMemo(() => Math.round((defeatedCount / bosses.length) * 100), [defeatedCount, bosses.length]);

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-200 relative overflow-x-hidden">
      
      {/* Background Decorative Gradient & Sparks */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-[#0a0f1d]/80 to-[#05070d] z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-amber-600/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none z-0" />

      {/* Main Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 md:py-10 flex flex-col min-h-screen">
        
        {/* === HEADER / BRANDING === */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Servidor Oficial de Valheim
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 uppercase drop-shadow-[0_4px_12px_rgba(217,119,6,0.3)]">
            KASIHEIM
          </h1>
          <p className="text-slate-400 text-sm md:text-base mt-2 max-w-xl mx-auto font-medium">
            Tierra de Guerreros & Supervivencia Vikinga • Servidor Dedicado 24/7
          </p>
        </header>

        {/* === TOP QUICK BAR / SERVER CONNECT BANNER === */}
        <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-4 md:p-6 backdrop-blur-xl shadow-2xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            
            {/* Status & Connection Details */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 w-full lg:w-auto">
              {/* Online Badge */}
              <div className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border shadow-inner ${
                isOnline 
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 shadow-emerald-900/20' 
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-400 shadow-rose-900/20'
              }`}>
                <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
                <span>{isOnline ? 'Servidor En Línea' : 'Servidor Desconectado'}</span>
              </div>

              {/* Server IP Box */}
              <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-300 font-mono">
                <Server className="w-4 h-4 text-amber-400" />
                <span>{DEFAULT_SERVER_HOST}:{DEFAULT_SERVER_PORT}</span>
                <button 
                  onClick={handleCopyIp}
                  className="ml-2 text-slate-400 hover:text-amber-400 transition-colors p-1 rounded-md hover:bg-slate-800"
                  title="Copiar dirección IP"
                >
                  {copiedIp ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Ping & Version Indicator */}
              <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400 border-l border-slate-800 pl-4">
                <div className="flex items-center gap-1">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{serverPing} ms</span>
                </div>
                <div className="flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  <span>{serverVersion}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-3 w-full lg:w-auto justify-center">
              <button
                onClick={handleRefreshServer}
                className="p-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700/60 transition-all active:scale-95"
                title="Refrescar estado"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
              </button>

              <a 
                href={`steam://connect/${DEFAULT_SERVER_HOST}:${DEFAULT_SERVER_PORT}`}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg shadow-amber-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm uppercase tracking-wider"
              >
                <Swords className="w-4 h-4" />
                <span>Unirse a Kasiheim</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            </div>

          </div>
        </div>

        {/* === NAVIGATION TABS === */}
        <nav className="flex items-center gap-1 md:gap-2 border-b border-slate-800/80 mb-8 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Server },
            { id: 'rules', label: 'Normas', icon: ScrollText },
            { id: 'mods', label: 'Mods & Guía', icon: Download },
            { id: 'gallery', label: 'Galería', icon: ImageIcon },
            { id: 'faq', label: 'Comandos & FAQ', icon: HelpCircle }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-semibold text-xs md:text-sm tracking-wide transition-all whitespace-nowrap border-t border-x ${
                  isActive
                    ? 'bg-slate-900/90 border-amber-500/50 text-amber-400 shadow-md shadow-amber-950/20 border-b-2 border-b-amber-500'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* === MAIN CONTENT BODY === */}
        <main className="flex-1">

          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* TOP STATS CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Active Players Card */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group hover:border-amber-500/30 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jugadores Online</span>
                    <Users className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-100">{isOnline ? players.length : 0}</span>
                    <span className="text-sm text-slate-400 font-medium">/ {maxPlayers} slots</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${((isOnline ? players.length : 0) / maxPlayers) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Bosses Defeated Card */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group hover:border-amber-500/30 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progreso del Clan</span>
                    <Crown className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-100">{defeatedCount}</span>
                    <span className="text-sm text-slate-400 font-medium">/ {bosses.length} Jefes ({progressPercent}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Server World Info */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group hover:border-amber-500/30 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mundo Actual</span>
                    <Flame className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-amber-400">Kasiheim_World</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Día del Mundo: <span className="text-slate-200 font-semibold">Día 148</span> • Dificultad: Normal
                  </p>
                </div>

              </div>

              {/* MAIN CONTENT GRID: PLAYERS & BOSSES */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* ONLINE PLAYERS LIST (5 cols) */}
                <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-amber-400" />
                        <h2 className="font-bold text-lg text-slate-100 uppercase tracking-wide">Guerreros en Línea</h2>
                      </div>
                      <span className="text-xs bg-slate-800 text-slate-300 font-semibold px-2.5 py-1 rounded-md">
                        {isOnline ? players.length : 0} Activos
                      </span>
                    </div>

                    {!isOnline ? (
                      <div className="text-center py-10 text-slate-500 text-sm italic">
                        El servidor se encuentra desconectado temporalmente.
                      </div>
                    ) : players.length === 0 ? (
                      <div className="text-center py-10 text-slate-500 text-sm italic">
                        No hay guerreros conectados en este momento. ¡Sé el primero en entrar!
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {players.map((player, idx) => (
                          <div 
                            key={idx}
                            className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800/60 rounded-xl hover:border-slate-700 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-lg">
                                {player.avatar}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-slate-200">{player.name}</span>
                                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                                    Nvl {player.level}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                                  <span>{player.role}</span>
                                  <span>•</span>
                                  <span className="text-slate-500">{player.biome}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right text-xs">
                              <div className="text-emerald-400 flex items-center gap-1 justify-end font-mono">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                {player.ping}
                              </div>
                              <div className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {player.timeOnline}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Join Prompt Footer */}
                  <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
                    <p className="text-xs text-slate-400 mb-2">
                      ¿Quieres unirte a la batalla? Abre Valheim y añade el servidor a favoritos.
                    </p>
                  </div>
                </div>

                {/* BOSS PROGRESS TRACKER (7 cols) */}
                <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-amber-400" />
                      <h2 className="font-bold text-lg text-slate-100 uppercase tracking-wide">Progreso de Jefes (Valheim)</h2>
                    </div>
                    
                    {/* Admin/Interactive Toggle Button */}
                    <button
                      onClick={() => setIsAdminMode(!isAdminMode)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                        isAdminMode 
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300' 
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {isAdminMode ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      <span>{isAdminMode ? 'Modo Edición' : 'Modo Consulta'}</span>
                    </button>
                  </div>

                  {isAdminMode && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4 text-xs text-amber-300 flex items-center gap-2">
                      <Info className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>Haz clic en los jefes para cambiarlos de estado ("Derrotado" / "Pendiente") para actualizar la simulación.</span>
                    </div>
                  )}

                  {/* Bosses Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {bosses.map((boss) => (
                      <div 
                        key={boss.id}
                        onClick={() => isAdminMode && toggleBossStatus(boss.id)}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isAdminMode ? 'cursor-pointer hover:scale-[1.02]' : ''
                        } ${
                          boss.defeated 
                            ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm shadow-emerald-950/40' 
                            : 'bg-slate-950/50 border-slate-800/80 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{boss.icon}</span>
                            <div>
                              <h3 className="font-bold text-sm text-slate-100">{boss.name}</h3>
                              <span className="text-[11px] text-amber-400/90 font-medium">{boss.biome}</span>
                            </div>
                          </div>
                          
                          <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                            boss.defeated 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            {boss.defeated ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            <span>{boss.defeated ? 'Derrotado' : 'Pendiente'}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                          {boss.description}
                        </p>

                        <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                          <span>Recompensa: <strong className="text-slate-300 font-normal">{boss.reward}</strong></span>
                          {boss.date && <span className="text-emerald-400 font-mono">{boss.date}</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 2: RULES */}
          {activeTab === 'rules' && (
            <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-6 md:p-8 backdrop-blur-xl animate-fadeIn max-w-4xl mx-auto">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
                <ScrollText className="w-6 h-6 text-amber-400" />
                <div>
                  <h2 className="text-xl font-bold text-slate-100 uppercase tracking-wide">Código de Honor de Kasiheim</h2>
                  <p className="text-xs text-slate-400">Normas obligatorias para asegurar el juego limpio y la diversión de todos los miembros.</p>
                </div>
              </div>

              <div className="space-y-4">
                {RULES_DATA.map((rule, idx) => (
                  <div key={idx} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 hover:border-amber-500/30 transition-all">
                    <h3 className="font-bold text-base text-amber-400 mb-2">{rule.title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{rule.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center text-xs text-amber-300">
                <p>El incumplimiento reiterado de las normas dará lugar al expulsión (Kick) o baneo permanente del servidor.</p>
              </div>
            </div>
          )}

          {/* TAB 3: MODS & INSTALLATION */}
          {activeTab === 'mods' && (
            <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
              
              {/* Profile Code Box */}
              <div className="bg-slate-900/80 border border-amber-500/40 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                      <Sparkles className="w-4 h-4" /> Configuración Rápida r2modman
                    </div>
                    <h2 className="text-lg font-bold text-slate-100">Código de Perfil de Mods Oficial</h2>
                    <p className="text-xs text-slate-400 mt-1">Importa toda nuestra lista de mods optimizada con un solo clic.</p>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2 w-full sm:w-auto">
                    <code className="text-xs font-mono text-amber-300 px-2">{R2MODMAN_CODE}</code>
                    <button
                      onClick={handleCopyModCode}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5"
                    >
                      {copiedModCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedModCode ? '¡Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* MODS LIST */}
              <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                  <Download className="w-5 h-5 text-amber-400" /> Mods Recomendados y Obligatorios
                </h3>

                <div className="space-y-3">
                  {MODS_INITIAL.map((mod, idx) => (
                    <div key={idx} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-200 text-sm">{mod.name}</h4>
                          <span className="text-[10px] text-slate-500 font-mono">por {mod.author}</span>
                          {mod.required ? (
                            <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-bold uppercase">
                              Requerido
                            </span>
                          ) : (
                            <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded font-bold uppercase">
                              Opcional / Client
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{mod.desc}</p>
                      </div>

                      <div className="text-xs text-amber-400 font-semibold shrink-0">
                        {mod.category}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* INSTALLATION STEPS */}
              <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-400" /> Guía Paso a Paso para r2modman
                </h3>

                <ol className="space-y-4 text-sm text-slate-300">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-500/30">1</span>
                    <div>
                      <strong>Descarga e instala r2modman:</strong> Abre la aplicación y selecciona <em>Valheim</em> como tu juego objetivo.
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-500/30">2</span>
                    <div>
                      <strong>Importar perfil:</strong> Haz clic en <em>Import profile</em> ➔ <em>From code</em> y pega nuestro código suministrado arriba.
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-500/30">3</span>
                    <div>
                      <strong>Inicia el juego:</strong> Haz clic en el botón azul de arriba a la izquierda <strong>"Start Modded"</strong> dentro de r2modman para entrar con los mods cargados.
                    </div>
                  </li>
                </ol>
              </div>

            </div>
          )}

          {/* TAB 4: GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-100 uppercase tracking-wide">Capturas de la Comunidad</h2>
                  <p className="text-xs text-slate-400">Grandes construcciones y expediciones épicas en Kasiheim.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {GALLERY_INITIAL.map((img, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className="group relative h-64 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 cursor-pointer"
                  >
                    <img 
                      src={img.url} 
                      alt={img.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded">
                        {img.tag}
                      </span>
                      <h3 className="text-base font-bold text-slate-100 mt-2">{img.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Captura por: {img.author}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Lightbox Modal */}
              {selectedImage && (
                <div 
                  className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
                  onClick={() => setSelectedImage(null)}
                >
                  <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                    <img src={selectedImage.url} alt={selectedImage.title} className="w-full max-h-[70vh] object-cover" />
                    <div className="p-6 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-100">{selectedImage.title}</h3>
                        <p className="text-xs text-slate-400">Por {selectedImage.author}</p>
                      </div>
                      <button 
                        onClick={() => setSelectedImage(null)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 py-2 rounded-xl transition-colors"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: FAQ & COMMANDS */}
          {activeTab === 'faq' && (
            <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
              
              {/* Useful Commands */}
              <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-amber-400" /> Comandos Útiles de Valheim
                </h3>

                <div className="space-y-3 font-mono text-xs">
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-amber-400 font-bold">ping</span>
                      <p className="text-slate-400 font-sans text-xs mt-0.5">Muestra tu latencia exacta en milisegundos con el servidor.</p>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-amber-400 font-bold">lodbias [1-5]</span>
                      <p className="text-slate-400 font-sans text-xs mt-0.5">Ajusta la distancia de dibujado de estructuras en la base para mejorar FPS.</p>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-amber-400 font-bold">dpsdebug</span>
                      <p className="text-slate-400 font-sans text-xs mt-0.5">Activa la ventana de pruebas de daño por segundo para ajustar armas.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Accordion */}
              <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-400" /> Preguntas Frecuentes
                </h3>

                <div className="space-y-4 text-sm">
                  <div className="border-b border-slate-800 pb-3">
                    <h4 className="font-bold text-slate-200">¿Cómo activo la consola en Valheim?</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      En Steam, haz clic derecho en Valheim ➔ Propiedades ➔ Opciones de lanzamiento y escribe: <code className="text-amber-300 font-mono">-console</code>. Luego presiona <kbd className="bg-slate-800 px-1 rounded text-amber-400">F5</kbd> en el juego.
                    </p>
                  </div>

                  <div className="border-b border-slate-800 pb-3">
                    <h4 className="font-bold text-slate-200">¿Se guardan mis datos si el servidor se reinicia?</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Sí. El servidor ejecuta guardados automáticos del mundo cada 20 minutos y copias de seguridad continuas gestionadas por AMP.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-200">¿Puedo traer a mis amigos al servidor?</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      ¡Por supuesto! El servidor es público para nuestro clan y amigos. Comparte la dirección IP o pásales el botón de unión de Steam.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </main>

        {/* === FOOTER === */}
        <footer className="mt-12 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-500" />
            <span>Kasiheim Server Dashboard © 2026</span>
          </div>
          <p>Potenciado por AMP Cubecoders & Valheim Dedicated Server</p>
        </footer>

      </div>
    </div>
  );
}
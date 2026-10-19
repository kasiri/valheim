import { useCallback, useEffect, useState } from 'react';
import {
  Crown,
  Download,
  HelpCircle,
  Image as ImageIcon,
  ScrollText,
  Server,
  Sparkles
} from 'lucide-react';
import ServerStatusBanner from './components/ServerStatusBanner';
import DashboardPage from './pages/DashboardPage';
import BossProgressPage from './pages/BossProgressPage';
import RulesPage from './pages/RulesPage';
import ModsPage from './pages/ModsPage';
import GalleryPage from './pages/GalleryPage';
import FaqPage from './pages/FaqPage';
import { api } from './lib/api';

const SERVER_HOST = 'kasiriserver.servegame.com';
const SERVER_PORT = 2458;

const PAGES = [
  { id: 'dashboard', label: 'Servidor', icon: Server },
  { id: 'bosses', label: 'Jefes', icon: Crown },
  { id: 'rules', label: 'Normas', icon: ScrollText },
  { id: 'mods', label: 'Mods y guía', icon: Download },
  { id: 'gallery', label: 'Galería', icon: ImageIcon },
  { id: 'faq', label: 'Comandos y FAQ', icon: HelpCircle }
];

function normalizePlayers(rawPlayers) {
  if (!Array.isArray(rawPlayers)) return null;
  return rawPlayers.flatMap((player) => {
    if (typeof player === 'string' && player.trim()) return [{ name: player.trim() }];
    if (player && typeof player === 'object') {
      const name = player.name || player.player || player.username;
      if (typeof name === 'string' && name.trim()) return [{ name: name.trim() }];
    }
    return [];
  });
}

function normalizeStatus(data) {
  if (!data || typeof data !== 'object' || typeof data.online !== 'boolean') {
    throw new Error('La API devolvió un estado no válido.');
  }
  const playerCount = Number.isFinite(data.player_count) ? data.player_count : null;
  const players = normalizePlayers(data.players);
  return {
    online: data.online,
    process_running: data.process_running === true,
    player_count: playerCount,
    max_players: Number.isFinite(data.max_players) ? data.max_players : null,
    players: playerCount > 0 && players?.length === 0 ? null : players,
    ping_ms: Number.isFinite(data.ping_ms) ? data.ping_ms : null,
    version: typeof data.version === 'string' ? data.version : null,
    world: typeof data.world === 'string' ? data.world : null,
    server_name: typeof data.server_name === 'string' ? data.server_name : null,
    updated_at: typeof data.updated_at === 'string' ? data.updated_at : null
  };
}

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [status, setStatus] = useState(null);
  const [statusError, setStatusError] = useState('');
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [adminToken, setAdminToken] = useState(null);

  const refreshStatus = useCallback(async () => {
    try {
      const data = await api.getStatus();
      setStatus(normalizeStatus(data));
      setStatusError('');
    } catch (error) {
      console.warn('No se pudo sincronizar el estado del servidor.', error);
      setStatus(null);
      setStatusError(error.message);
    } finally {
      setIsLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const updateStatus = async () => {
      try {
        const nextStatus = normalizeStatus(await api.getStatus());
        if (cancelled) return;
        setStatus(nextStatus);
        setStatusError('');
      } catch (error) {
        if (cancelled) return;
        console.warn('No se pudo sincronizar el estado del servidor.', error);
        setStatus(null);
        setStatusError(error.message);
      } finally {
        if (!cancelled) setIsLoadingStatus(false);
      }
    };

    void updateStatus();
    const interval = window.setInterval(() => void updateStatus(), 10000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshStatus();
    setIsRefreshing(false);
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(`${SERVER_HOST}:${SERVER_PORT}`);
      setCopiedAddress(true);
      window.setTimeout(() => setCopiedAddress(false), 2000);
    } catch (error) {
      console.warn('No se pudo copiar la dirección del servidor.', error);
    }
  };

  const handleLogout = () => setAdminToken(null);

  let page;
  switch (activePage) {
    case 'bosses':
      page = <BossProgressPage token={adminToken} onLogin={setAdminToken} onLogout={handleLogout} />;
      break;
    case 'rules':
      page = <RulesPage />;
      break;
    case 'mods':
      page = <ModsPage />;
      break;
    case 'gallery':
      page = <GalleryPage />;
      break;
    case 'faq':
      page = <FaqPage />;
      break;
    default:
      page = <DashboardPage status={status} statusError={statusError} isLoading={isLoadingStatus} />;
  }

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-200 relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-[#0a0f1d]/80 to-[#05070d] z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-amber-600/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none z-0" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 md:py-10 flex flex-col min-h-screen">
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" /> Servidor oficial de Valheim
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 uppercase drop-shadow-[0_4px_12px_rgba(217,119,6,0.3)]">
            KASIHEIM
          </h1>
          <p className="text-slate-400 text-sm md:text-base mt-2 max-w-xl mx-auto font-medium">
            Tierra de guerreros y supervivencia vikinga
          </p>
        </header>

        <ServerStatusBanner
          status={status}
          error={statusError}
          isRefreshing={isRefreshing}
          onRefresh={() => void handleRefresh()}
          copied={copiedAddress}
          onCopy={() => void handleCopyAddress()}
        />

        <nav aria-label="Secciones de Kasiheim" className="flex items-center gap-1 md:gap-2 border-b border-slate-800/80 mb-8 overflow-x-auto pb-1">
          {PAGES.map(({ id, label, icon: Icon }) => {
            const isActive = activePage === id;
            return (
              <button
                key={id}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setActivePage(id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-semibold text-xs md:text-sm tracking-wide transition-all whitespace-nowrap border-t border-x ${
                  isActive
                    ? 'bg-slate-900/90 border-amber-500/50 text-amber-400 shadow-md shadow-amber-950/20 border-b-2 border-b-amber-500'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <main className="flex-1">{page}</main>

        <footer className="mt-16 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-500">
          <p>Kasiheim Valheim Dedicated Server · Gestionado mediante AMP</p>
        </footer>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { Check, Crown, Lock, LogOut, Plus, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { BOSSES } from '../data/content';

const inputClass = 'w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500';
const buttonClass = 'inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition-colors';

function BossMark({ boss, defeatedAt, editable, onChange, disabled }) {
  const defeated = Boolean(defeatedAt);
  return (
    <label className={`flex items-start gap-2.5 rounded-lg border p-3 ${
      defeated ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-slate-950/60 border-slate-800'
    } ${editable ? 'cursor-pointer' : ''}`}>
      <input
        type="checkbox"
        checked={defeated}
        disabled={!editable || disabled}
        onChange={(event) => onChange(boss.id, event.target.checked)}
        className="mt-1 accent-amber-500 disabled:cursor-not-allowed"
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-100">
          <span aria-hidden="true">{boss.icon}</span>
          {boss.name}
        </span>
        <span className="block text-[11px] text-slate-400 mt-0.5">
          {defeated ? `Derrotado${defeatedAt ? ` · ${defeatedAt}` : ''}` : 'Pendiente'}
        </span>
      </span>
    </label>
  );
}

export default function BossProgressPage({ token, onLogin, onLogout }) {
  const [progress, setProgress] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [participantType, setParticipantType] = useState('player');

  const refreshProgress = useCallback(async () => {
    try {
      const data = await api.getProgress();
      setProgress(Array.isArray(data.participants) ? data.participants : []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadProgress = async () => {
      try {
        const data = await api.getProgress();
        if (!cancelled) setProgress(Array.isArray(data.participants) ? data.participants : []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadProgress();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      const result = await api.login(username, password);
      onLogin(result.access_token);
      setPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddParticipant = async (event) => {
    event.preventDefault();
    if (!participantName.trim()) return;
    setIsSaving(true);
    setError('');
    try {
      await api.addParticipant(token, participantName.trim(), participantType);
      setParticipantName('');
      await refreshProgress();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBossChange = async (participantId, bossId, defeated) => {
    setIsSaving(true);
    setError('');
    try {
      await api.setBossDefeated(token, participantId, bossId, defeated);
      await refreshProgress();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveParticipant = async (participant) => {
    if (!window.confirm(`¿Eliminar a ${participant.name} y todo su progreso?`)) return;
    setIsSaving(true);
    setError('');
    try {
      await api.removeParticipant(token, participant.id);
      await refreshProgress();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    setError('');
    try {
      await api.logout(token);
    } catch (err) {
      setError(err.message);
    } finally {
      onLogout();
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <Crown className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Progreso por jugador y clan</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Jefes de Valheim</h2>
          <p className="text-sm text-slate-400 mt-1">Cada jugador y cada clan mantiene su propio progreso.</p>
        </div>
        {token ? (
          <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3 py-2 rounded-lg text-sm">
            <LogOut className="w-4 h-4" /> Cerrar sesión admin
          </button>
        ) : (
          <a href="#admin-login" className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3 py-2 rounded-lg text-sm">
            <Lock className="w-4 h-4" /> Acceso admin
          </a>
        )}
      </header>

      {error && <div role="alert" className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3 text-sm text-rose-200">{error}</div>}

      {token && (
        <form onSubmit={handleAddParticipant} className="grid grid-cols-1 sm:grid-cols-[1fr_180px_auto] gap-3 bg-slate-900/70 border border-amber-500/20 rounded-2xl p-4">
          <label className="sr-only" htmlFor="participant-name">Nombre del jugador o clan</label>
          <input id="participant-name" value={participantName} onChange={(event) => setParticipantName(event.target.value)} maxLength={64} required placeholder="Nombre del jugador o clan" className={inputClass} />
          <label className="sr-only" htmlFor="participant-type">Tipo de registro</label>
          <select id="participant-type" value={participantType} onChange={(event) => setParticipantType(event.target.value)} className={inputClass}>
            <option value="player">Jugador</option>
            <option value="clan">Clan</option>
          </select>
          <button type="submit" disabled={isSaving} className={buttonClass}><Plus className="w-4 h-4" /> Añadir</button>
        </form>
      )}

      {isLoading ? (
        <p className="py-12 text-center text-sm text-slate-400">Cargando progreso…</p>
      ) : progress.length === 0 ? (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-8 text-center">
          <p className="text-slate-300">Todavía no hay jugadores o clanes registrados.</p>
          {!token && <p className="text-xs text-slate-500 mt-2">El administrador puede añadirlos después de iniciar sesión.</p>}
        </div>
      ) : (
        <div className="space-y-5">
          {progress.map((participant) => {
            const defeatedByBoss = new Map(participant.bosses.map((entry) => [entry.boss_id, entry.defeated_at]));
            const defeatedCount = defeatedByBoss.size;
            return (
              <section key={participant.id} className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">{participant.type === 'clan' ? 'Clan' : 'Jugador'}</span>
                    <h3 className="text-lg font-bold text-slate-100">{participant.name}</h3>
                    <p className="text-xs text-slate-400">{defeatedCount} de {BOSSES.length} jefes derrotados</p>
                  </div>
                  {token && (
                    <button type="button" onClick={() => void handleRemoveParticipant(participant)} disabled={isSaving} aria-label={`Eliminar ${participant.name}`} className="p-2 text-slate-400 hover:text-rose-400 disabled:opacity-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                  {BOSSES.map((boss) => (
                    <BossMark
                      key={boss.id}
                      boss={boss}
                      defeatedAt={defeatedByBoss.get(boss.id)}
                      editable={Boolean(token)}
                      disabled={isSaving}
                      onChange={(bossId, defeated) => void handleBossChange(participant.id, bossId, defeated)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {!token && (
        <section id="admin-login" className="max-w-md mx-auto bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
          <h3 className="font-bold text-slate-100 flex items-center gap-2 mb-4"><Lock className="w-4 h-4 text-amber-400" /> Acceso de administrador</h3>
          <form onSubmit={handleLogin} className="space-y-3">
            <label className="block text-xs text-slate-400" htmlFor="admin-username">Usuario</label>
            <input id="admin-username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required className={inputClass} />
            <label className="block text-xs text-slate-400" htmlFor="admin-password">Contraseña</label>
            <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required className={inputClass} />
            <button type="submit" disabled={isSaving} className={`${buttonClass} w-full`}><Check className="w-4 h-4" /> Entrar</button>
          </form>
        </section>
      )}
    </div>
  );
}

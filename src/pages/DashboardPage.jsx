import { Clock3, Flame, Gauge, Server, Users } from 'lucide-react';

function MetricCard({ icon: Icon, label, value, detail }) {
  return (
    <section className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        <Icon className="w-5 h-5 text-amber-400" />
      </div>
      <p className="text-2xl font-extrabold text-slate-100 break-words">{value}</p>
      {detail && <p className="text-xs text-slate-400 mt-2">{detail}</p>}
    </section>
  );
}

export default function DashboardPage({ status, statusError, isLoading }) {
  const isOnline = status?.online === true;
  const playerCount = status?.online === false && !status.process_running ? 0 : status?.player_count;
  const players = status?.players;

  return (
    <div className="space-y-8 animate-fadeIn">
      {statusError && (
        <div role="alert" className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-4 text-sm text-rose-200">
          No se pudo consultar el estado en vivo: {statusError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          icon={Gauge}
          label="Ping desde el VPS"
          value={Number.isFinite(status?.ping_ms) ? `${Math.round(status.ping_ms)} ms` : '—'}
          detail={isOnline ? 'RTT de consulta A2S; no es el ping individual de cada jugador' : 'Sin respuesta del servidor'}
        />
        <MetricCard
          icon={Server}
          label="Versión"
          value={status?.version || 'No disponible'}
          detail="Versión informada por el servidor"
        />
        <MetricCard
          icon={Flame}
          label="Mundo"
          value={status?.world || 'No disponible'}
          detail={status?.server_name || 'Kasiheim'}
        />
        <MetricCard
          icon={Users}
          label="Jugadores online"
          value={Number.isFinite(playerCount) ? `${playerCount} / ${status?.max_players ?? '—'}` : '—'}
          detail={isLoading ? 'Actualizando estado…' : 'Jugadores reportados por el servidor'}
        />
      </div>

      <section className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
          <div>
            <h2 className="font-bold text-lg text-slate-100 uppercase tracking-wide">Jugadores conectados</h2>
            <p className="text-xs text-slate-400 mt-1">Nombres obtenidos de la consulta del servidor.</p>
          </div>
          {status?.updated_at && (
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock3 className="w-3.5 h-3.5" />
              Actualizado {new Date(status.updated_at).toLocaleTimeString()}
            </span>
          )}
        </div>

        {isLoading && !status ? (
          <p className="py-8 text-center text-sm text-slate-400">Consultando servidor…</p>
        ) : status?.online === false ? (
          <p className="py-8 text-center text-sm text-slate-400">
            {status.process_running ? 'El proceso está activo, pero no responde a la consulta del servidor.' : 'El servidor está desconectado.'}
          </p>
        ) : !status ? (
          <p className="py-8 text-center text-sm text-slate-400">Estado del servidor no disponible.</p>
        ) : !Array.isArray(players) ? (
          <p className="py-8 text-center text-sm text-slate-400">La API no puede obtener los nombres de los jugadores.</p>
        ) : players.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No hay jugadores conectados.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {players.map((player, index) => (
              <li key={`${player.name}-${index}`} className="flex items-center gap-3 p-3 bg-slate-950/60 border border-slate-800/60 rounded-xl">
                <span className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-lg" aria-hidden="true">
                  {index === 0 ? '🛡️' : '🪓'}
                </span>
                <span className="font-bold text-sm text-slate-200">{player.name}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

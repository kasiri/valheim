import { Check, Copy, ExternalLink, RefreshCw, Server, Swords } from 'lucide-react';

export default function ServerStatusBanner({ status, error, isRefreshing, onRefresh, copied, onCopy }) {
  const isOnline = status?.online === true;
  const isOffline = status?.online === false;
  const label = error
    ? 'Sin sincronización'
    : isOnline
      ? 'Servidor en línea'
      : isOffline
        ? status.process_running
          ? 'Servidor sin respuesta'
          : 'Servidor desconectado'
        : 'Consultando estado…';

  return (
    <section className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-4 md:p-6 backdrop-blur-xl shadow-2xl mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="relative flex flex-col lg:flex-row items-center justify-between gap-5">
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
          <div className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border ${
            isOnline
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
              : isOffline
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-400'
                : 'bg-slate-800/60 border-slate-600/40 text-slate-300'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : isOffline ? 'bg-rose-500' : 'bg-slate-400'}`} />
            <span>{label}</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-300 font-mono">
            <Server className="w-4 h-4 text-amber-400" />
            <span>{status?.server_host || 'kasiriserver.servegame.com'}:{status?.server_port || 2458}</span>
            <button type="button" onClick={onCopy} aria-label="Copiar dirección del servidor" className="ml-1 text-slate-400 hover:text-amber-400 p-1 rounded-md hover:bg-slate-800">
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button type="button" onClick={onRefresh} aria-label="Actualizar estado" className="p-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700/60 transition-all">
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>
          <a
            href={`steam://connect/${status?.server_host || 'kasiriserver.servegame.com'}:${status?.server_port || 2458}`}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-lg shadow-amber-600/25 transition-all text-xs uppercase tracking-wider"
          >
            <Swords className="w-4 h-4" />
            <span>Unirse a Kasiheim</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>
      </div>
    </section>
  );
}

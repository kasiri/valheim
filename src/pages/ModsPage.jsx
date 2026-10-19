import { AlertCircle, Server } from 'lucide-react';
import { MODS } from '../data/content';

export default function ModsPage() {
  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      <section className="bg-slate-900/70 border border-amber-500/30 rounded-2xl p-5 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h2 className="font-bold text-slate-100">Lista del servidor; no es todavía el pack del cliente</h2>
          <p className="text-sm text-slate-300 mt-1">
            Estos plugins se detectaron instalados en la instancia de Kasiheim. Algunos mods necesitan estar también en el cliente y otros son solo de servidor; no instales toda la lista a ciegas. La administración publicará el perfil de r2modman cuando esté verificado.
          </p>
        </div>
      </section>

      <section className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-xl">
        <h3 className="text-lg font-bold text-slate-100 mb-1 flex items-center gap-2">
          <Server className="w-5 h-5 text-amber-400" /> Plugins detectados en Kasiheim
        </h3>
        <p className="text-xs text-slate-400 mb-4">La lista refleja los archivos del servidor; las dependencias técnicas no se muestran como mods de juego.</p>
        <div className="space-y-3">
          {MODS.map((mod) => (
            <article key={mod.name} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-bold text-slate-200 text-sm">{mod.name}</h4>
                  {mod.serverOnly && <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded font-bold uppercase">Solo servidor</span>}
                </div>
              </div>
              <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg self-start sm:self-center font-medium">{mod.category}</span>
            </article>
          ))}
        </div>
        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-400">
          BepInEx, Jotunn y YamlDotNet son parte del framework o dependencias detectadas; no los añadas manualmente al perfil salvo que lo indique la administración.
        </div>
      </section>
    </div>
  );
}

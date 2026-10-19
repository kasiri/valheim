import { useState } from 'react';
import { Check, Copy, Download, Sparkles } from 'lucide-react';
import { MODS, R2MODMAN_CODE } from '../data/content';

export default function ModsPage() {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(R2MODMAN_CODE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch (error) {
      console.warn('No se pudo copiar el código de r2modman.', error);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      <section className="bg-slate-900/80 border border-amber-500/40 rounded-2xl p-6 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" /> Configuración rápida r2modman
            </div>
            <h2 className="text-lg font-bold text-slate-100">Código de perfil oficial</h2>
            <p className="text-xs text-slate-400 mt-1">Importa la configuración del servidor desde r2modman.</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2 w-full sm:w-auto">
            <code className="text-xs font-mono text-amber-300 px-2">{R2MODMAN_CODE}</code>
            <button type="button" onClick={() => void copyCode()} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>
      </section>

      <section className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-xl">
        <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-amber-400" /> Mods recomendados y obligatorios
        </h3>
        <div className="space-y-3">
          {MODS.map((mod) => (
            <article key={mod.name} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-bold text-slate-200 text-sm">{mod.name}</h4>
                  <span className="text-[10px] text-slate-500 font-mono">por {mod.author}</span>
                  {mod.required && <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-bold uppercase">Requerido</span>}
                </div>
                <p className="text-xs text-slate-400 mt-1">{mod.desc}</p>
              </div>
              <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg self-start sm:self-center font-medium">{mod.category}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

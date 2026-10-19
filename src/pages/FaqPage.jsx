import { HelpCircle } from 'lucide-react';
import { FAQ_COMMANDS, FAQ_ITEMS } from '../data/content';

export default function FaqPage() {
  return (
    <section className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-6 md:p-8 backdrop-blur-xl">
        <h2 className="text-xl font-bold text-slate-100 uppercase tracking-wide mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-400" /> Preguntas frecuentes
        </h2>
        <div className="divide-y divide-slate-800">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="group py-4 first:pt-0 last:pb-0">
              <summary className="cursor-pointer list-none font-semibold text-sm text-slate-100 flex items-center justify-between gap-4">
                {item.question}
                <span className="text-amber-400 transition-transform group-open:rotate-180" aria-hidden="true">⌄</span>
              </summary>
              <p className="mt-3 pr-6 text-sm text-slate-400 leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>

      <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-6 md:p-8 backdrop-blur-xl">
        <h2 className="text-xl font-bold text-slate-100 uppercase tracking-wide mb-2">Comandos de administración</h2>
        <p className="text-sm text-slate-400 mb-5">No son comandos de chat para todos los jugadores.</p>
        <div className="space-y-3">
          {FAQ_COMMANDS.map((item) => (
            <div key={item.cmd} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <code className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md w-fit">{item.cmd}</code>
              <span className="text-xs text-slate-300">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

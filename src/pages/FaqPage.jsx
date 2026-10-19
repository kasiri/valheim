import { HelpCircle } from 'lucide-react';
import { FAQ_COMMANDS } from '../data/content';

export default function FaqPage() {
  return (
    <section className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-6 md:p-8 backdrop-blur-xl">
        <h2 className="text-xl font-bold text-slate-100 uppercase tracking-wide mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-400" /> Comandos de chat útiles
        </h2>
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

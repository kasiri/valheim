import { ScrollText } from 'lucide-react';
import { RULES } from '../data/content';

export default function RulesPage() {
  return (
    <section className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-6 md:p-8 backdrop-blur-xl animate-fadeIn max-w-4xl mx-auto">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
        <ScrollText className="w-6 h-6 text-amber-400" />
        <div>
          <h2 className="text-xl font-bold text-slate-100 uppercase tracking-wide">Código de Honor de Kasiheim</h2>
          <p className="text-xs text-slate-400">Normas para asegurar el juego limpio y la diversión.</p>
        </div>
      </div>
      <div className="space-y-4">
        {RULES.map((rule) => (
          <article key={rule.title} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 hover:border-amber-500/30 transition-all">
            <h3 className="font-bold text-base text-amber-400 mb-2">{rule.title}</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{rule.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

import { GALLERY } from '../data/content';

export default function GalleryPage() {
  return (
    <section className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      <header className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-slate-100 uppercase tracking-wide">Galería de Kasiheim</h2>
        <p className="text-xs text-slate-400 mt-1">Capturas de construcciones y aventuras del servidor.</p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {GALLERY.map((image) => (
          <article key={image.title} className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="aspect-video w-full overflow-hidden bg-slate-950">
              <img src={image.url} alt={image.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
            </div>
            <div className="p-4 bg-slate-900/90 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-100">{image.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Por <span className="text-amber-400">{image.author}</span></p>
              </div>
              <span className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2 py-1 rounded-md font-semibold">{image.tag}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

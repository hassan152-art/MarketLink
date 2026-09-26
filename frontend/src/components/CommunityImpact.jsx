const STATS = [
  { value: 1240, suffix: '+', label: 'Fresh orders picked up' },
  { value: 86, suffix: '', label: 'Local farmers onboarded' },
  { value: 32, suffix: '', label: 'Partner markets nationwide' },
  { value: 4.8, suffix: '/5', label: 'Average farmer rating' },
];

const TESTIMONIALS = [
  {
    name: 'Amara Reyes',
    role: 'Customer, since 2025',
    quote: 'I plan my whole weekend around picking up produce through MarketLink — everything is greener, cheaper, and it goes straight from the farmer\'s hands to mine.',
  },
  {
    name: 'Farmer Iqbal Hussain',
    role: 'Hussain Family Orchards',
    quote: 'The dashboard tells me exactly what to pick before market day. Waste is down and I finally have a real sense of demand week to week.',
  },
  {
    name: 'Priya Nair',
    role: 'Customer, since 2024',
    quote: 'The waste-impact tracker is what keeps me coming back — I can actually see how many kilograms of food my orders have saved.',
  },
];

export function CommunityImpact() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">Growing Together</span>
        <h2 className="text-3xl font-extrabold font-serif text-slate-900">Our Community's Impact</h2>
        <p className="text-sm text-slate-500 max-w-2xl mx-auto">
          Every order routed through MarketLink puts money back into local farms and produce back into local kitchens.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="glass-panel text-center p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm"
          >
            <p className="text-3xl md:text-4xl font-extrabold text-brand-700">
              <span data-counter={stat.value}>0</span>
              <span>{stat.suffix}</span>
            </p>
            <p className="mt-2 text-xs text-slate-500 leading-snug">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {TESTIMONIALS.map((t) => (
          <div
            key={t.name}
            className="card-hover p-7 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between"
          >
            <p className="text-sm text-slate-600 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <p className="font-bold text-slate-900 text-sm">{t.name}</p>
              <p className="text-xs text-slate-500">{t.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

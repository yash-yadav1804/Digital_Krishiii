import { MapPin, TreePine, Droplets, Ruler, ArrowUpRight } from 'lucide-react'

export default function LandCard({ land }) {
  return (
    <article className="card card-interactive group overflow-hidden p-0 h-full">
      {land.image_url ? (
        <div className="relative">
          <img src={land.image_url} alt={land.land_name} className="media-card-image !mb-0" />
          <span className="absolute top-3 left-3 badge badge-success bg-white/90 backdrop-blur-sm">Active</span>
        </div>
      ) : (
        <div className="h-20 bg-gradient-to-br from-emerald-50 to-green-100" />
      )}
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center shrink-0"><TreePine className="w-5 h-5" /></div>
          <div className="min-w-0 flex-1">
            <h3 className="font-extrabold text-[17px] text-slate-900 truncate group-hover:text-emerald-700 transition-colors">{land.land_name}</h3>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1 min-w-0"><MapPin className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{land.village}, {land.district}</span></p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors shrink-0" />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Area</p><p className="mt-1 font-bold text-slate-900">{land.area_acres} acres</p></div>
          <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Soil</p><p className="mt-1 font-bold text-slate-900 truncate">{land.soil_type || '—'}</p></div>
        </div>

        <div className="flex items-center justify-between gap-3 mt-3 pt-4 border-t border-slate-100 text-sm">
          <span className="inline-flex items-center gap-1.5 text-slate-500 min-w-0"><Droplets className="w-4 h-4 text-emerald-600 shrink-0" /><span className="truncate">{land.irrigation_type || 'Irrigation not set'}</span></span>
          <span className="text-emerald-700 font-bold inline-flex items-center gap-1 shrink-0"><Ruler className="w-3.5 h-3.5" /> Farm</span>
        </div>
      </div>
    </article>
  )
}

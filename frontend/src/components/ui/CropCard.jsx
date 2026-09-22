import { Calendar, Leaf, MapPin, Sprout, ArrowUpRight } from 'lucide-react'

export default function CropCard({ crop }) {
  const cropName = crop.crop_name?.toLowerCase() || ''
  const Icon = cropName.includes('wheat') || cropName.includes('rice') || cropName.includes('maize') ? Sprout : Leaf
  const days = Math.max(0, Math.round((new Date(crop.expected_harvest_date) - new Date()) / 86400000))
  const status = days <= 30 ? 'Harvest soon' : 'Growing'

  return (
    <article className="card card-interactive group overflow-hidden p-0 h-full">
      {crop.image_url ? <div className="relative"><img src={crop.image_url} alt={crop.crop_name} className="media-card-image !mb-0" /><span className={`absolute top-3 left-3 badge ${days <= 30 ? 'badge-warning' : 'badge-success'} bg-white/90 backdrop-blur-sm`}>{status}</span></div> : <div className="h-20 bg-gradient-to-br from-amber-50 to-yellow-100" />}
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 grid place-items-center shrink-0"><Icon className="w-5 h-5" /></div>
          <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h3 className="font-extrabold text-[17px] text-slate-900 truncate group-hover:text-emerald-700">{crop.crop_name}</h3><span className="badge badge-neutral shrink-0">{crop.season}</span></div><p className="text-sm text-slate-500 mt-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Farm cycle</p></div>
          <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 shrink-0" />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-5"><div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Expected yield</p><p className="mt-1 font-bold text-slate-900">{crop.expected_yield} q</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Status</p><p className="mt-1 font-bold text-emerald-700">{status}</p></div></div>
        <div className="mt-4 space-y-2 text-xs text-slate-500"><div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Sown <strong className="text-slate-700">{crop.sowing_date}</strong></div><div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Harvest <strong className="text-slate-700">{crop.expected_harvest_date}</strong><span className="ml-auto text-emerald-700 font-bold">{days}d</span></div></div>
      </div>
    </article>
  )
}

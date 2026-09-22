import { CalendarDays, FileText, MapPin, ArrowUpRight } from 'lucide-react'
import { StatusBadge } from '../StatusBadge'

export default function ContractCard({ contract }) {
  return (
    <article className="card card-interactive group overflow-hidden p-0 h-full">
      {contract.image_url && <div className="relative"><img src={contract.image_url} alt={contract.title} className="media-card-image !mb-0" /><div className="absolute top-3 left-3"><StatusBadge status={contract.status} /></div></div>}
      <div className="p-5">
        <div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 grid place-items-center shrink-0"><FileText className="w-5 h-5" /></div><div className="min-w-0 flex-1"><h3 className="font-extrabold text-[16px] text-slate-900 line-clamp-2 group-hover:text-emerald-700">{contract.title}</h3><p className="text-sm text-slate-500 mt-1 line-clamp-2">{contract.description}</p></div><ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 shrink-0" /></div>
        <div className="grid grid-cols-2 gap-3 mt-5"><div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Quantity</p><p className="mt-1 font-bold text-slate-900">{contract.quantity} q</p></div><div className="rounded-xl bg-emerald-50 p-3"><p className="text-[10px] uppercase tracking-wider font-bold text-emerald-600">Price / q</p><p className="mt-1 font-extrabold text-emerald-800">₹{contract.price_per_unit}</p></div></div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-xs text-slate-500"><span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{contract.land_name}</span><span className="inline-flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />{contract.start_date}</span></div>
      </div>
    </article>
  )
}

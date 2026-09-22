import { Sparkles, WifiOff } from 'lucide-react'

export default function DemoBanner({ message = 'Showing curated sample records so you can explore the product experience.' }) {
  return (
    <div className="demo-banner mb-6">
      <div className="demo-banner-icon">
        <Sparkles className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-emerald-950">Preview data</p>
        <p className="text-sm text-emerald-800/80">{message}</p>
      </div>
      <WifiOff className="w-4 h-4 text-emerald-700/60 hidden sm:block" />
    </div>
  )
}

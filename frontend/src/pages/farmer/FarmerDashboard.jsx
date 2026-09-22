import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { landService } from '../../services/landService'
import { cropService } from '../../services/cropService'
import { contractService } from '../../services/contractService'
import Spinner from '../../components/ui/Spinner'
import { MapPin, Sprout, FileText, TrendingUp } from 'lucide-react'

export default function FarmerDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ lands: 0, crops: 0, contracts: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      landService.getAll(),
      cropService.getAll(),
      contractService.getMine(),
    ]).then(([l, c, co]) => {
      setStats({
        lands: l.status === 'fulfilled' ? l.value.data.length : 0,
        crops: c.status === 'fulfilled' ? c.value.data.length : 0,
        contracts: co.status === 'fulfilled' ? co.value.data.length : 0,
      })
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="py-12 flex justify-center"><Spinner size="lg" /></div>

  const cards = [
    { label: 'My Lands', value: stats.lands, icon: MapPin, to: '/farmer/lands', color: 'text-green-700' },
    { label: 'My Crops', value: stats.crops, icon: Sprout, to: '/farmer/crops', color: 'text-emerald-700' },
    { label: 'My Contracts', value: stats.contracts, icon: FileText, to: '/farmer/contracts', color: 'text-teal-700' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back!</h1>
      <p className="text-gray-500 mb-8">Manage your farm, crops, and contracts.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10">
        {cards.map(c => (
          <Link key={c.label} to={c.to} className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition">
            <c.icon size={28} className={`mb-3 ${c.color}`} />
            <div className="text-3xl font-bold text-gray-900">{c.value}</div>
            <div className="text-sm font-medium text-gray-500 mt-1">{c.label}</div>
          </Link>
        ))}
      </div>
      <div className="bg-white rounded-2xl border p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp size={20} /> Quick Actions
        </h2>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <Link to="/farmer/lands/new" className="btn btn-primary w-full sm:w-auto justify-center">+ Add Land</Link>
          <Link to="/farmer/crops/new" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors">+ Add Crop</Link>
          <Link to="/farmer/contracts/new" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition-colors">+ Post Contract</Link>
          <Link to="/farmer/profile" className="btn btn-secondary w-full sm:w-auto justify-center">Edit Profile</Link>
        </div>
      </div>
    </div>
  )
}

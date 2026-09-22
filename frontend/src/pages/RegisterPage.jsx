import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ErrorMessage from '../components/ErrorMessage'
import { Sprout, ArrowRight, CheckCircle2, Wheat, Store, Users } from 'lucide-react'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', role: 'farmer' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await register(form.email, form.password, form.role); navigate('/login') }
    catch (err) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) setError(detail.map(item=>item?.msg).filter(Boolean).join(', ') || 'Registration failed.')
      else if (typeof detail === 'string') setError(detail)
      else setError('Registration failed.')
    } finally { setLoading(false) }
  }

  return <div className="min-h-screen bg-slate-950 flex items-center justify-center p-3 sm:p-6">
    <div className="w-full max-w-6xl min-h-[680px] rounded-[2rem] overflow-hidden bg-white shadow-2xl grid lg:grid-cols-[.9fr_1.1fr]">
      <section className="relative p-7 sm:p-10 xl:p-14 bg-gradient-to-br from-emerald-50 via-white to-lime-50 border-r border-slate-100">
        <Link to="/" className="inline-flex items-center gap-2"><span className="w-10 h-10 rounded-xl bg-emerald-600 grid place-items-center"><Sprout className="w-5 h-5 text-white"/></span><span className="font-black text-xl text-slate-900">Digital Krishii</span></Link>
        <div className="mt-16"><p className="text-xs uppercase tracking-[.2em] font-bold text-emerald-600">Join the ecosystem</p><h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mt-3 leading-tight">Build better farm connections.</h1><p className="text-slate-500 mt-5 max-w-md leading-relaxed">Create a role-based workspace for your farm or agricultural buying business.</p></div>
        <div className="mt-10 space-y-3">{[[Wheat,'Track land and crop operations'],[Store,'Discover contracts and equipment'],[Users,'Build direct farmer-buyer relationships']].map(([Icon,text])=><div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200"><div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 grid place-items-center"><Icon className="w-4 h-4"/></div><span className="text-sm font-semibold text-slate-700">{text}</span><CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto"/></div>)}</div>
      </section>
      <section className="p-6 sm:p-10 xl:p-14 flex items-center"><div className="w-full max-w-md mx-auto"><p className="text-xs uppercase tracking-widest font-bold text-emerald-600">Create account</p><h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">Start your Digital Krishii journey</h2><p className="text-slate-500 mt-2">Choose your role and create your workspace in under a minute.</p>
        <form onSubmit={handleSubmit} className="space-y-5 mt-8"><div><label className="label">Email address</label><input type="email" className="input !rounded-xl !py-3.5" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></div><div><label className="label">Password</label><input type="password" className="input !rounded-xl !py-3.5" placeholder="Minimum 8 characters" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required minLength={8}/></div><div><label className="label">I am a</label><select className="input !rounded-xl !py-3.5" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="farmer">Farmer</option><option value="buyer">Buyer</option><option value="contractor">Contractor</option></select></div><ErrorMessage message={error}/><button className="btn btn-primary w-full !py-3.5" disabled={loading}>{loading?'Creating account...':<>Create account <ArrowRight className="w-4 h-4"/></>}</button></form><p className="text-sm text-center text-slate-500 mt-8">Already have an account? <Link to="/login" className="font-bold text-emerald-700 hover:underline">Sign in</Link></p>
      </div></section>
    </div>
  </div>
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ErrorMessage from '../components/ErrorMessage'
import { Sprout, Eye, EyeOff, ShieldCheck, ArrowRight, Wheat, Users, Handshake } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const user = await login(form.email, form.password)
      if (user.roles?.includes('admin')) navigate('/admin')
      else navigate('/dashboard')
    } catch (err) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) setError(detail.map(item => item?.msg).filter(Boolean).join(', ') || 'Login failed. Check your credentials.')
      else if (typeof detail === 'string') setError(detail)
      else setError('Login failed. Check your credentials.')
    } finally { setLoading(false) }
  }

  return <div className="min-h-screen bg-slate-950 flex items-center justify-center p-3 sm:p-6">
    <div className="w-full max-w-6xl min-h-[680px] rounded-[2rem] overflow-hidden bg-white shadow-2xl grid lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden lg:flex flex-col justify-between p-10 xl:p-14 text-white bg-gradient-to-br from-emerald-950 via-emerald-800 to-green-600 overflow-hidden">
        <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-white/10"/><div className="absolute -left-20 bottom-0 w-64 h-64 rounded-full bg-lime-300/10"/>
        <div className="relative z-10"><Link to="/" className="inline-flex items-center gap-2"><span className="w-10 h-10 rounded-xl bg-white/15 grid place-items-center"><Sprout className="w-5 h-5"/></span><span className="font-black text-xl">Digital Krishii</span></Link><p className="text-xs uppercase tracking-[.2em] font-bold text-emerald-100 mt-16">One workspace for agriculture</p><h1 className="text-5xl font-black tracking-tight leading-[1.05] mt-4">From field planning to market deals.</h1><p className="text-emerald-50/80 mt-5 max-w-lg leading-relaxed">Manage farms, crops, contracts, leasing and equipment through one modern agricultural marketplace.</p></div>
        <div className="relative z-10 grid grid-cols-3 gap-3">{[[Wheat,'Crop planning'],[Handshake,'Direct deals'],[Users,'Farm network']].map(([Icon,text])=><div className="rounded-2xl bg-white/10 border border-white/10 p-4" key={text}><Icon className="w-5 h-5"/><p className="text-xs font-semibold mt-3 text-emerald-50">{text}</p></div>)}</div>
      </section>
      <section className="p-6 sm:p-10 xl:p-14 flex items-center">
        <div className="w-full max-w-md mx-auto">
          <div className="lg:hidden flex items-center gap-2 mb-10"><div className="w-10 h-10 rounded-xl bg-emerald-600 grid place-items-center"><Sprout className="w-5 h-5 text-white"/></div><span className="font-black text-lg">Digital Krishii</span></div>
          <div className="mb-8"><p className="text-xs uppercase tracking-widest font-bold text-emerald-600">Welcome back</p><h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">Sign in to your workspace</h2><p className="text-slate-500 mt-2">Access your farm, marketplace and account activity.</p></div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div><label className="label">Email address</label><input type="email" className="input !rounded-xl !py-3.5" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></div>
            <div><div className="flex justify-between"><label className="label">Password</label><span className="text-xs text-slate-400">Minimum 8 characters</span></div><div className="relative"><input type={showPw?'text':'password'} className="input !rounded-xl !py-3.5 pr-11" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/><button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={()=>setShowPw(!showPw)}>{showPw?<EyeOff className="w-5 h-5"/>:<Eye className="w-5 h-5"/>}</button></div></div>
            <ErrorMessage message={error}/>
            <button className="btn btn-primary w-full !py-3.5" disabled={loading}>{loading?'Signing in...':<>Sign in <ArrowRight className="w-4 h-4"/></>}</button>
          </form>
          <div className="flex items-center gap-2 mt-6 text-xs text-slate-500"><ShieldCheck className="w-4 h-4 text-emerald-600"/> Secure JWT-authenticated account access</div>
          <p className="text-sm text-center text-slate-500 mt-8">Don't have an account? <Link to="/register" className="font-bold text-emerald-700 hover:underline">Create one</Link></p>
        </div>
      </section>
    </div>
  </div>
}

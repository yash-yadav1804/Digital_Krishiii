import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import {
  Sprout, Menu, X, Bell, ChevronDown, LogOut, User, LayoutDashboard,
  TreePine, Wheat, FileText, Gavel, Building2, Wrench, HelpCircle, Store,
  ShieldCheck, Settings2, ChevronRight, CheckCircle2
} from 'lucide-react'

const groups = {
  farmer: [
    { label: 'Workspace', items: [
      { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
      { to: '/notifications', label: 'Notifications', icon: Bell },
    ]},
    { label: 'Farm management', items: [
      { to: '/lands', label: 'My Lands', icon: TreePine },
      { to: '/crops', label: 'My Crops', icon: Wheat },
      { to: '/contracts', label: 'Contracts', icon: FileText },
      { to: '/reviews', label: 'Reviews', icon: CheckCircle2 },
    ]},
    { label: 'Marketplace', items: [
      { to: '/land-listings', label: 'Lease Lands', icon: Building2 },
      { to: '/equipment', label: 'Equipment', icon: Wrench },
    ]},
  ],
  buyer: [
    { label: 'Workspace', items: [
      { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
      { to: '/notifications', label: 'Notifications', icon: Bell },
    ]},
    { label: 'Discover', items: [
      { to: '/marketplace', label: 'Marketplace', icon: Store },
      { to: '/lease-marketplace', label: 'Lease Lands', icon: Building2 },
      { to: '/equipment', label: 'Equipment', icon: Wrench },
    ]},
    { label: 'Business', items: [
      { to: '/my-bids', label: 'My Bids', icon: Gavel },
      { to: '/my-contracts', label: 'My Contracts', icon: FileText },
      { to: '/my-lease-requests', label: 'Lease Requests', icon: Building2 },
      { to: '/reviews', label: 'Reviews', icon: CheckCircle2 },
    ]},
  ],
  equipment_provider: [
    { label: 'Workspace', items: [
      { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
      { to: '/notifications', label: 'Notifications', icon: Bell },
    ]},
    { label: 'Equipment operations', items: [
      { to: '/equipment', label: 'My Equipment', icon: Wrench },
      { to: '/equipment-requests', label: 'Rental Requests', icon: Gavel },
    ]},
    { label: 'Account', items: [
      { to: '/reviews', label: 'Reviews', icon: CheckCircle2 },
    ]},
  ],
  contractor: [
    { label: 'Workspace', items: [
      { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
      { to: '/notifications', label: 'Notifications', icon: Bell },
    ]},
    { label: 'Account', items: [
      { to: '/reviews', label: 'Reviews', icon: CheckCircle2 },
    ]},
  ],
  admin: [
    { label: 'Workspace', items: [
      { to: '/admin', label: 'Admin overview', icon: ShieldCheck },
      { to: '/admin/profiles', label: 'Profile directory', icon: User },
      { to: '/dashboard', label: 'Product view', icon: LayoutDashboard },
      { to: '/notifications', label: 'Notifications', icon: Bell },
    ]},
    { label: 'Operations', items: [
      { to: '/marketplace', label: 'Marketplace', icon: Store },
      { to: '/lease-marketplace', label: 'Lease Lands', icon: Building2 },
      { to: '/equipment', label: 'Equipment', icon: Wrench },
      { to: '/support', label: 'Support', icon: HelpCircle },
      { to: '/reviews', label: 'Reviews', icon: CheckCircle2 },
    ]},
  ],
}

export default function Navbar() {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const roles = user?.roles?.map((value) => value.toLowerCase()) || []
  const role = roles.includes('admin')
    ? 'admin'
    : roles.includes('equipment_provider')
      ? 'equipment_provider'
      : roles.includes('farmer')
        ? 'farmer'
        : roles.includes('buyer')
          ? 'buyer'
          : 'contractor'

  const roleGroups = role === 'admin'
    ? groups.admin
    : roles.flatMap((value) => groups[value] || [])
  const seenNavItems = new Set()
  const navGroups = roleGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (seenNavItems.has(item.to)) return false
        seenNavItems.add(item.to)
        return true
      }),
    }))
    .filter((group) => group.items.length)

  const userName = user?.email?.split('@')[0] || 'Account'
  const initials = userName.slice(0, 2).toUpperCase()
  const isActive = (path) => location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(`${path}/`))

  const handleLogout = () => {
    setProfileOpen(false)
    setMenuOpen(false)
    logout()
    navigate('/login')
  }

  if (!user) {
    return (
      <header className="public-nav">
        <div className="public-nav-inner">
          <Link to="/login" className="brand-lockup">
            <span className="brand-mark"><Sprout className="w-5 h-5" /></span>
            <span><strong>Digital Krishii</strong><small>AgriTech platform</small></span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn btn-secondary btn-sm">Sign in</Link>
            <Link to="/register" className="btn btn-primary btn-sm hidden sm:inline-flex">Get started</Link>
          </div>
        </div>
      </header>
    )
  }

  return (
    <>
      <aside className="app-sidebar">
        <div className="sidebar-inner">
          <Link to="/dashboard" className="brand-lockup sidebar-brand">
            <span className="brand-mark"><Sprout className="w-5 h-5" /></span>
            <span><strong>Digital Krishii</strong><small>AgriTech workspace</small></span>
          </Link>

          <div className="sidebar-user-card">
            <span className="avatar avatar-sm">{initials}</span>
            <span className="min-w-0 flex-1">
              <strong className="block truncate">{userName}</strong>
              <small className="block truncate">{role.replace('_', ' ')}</small>
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>

          <nav className="sidebar-nav" aria-label="Primary navigation">
            {navGroups.map(group => (
              <div className="nav-group" key={group.label}>
                <p className="nav-group-label">{group.label}</p>
                {group.items.map(({ to, label, icon: Icon }) => (
                  <Link key={to} to={to} className={`sidebar-link ${isActive(to) ? 'is-active' : ''}`}>
                    <Icon className="w-[18px] h-[18px]" />
                    <span>{label}</span>
                    {isActive(to) && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          <div className="sidebar-bottom">
            <Link to="/support" className={`sidebar-link ${isActive('/support') ? 'is-active' : ''}`}>
              <HelpCircle className="w-[18px] h-[18px]" /><span>Support</span>
            </Link>
            <Link to="/profile" className={`sidebar-link ${isActive('/profile') ? 'is-active' : ''}`}>
              <Settings2 className="w-[18px] h-[18px]" /><span>Settings</span>
            </Link>
            <button onClick={handleLogout} className="sidebar-link sidebar-logout">
              <LogOut className="w-[18px] h-[18px]" /><span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      <header className="mobile-topbar">
        <Link to="/dashboard" className="brand-lockup">
          <span className="brand-mark"><Sprout className="w-5 h-5" /></span>
          <span><strong>Digital Krishii</strong><small>AgriTech</small></span>
        </Link>
        <div className="flex items-center gap-1">
          <Link to="/notifications" className="icon-button" aria-label="Notifications"><Bell className="w-5 h-5" /></Link>
          <button className="icon-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open navigation">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-card">
            <div className="sidebar-user-card mb-3">
              <span className="avatar avatar-sm">{initials}</span>
              <span className="min-w-0 flex-1"><strong className="block truncate">{userName}</strong><small className="block capitalize">{role}</small></span>
            </div>
            {navGroups.flatMap(group => group.items).map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)} className={`sidebar-link ${isActive(to) ? 'is-active' : ''}`}>
                <Icon className="w-[18px] h-[18px]" /><span>{label}</span>
              </Link>
            ))}
            <Link to="/notifications" onClick={() => setMenuOpen(false)} className="sidebar-link"><Bell className="w-[18px] h-[18px]" /><span>Notifications</span></Link>
            <Link to="/profile" onClick={() => setMenuOpen(false)} className="sidebar-link"><User className="w-[18px] h-[18px]" /><span>Profile</span></Link>
            <button onClick={handleLogout} className="sidebar-link sidebar-logout"><LogOut className="w-[18px] h-[18px]" /><span>Sign out</span></button>
          </div>
        </div>
      )}
    </>
  )
}

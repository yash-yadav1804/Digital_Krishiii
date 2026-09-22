import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Bell, LogOut, User, Sprout } from 'lucide-react'

export default function Navbar() {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
      <Link to="/" className="flex items-center gap-2 font-bold text-lg sm:text-xl text-green-700 min-w-0 flex-shrink-0 mr-2">
        <Sprout size={24} className="flex-shrink-0" />
        <span className="truncate">Digital Krishii</span>
      </Link>
      <div className="flex items-center gap-2 sm:gap-4">
        {user && (
          <>
            {hasRole('farmer') && (
              <div className="hidden md:flex gap-4 text-sm font-medium text-gray-600">
                <Link to="/farmer/dashboard" className="hover:text-green-700">Dashboard</Link>
                <Link to="/farmer/lands" className="hover:text-green-700">Lands</Link>
                <Link to="/farmer/crops" className="hover:text-green-700">Crops</Link>
                <Link to="/farmer/contracts" className="hover:text-green-700">Contracts</Link>
              </div>
            )}
            {hasRole('buyer') && (
              <div className="hidden md:flex gap-4 text-sm font-medium text-gray-600">
                <Link to="/buyer/dashboard" className="hover:text-green-700">Dashboard</Link>
                <Link to="/buyer/contracts" className="hover:text-green-700">Browse Contracts</Link>
                <Link to="/buyer/bids" className="hover:text-green-700">My Bids</Link>
              </div>
            )}
            {hasRole('admin') && (
              <div className="hidden md:flex gap-4 text-sm font-medium text-gray-600">
                <Link to="/admin" className="hover:text-green-700">Admin</Link>
              </div>
            )}
            <Link to="/notifications" className="text-gray-500 hover:text-green-700">
              <Bell size={20} />
            </Link>
            <Link to="/profile" className="text-gray-500 hover:text-green-700">
              <User size={20} />
            </Link>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-600">
              <LogOut size={20} />
            </button>
          </>
        )}
        {!user && (
          <>
            <Link to="/login" className="text-sm text-gray-600 hover:text-green-700">Login</Link>
            <Link to="/register" className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}

import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/ui/Spinner'

export default function ProtectedRoute({ children, role }) {
  const { user, loading, hasRole } = useAuth()
  if (loading) return <div className="flex justify-center mt-20"><Spinner size="lg" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (role && !hasRole(role)) return <Navigate to="/unauthorized" replace />
  return children
}

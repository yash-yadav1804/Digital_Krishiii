import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (role) {
    const roles = user.roles?.map((r) => r.toLowerCase()) || []
    if (!roles.includes(role.toLowerCase())) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return children
}

import { useState, useEffect } from 'react'
import { adminService } from '../services/adminService'
import LoadingState from '../components/ui/LoadingState'
import ErrorState from '../components/ui/ErrorState'
import PageHeader from '../components/ui/PageHeader'
import { Search, ShieldCheck, ShieldOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { DEMO_USERS, fillPreviewData } from '../data/demoData'
import DemoBanner from '../components/ui/DemoBanner'

const ALL_ROLES = ['farmer', 'buyer', 'admin', 'contractor', 'equipment_provider', 'input_supplier', 'field_officer']

export default function AdminPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [demoMode, setDemoMode] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await adminService.getUsers()
      const preview = fillPreviewData(data, DEMO_USERS, 6); setUsers(preview.rows); setDemoMode(preview.hasDemo)
    } catch {
      setUsers(DEMO_USERS.map(row => ({ ...row, __demo: true })))
      setDemoMode(true)
      setError('')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const toggleStatus = async (user) => {
    try {
      await adminService.updateUserStatus(user.id, !user.is_active)
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u))
      toast.success(`User ${user.is_active ? 'deactivated' : 'activated'}`)
    } catch {
      toast.error('Failed to update user status')
    }
  }

  const assignRole = async (userId, role) => {
    try {
      await adminService.assignRole(userId, role)
      setUsers(prev => prev.map(u =>
        u.id === userId
          ? { ...u, roles: u.roles.includes(role) ? u.roles : [...u.roles, role] }
          : u
      ))
      toast.success(`Role "${role}" assigned`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to assign role')
    }
  }

  const removeRole = async (userId, role) => {
    try {
      await adminService.removeRole(userId, role)
      setUsers(prev => prev.map(u =>
        u.id === userId
          ? { ...u, roles: u.roles.filter(r => r !== role) }
          : u
      ))
      toast.success(`Role "${role}" removed`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to remove role')
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <LoadingState title="Loading users" message="Fetching platform users and roles..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <ErrorState title="Unable to load users" message={error} onRetry={fetchUsers} />
      </div>
    )
  }

  const filtered = users.filter(u =>
    !search || u.email.toLowerCase().includes(search.toLowerCase())
  )

  const activeCount = users.filter(u => u.is_active).length
  const inactiveCount = users.length - activeCount
  const farmerCount = users.filter(u => u.roles?.includes('farmer')).length

  return (
    <div className="page-container">
      {demoMode && <DemoBanner message="Sample accounts are included when the live user list is small. Sample accounts are read-only." />}

      <PageHeader
        eyebrow="Admin"
        title="User Management"
        subtitle="Manage platform users, assign roles, and control account access."
        stats={[
          { label: 'Total Users', value: users.length },
          { label: 'Active', value: activeCount },
          { label: 'Inactive', value: inactiveCount },
          { label: 'Farmers', value: farmerCount },
        ]}
      />

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            className="input pl-9"
            placeholder="Search by email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Desktop table */}
      <div className="card p-0 overflow-hidden hidden sm:block">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">All Users</h2>
          <span className="text-sm text-gray-500">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500">User</th>
                <th className="px-6 py-3 font-medium text-gray-500">Roles</th>
                <th className="px-6 py-3 font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-400 text-sm">
                    No users match your search.
                  </td>
                </tr>
              ) : filtered.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 truncate max-w-[200px]">{user.email}</div>
                    <div className="text-xs text-gray-400 font-mono mt-0.5">{user.id.slice(0, 8)}…</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(user.roles || []).map(role => (
                        <span key={role} className="badge bg-primary-100 text-primary-700 flex items-center gap-1">
                          {role}
                          <button
                            onClick={() => !user.__demo && removeRole(user.id, role)} disabled={user.__demo}
                            className="hover:text-red-600 ml-0.5 font-bold leading-none"
                            title={`Remove ${role}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => !user.__demo && toggleStatus(user)} disabled={user.__demo}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                          user.is_active
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <select
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                        defaultValue=""
                        onChange={e => { if (e.target.value && !user.__demo) { assignRole(user.id, e.target.value); e.target.value = '' } }} disabled={user.__demo}
                      >
                        <option value="">+ Role</option>
                        {ALL_ROLES.filter(r => !user.roles?.includes(r)).map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="card text-center text-gray-400 text-sm py-8">
            No users match your search.
          </div>
        ) : filtered.map(user => (
          <div key={user.id} className="card">
            {/* User info */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{user.email}</p>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{user.id.slice(0, 8)}…</p>
              </div>
              <span className={`badge flex-shrink-0 ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {user.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Roles */}
            {(user.roles || []).length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {(user.roles || []).map(role => (
                  <span key={role} className="badge bg-primary-100 text-primary-700 flex items-center gap-1">
                    {role}
                    <button
                      onClick={() => !user.__demo && removeRole(user.id, role)} disabled={user.__demo}
                      className="hover:text-red-600 ml-0.5 font-bold leading-none"
                      title={`Remove ${role}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => !user.__demo && toggleStatus(user)} disabled={user.__demo}
                className={`flex-1 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-1 ${
                  user.is_active
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                }`}
              >
                {user.is_active
                  ? <><ShieldOff className="w-3.5 h-3.5" /> Deactivate</>
                  : <><ShieldCheck className="w-3.5 h-3.5" /> Activate</>
                }
              </button>
              <select
                className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                defaultValue=""
                onChange={e => { if (e.target.value && !user.__demo) { assignRole(user.id, e.target.value); e.target.value = '' } }} disabled={user.__demo}
              >
                <option value="">+ Assign Role</option>
                {ALL_ROLES.filter(r => !user.roles?.includes(r)).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function StatusBadge({ status }) {
  const map = {
    OPEN:        'bg-blue-100 text-blue-700',
    PENDING:     'bg-yellow-100 text-yellow-700',
    ACCEPTED:    'bg-green-100 text-green-700',
    REJECTED:    'bg-red-100 text-red-700',
    CANCELLED:   'bg-gray-100 text-gray-600',
    ACTIVE:      'bg-primary-100 text-primary-700',
    COMPLETED:   'bg-purple-100 text-purple-700',
    NEGOTIATING: 'bg-orange-100 text-orange-700',
  }
  const cls = map[status?.toUpperCase()] || 'bg-gray-100 text-gray-600'
  return <span className={`badge ${cls}`}>{status}</span>
}

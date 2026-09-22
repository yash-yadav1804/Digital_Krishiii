function normalizeMessage(message) {
  if (!message) return ''
  if (typeof message === 'string') return message
  if (Array.isArray(message)) {
    return message
      .map((item) => {
        if (typeof item === 'string') return item
        return item?.msg || item?.message || ''
      })
      .filter(Boolean)
      .join(', ')
  }
  if (typeof message === 'object') {
    return message.msg || message.message || message.detail || 'Something went wrong'
  }
  return String(message)
}

export default function ErrorMessage({ message }) {
  const text = normalizeMessage(message)
  if (!text) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 break-words whitespace-normal">
      {text}
    </div>
  )
}

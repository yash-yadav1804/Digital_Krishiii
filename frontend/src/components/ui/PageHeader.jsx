export default function PageHeader({ eyebrow, title, subtitle, action, stats }) {
  return (
    <header className="page-header">
      <div className="page-heading-row">
        <div className="min-w-0 flex-1">
          {eyebrow && <p className="page-eyebrow">{eyebrow}</p>}
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {action && <div className="page-header-action">{action}</div>}
      </div>
      {stats?.length > 0 && (
        <div className={`page-stat-grid ${stats.length === 1 ? 'one' : stats.length === 2 ? 'two' : stats.length >= 4 ? 'four' : ''}`}>
          {stats.map((stat, index) => (
            <div key={index} className="page-stat">
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </div>
      )}
    </header>
  )
}

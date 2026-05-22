export default function EmptyState({ title, message, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">📊</div>
      <h3>{title}</h3>
      <p>{message}</p>
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}

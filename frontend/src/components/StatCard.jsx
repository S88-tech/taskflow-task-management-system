function StatCard({ title, value, description }) {
  return (
    <div className="stat-card">
      <span>{title}</span>

      <strong>{value}</strong>

      <small>{description}</small>
    </div>
  );
}

export default StatCard;
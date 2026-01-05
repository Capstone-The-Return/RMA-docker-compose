import style from "./StatCard.module.css";

export default function StatCard({ icon, label, value, trend }) {
  return (
    <div className={style.card}>
      <div className={style.topRow}>
        <div className={style.icon}>{icon}</div>
        <div className={style.trend}>{trend}</div>
      </div>

      <div className={style.label}>{label}</div>
      <div className={style.value}>{value}</div>
    </div>
  );
}

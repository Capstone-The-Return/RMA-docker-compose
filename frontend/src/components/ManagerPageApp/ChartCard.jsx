import style from "./ChartCard.module.css";

export default function ChartCard({ title, children }) {
  return (
    <div className={style.card}>
      <div className={style.title}>{title}</div>
      <div className={style.body}>{children}</div>
    </div>
  );
}

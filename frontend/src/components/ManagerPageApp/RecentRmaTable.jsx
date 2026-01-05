import style from "./RecentRmaTable.module.css";
import StatusBadge from "./StatusBadge.jsx";

export default function RecentRmaTable({ rows }) {
  return (
    <div className={style.wrap}>
      <table className={style.table}>
        <thead>
          <tr>
            <th>RMA ID</th>
            <th>Customer</th>
            <th>Product</th>
            <th className={style.right}>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className={style.mono}>{r.id}</td>
              <td>{r.customer}</td>
              <td>{r.product}</td>
              <td className={style.right}><StatusBadge status={r.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

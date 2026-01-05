import style from "./StatusBadge.module.css";

const LABELS = {
  pending: "PENDING",
  "in-repair": "IN REPAIR",
  approved: "APPROVED",
  completed: "COMPLETED",
  rejected: "REJECTED",
};

export default function StatusBadge({ status }) {
  const label = LABELS[status] || status?.toUpperCase?.() || "UNKNOWN";
  return <span className={`${style.badge} ${style[status] || ""}`}>{label}</span>;
}

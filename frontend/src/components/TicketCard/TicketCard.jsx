import styles from "./TicketCard.module.css";

export default function TicketCard({ ticket, onStatusChange }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <strong>{ticket.rma}</strong>
        <span className={`${styles.badge} ${styles[ticket.priority?.toLowerCase()]}`}>
          {ticket.priority} PRIORITY
        </span>
      </div>

      <p><strong>{ticket.customer.name}</strong></p>
      <p>{ticket.product.name}</p>
      <p className={styles.issue}>Issue: {ticket.issue}</p>

      <div className={styles.controls}>
        <select
          value={ticket.technical_status}
          onChange={(e) => onStatusChange(ticket.id, e.target.value)}
        >
          <option>Pending</option>
          <option>Approved</option>
          <option>In Repair</option>
          <option>Completed</option>
          <option>Rejected</option>
        </select>

        <div className={styles.assignedData}>
          
            {ticket.assignedTo ? ticket.assignedTo : "Unassigned"}
         
        </div>
      </div>
    </div>
  );
}

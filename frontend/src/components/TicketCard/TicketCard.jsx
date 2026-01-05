import styles from "./TicketCard.module.css";

// Component responsible for displaying individual ticket details
export default function TicketCard({ ticket, onStatusChange }) {
  
  // Safety check: If priority is missing in the database, default to Low
  // This prevents the badge from looking broken
  const priorityLevel = ticket.priority || "Low";

  // Determine the CSS class based on priority (high, medium, low)
  // We use toLowerCase to match the CSS class names safely
  const priorityClass = styles[priorityLevel.toLowerCase()] || styles.low;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <strong>{ticket.rma}</strong>
        
        {/* Priority Badge with dynamic styling */}
        <span className={`${styles.badge} ${priorityClass}`}>
          {priorityLevel} PRIORITY
        </span>
      </div>

      <p><strong>{ticket.customer.name}</strong></p>
      <p>{ticket.product.name}</p>
      <p className={styles.issue}>Issue: {ticket.issue}</p>

      <div className={styles.controls}>
        {/* Dropdown for Technician to update the repair status */}
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
          {/* Display assigned technician name or Unassigned placeholder */}
          {ticket.assigned_to ? ticket.assigned_to : "Unassigned"}
        </div>
      </div>
    </div>
  );
}
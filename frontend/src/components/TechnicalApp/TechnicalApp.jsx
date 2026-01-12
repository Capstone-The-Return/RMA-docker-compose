import { useState, useEffect, useRef, useMemo } from "react";
import styles from "./TechnicalApp.module.css";
import TicketCard from "../TicketCard/TicketCard";
import { getAllTickets, updateTicket } from '../../services/employeeTickets';

// Helper function to format ISO dates to a readable string
const formatDate = (iso) => {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString(); } catch { return iso; }
};

export default function TechnicalApp() {
  // Core State Management 
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Notification States 
  const [notifOpen, setNotifOpen] = useState(false);
  const notifWrapRef = useRef(null); // Ref to detect clicks outside the dropdown

  // Persistent State: Load 'read' notifications from LocalStorage to remember them after refresh
  const [readIds, setReadIds] = useState(() => {
    const saved = localStorage.getItem("read_notifications");
    return saved ? JSON.parse(saved) : [];
  });

  // Modal States (for comments/rejection reasons)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingTicketId, setPendingTicketId] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(""); 
  const [repairNote, setRepairNote] = useState("");

  //  1. Data Fetching & Polling 
  useEffect(() => {
    const fetchData = () => {
      getAllTickets().then(data => {
        // Filter only tickets relevant to the technical department
        setTickets(data.filter(t => t.technical_status !== null && t.record_type !== 'return' && t.status == "in-repair")); 
      });
    };

    fetchData(); // Initial fetch
    
    // Auto-refresh data every 5 seconds (Polling) to detect new requests in real-time
    const interval = setInterval(fetchData, 5000);
    
    // Cleanup interval on component unmount to prevent memory leaks
    return () => clearInterval(interval);
  }, []);

  //  2. Click Outside Handler 
  // Closes the notification dropdown when the user clicks anywhere else on the screen
  useEffect(() => {
    function onDocDown(e) {
      if (!notifWrapRef.current) return;
      if (!notifWrapRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  //  3. Notification Logic (useMemo for performance) 
  const notifications = useMemo(() => {
    // Show only 'Pending' tickets that haven't been marked as read
    const pendingTickets = tickets.filter(t => 
      t.technical_status === "Pending" && !readIds.includes(t.id)
    );
    
    // Sort by date (newest first)
    const sorted = [...pendingTickets].sort((a, b) => {
      const tA = new Date(a.created_at || a.date).getTime();
      const tB = new Date(b.created_at || b.date).getTime();
      return tB - tA;
    });

    return sorted.map(t => ({
      id: t.id,
      rma: t.rma,
      issue: t.issue,
      when: formatDate(t.created_at || t.date),
      ticket: t
    }));
  }, [tickets, readIds]); // Re-calculate only when tickets or readIds change

  // 4. Filtering Logic 
  const filteredTickets = tickets.filter(t => {
    // Filter by Status
    const matchesStatus = filter === "All" || t.technical_status === filter;
    
    // Filter by Search Term (RMA, Customer, Product) - Case insensitive
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      t.rma?.toLowerCase().includes(searchLower) ||
      t.customer?.name?.toLowerCase().includes(searchLower) ||
      t.product?.name?.toLowerCase().includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  // 5. Status Update Handler 
  const handleStatusChange = async (id, status) => {
    // Conditional Logic: If status is 'In Repair' or 'Rejected', require a note via Modal
    if (status === "In Repair" || status === "Rejected") {
      setPendingTicketId(id);
      setPendingStatus(status);
      setRepairNote(""); 
      setIsModalOpen(true); // Open the modal
      return; 
    }
    // Otherwise, update directly
    await performUpdate(id, status);
  };

  // Helper function to execute the API update
  const performUpdate = async (id, status, note = "") => {
    const payload = { 'technical_status': status };
    if (note) payload.technical_notes = note; // Add note to payload if exists

    await updateTicket(id, payload);
    
    // Optimistic UI Update: Update local state immediately for better UX
    setTickets(prev => prev.map(t =>
      t.id === id ? { ...t, technical_status: status, technical_notes: note ? note : t.technical_notes } : t
    ));
  };

  // Confirms the update from the Modal
  const confirmStatusUpdate = async () => {
    if (pendingTicketId && pendingStatus) {
      await performUpdate(pendingTicketId, pendingStatus, repairNote);
      setIsModalOpen(false); // Close modal
      setPendingTicketId(null);
      setPendingStatus("");
    }
  };

  // 6. Notification Click Handler 
  const handleNotifClick = (ticket) => {
    // Mark notification as read and save to LocalStorage
    const newReadIds = [...readIds, ticket.id];
    setReadIds(newReadIds);
    localStorage.setItem("read_notifications", JSON.stringify(newReadIds));

    // Navigate user to the ticket
    setFilter("Pending");
    setSearchTerm(ticket.rma);
    setNotifOpen(false);
  };

  return (
    <div className={styles.technical}>
      
      {/* HEADER SECTION */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
            <div className={styles.icon}>🔧</div>
            <div>
              <h2>Technical Center</h2>
              <p>Ticket Management & Repair Status</p>
            </div>
        </div>

        {/* NOTIFICATIONS DROPDOWN */}
        <div className={styles.notifWrap} ref={notifWrapRef}>
            <button 
              
              className={style.notifButton}
              onClick={() => setNotifOpen(!notifOpen)}
            >
              <span className={styles.bell}>🔔</span>

              {notifications.length > 0 && <span className={styles.badge}>{notifications.length}</span>}
            </button>

            {notifOpen && (
              <div className={styles.dropdown}>
                {notifications.length === 0 ? (
                  <div className={styles.dropdownEmpty}>No new notifications.</div>
                ) : (
                  <>
                    {notifications.slice(0, 5).map(n => (
                      <button 
                        key={n.id} 
                        className={styles.dropdownItem}
                        onClick={() => handleNotifClick(n.ticket)}
                      >
                        <span className={`${styles.dropdownDot} ${styles.dropdownDotWarning}`}></span>
                        <div className={styles.dropdownMain}>
                          <span className={styles.dropdownTitle}>{n.rma}</span>
                          <span className={styles.dropdownSub}>{n.issue}</span>
                        </div>
                        <span className={styles.dropdownWhen}>{n.when}</span>
                      </button>
                    ))}
                    <button 
                      className={styles.dropdownViewAll} 
                      onClick={() => { setFilter("Pending"); setNotifOpen(false); }}
                    >
                       View all Pending
                    </button>
                  </>
                )}
              </div>
            )}
        </div>
      </div>

      {/* FILTERS SECTION */}
      <div className={styles.filters}>
        <input 
          placeholder="Search by RMA, Customer..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>In Repair</option>
          <option>Completed</option>
          <option>Rejected</option>
        </select>
      </div>

      {/* TICKET LIST */}
      <div className={styles.title}>
        <h3>Active Tickets ({filteredTickets.length})</h3>
        <p>Manage and update repair ticket statuses</p>
      </div>

      {filteredTickets.map(ticket => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          onStatusChange={handleStatusChange}
        />
      ))}

      {/* MODAL FOR NOTES/REJECTION */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>
              {pendingStatus === "Rejected" ? "🚫 Rejection Reason" : "🔧 Repair Details"}
            </h3>
            <p>
              You are moving ticket <b>{tickets.find(t => t.id === pendingTicketId)?.rma}</b> to 
              <b style={{ color: pendingStatus === 'Rejected' ? '#dc2626' : '#2563eb' }}> {pendingStatus}</b>.
            </p>
            <p className={styles.modalNoteLabel}>
               {pendingStatus === "Rejected" 
                 ? "Please explain why this ticket is being rejected:" 
                 : "Please add a note (e.g., 'Waiting for parts'):"
               }
            </p>
            <textarea 
              className={styles.modalTextarea}
              rows="4"
              placeholder={pendingStatus === "Rejected" ? "Reason for rejection..." : "Type repair notes here..."}
              value={repairNote}
              onChange={(e) => setRepairNote(e.target.value)}
            ></textarea>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button 
                className={styles.confirmBtn} 
                onClick={confirmStatusUpdate}
                style={{ background: pendingStatus === "Rejected" ? "#dc2626" : "#0f2027" }}
              >
                Confirm {pendingStatus}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
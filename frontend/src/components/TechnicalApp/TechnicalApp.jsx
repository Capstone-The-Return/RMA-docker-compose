import { useState, useEffect } from "react";
import styles from "./TechnicalApp.module.css";
import TicketCard from "../TicketCard/TicketCard";
import { getAllTickets, updateTicket } from '../../services/employeeTickets';

export default function TechnicalApp() {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState(""); // 1. Νέο state για την αναζήτηση

  useEffect(() => {
    getAllTickets().then(data => {
      // Κρατάμε τα tickets που έχουν technical_status (όχι null)
      setTickets(data.filter(t => t.technical_status !== null)); 
    });
  }, []);

  // 2. Συνδυασμένη λογική για Search ΚΑΙ Filter
  const filteredTickets = tickets.filter(t => {
    // Έλεγχος Status 
    const matchesStatus = filter === "All" || t.technical_status === filter;

    // Έλεγχος Search (RMA, Customer Name, Product Name)
    // Χρησιμοποιούμε toLowerCase() για να μην παίζει ρόλο αν είναι κεφαλαία ή μικρά
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      t.rma?.toLowerCase().includes(searchLower) ||
      t.customer?.name?.toLowerCase().includes(searchLower) ||
      t.product?.name?.toLowerCase().includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  const updateStatus = async (id, status) => {
    await updateTicket(id, {'technical_status': status});
    
    setTickets(tickets.map(t =>
      t.id === id ? { ...t, technical_status: status } : t
    ));
  };

  return (
    <section className={styles.technical}>
      <div className={styles.header}>
        <div className={styles.icon}>🔧</div>
        <div>
          <h2>Technical Center</h2>
          <p>Ticket Management & Repair Status</p>
        </div>
      </div>

      <div className={styles.filters}>
        {/* 3. Σύνδεση του input με το state */}
        <input 
          placeholder="Search by RMA ID, customer, or product..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select onChange={(e) => setFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>In Repair</option>
          <option>Completed</option>
          <option>Rejected</option>
        </select>
      </div>

      <div className={styles.title}>
        <h3>Active Tickets ({filteredTickets.length})</h3>
        <p>Manage and update repair ticket statuses</p>
      </div>

      {filteredTickets.map(ticket => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          onStatusChange={updateStatus}
        />
      ))}
    </section>
  );
}
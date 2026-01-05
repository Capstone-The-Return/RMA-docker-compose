import { useState } from "react";
import style from "./FormMain.module.css";


const STEPS = ["Submitted", "Approved", "In Repair", "Completed"];

const normalize = (v) => (v || "").trim().toUpperCase();

const prettyStatus = (raw) => {
  const s = (raw || "").trim();
  if (!s) return "-";
  const map = {
    PENDING: "Pending", "IN-REPAIR": "In Repair", "IN REPAIR": "In Repair",
    COMPLETED: "Completed", CLOSED: "Closed", APPROVED: "Approved",
    REJECTED: "Rejected", REJECT: "Rejected"
  };
  return map[normalize(s)] || s;
};

const formatDate = (iso) => {
  if (!iso) return "-";
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
};

function getStepIndexFromTicket(t) {
  if (!t) return 0;
  const status = normalize(t.status);
  const tech = normalize(t.technical_status);
  if (status.includes("COMPLETED") || tech.includes("COMPLETED")) return 3;
  if (status.includes("IN REPAIR") || tech.includes("IN REPAIR")) return 2;
  if (tech.includes("APPROVED")) return 1;
  if (tech.includes("REJECT")) return 1; 
  return 0;
}

function getThemeFromTicket(t) {
  if (!t) return "neutral";
  const status = normalize(t.status);
  const tech = normalize(t.technical_status);
  if (tech.includes("REJECT")) return "danger";
  if (status.includes("COMPLETED") || tech.includes("COMPLETED")) return "success";
  if (status.includes("IN REPAIR") || tech.includes("IN REPAIR")) return "info";
  if (status.includes("PENDING") || tech.includes("PENDING")) return "warning";
  return "neutral";
}


function buildBadgeText(statusRaw, techRaw) {
  const statusPretty = prettyStatus(statusRaw);
  const techPretty = prettyStatus(techRaw);
  if (!techRaw) return statusPretty;
  if (normalize(statusRaw) === normalize(techRaw)) return statusPretty;
  return `${statusPretty} • ${techPretty}`;
}

export default function FormMain() {
    const [rma, setRma] = useState("");
    const [loading, setLoading] = useState(false);
    const [ticket, setTicket] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");

    const handleContactSubmit = (e) => {
        e.preventDefault();
        alert("Thank you! Our passionate team will contact you soon.");
    };

    const handleTrackSearch = async () => {
        if (!rma.trim()) {
            setErrorMsg("Please enter an RMA number.");
            return;
        }
        setLoading(true);
        setErrorMsg("");
        setTicket(null);

        try {
            const res = await fetch(`http://localhost:4000/tickets?rma=${rma.trim()}`);
            const data = await res.json();
            
            if (data.length > 0) {
                setTicket(data[0]); 
            } else {
                setErrorMsg("No ticket found with this RMA.");
            }
        } catch (err) {
            setErrorMsg("Server error. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

   
    const theme = ticket ? getThemeFromTicket(ticket) : "neutral";
    const stepIndex = ticket ? getStepIndexFromTicket(ticket) : 0;
    const badgeText = ticket ? buildBadgeText(ticket.status, ticket.technical_status) : "";

   
    const badgeCls = theme === "success" ? style.badgeSuccess :
                     theme === "danger" ? style.badgeDanger :
                     theme === "info" ? style.badgeInfo :
                     theme === "warning" ? style.badgeWarning : style.badgeNeutral;

    return (
        <div className={style.formsWrapper}>
            
            {/* 1. Search RMA Section */}
            <div className={style.card}>
                <h3 className={style.contactTitle}>Search RMA</h3>
                <p className={style.contactText}>Enter your ticket number to track your repair/return status.</p>
                <div className={style.formGroup}>
                    <label className={style.label}>Ticket Number</label>
                    <input 
                        type="text" placeholder="RMA-12345" className={style.input} 
                        value={rma} onChange={(e) => setRma(e.target.value)}
                    />
                </div>
                {errorMsg && <p className={style.errorText}>{errorMsg}</p>}
                <button className={style.searchBtn} onClick={handleTrackSearch} disabled={loading}>
                    {loading ? "Searching..." : "Track Status"}
                </button>
            </div>

            {/* 2. Quick Support Section */}
            <div className={style.card}>
                <h3 className={style.contactTitle}>Quick Support</h3>
                <p className={style.contactText}>Please fill in your details so we can contact you immediately.</p>
                <form className={style.form} onSubmit={handleContactSubmit}>
                    <div className={style.formGroup}>
                        <label className={style.label}>Email Address</label>
                        <input type="email" placeholder="example@mail.com" className={style.input} required />
                    </div>
                    <div className={style.formGroup}>
                        <label className={style.label}>Your Message</label>
                        <textarea placeholder="Describe your issue here..." className={style.textarea} required></textarea>
                    </div>
                    <button type="submit" className={style.submitBtn}>Send Message</button>
                </form>
            </div>

            
            {ticket && (
                <div className={style.modalOverlay}>
                    <div className={style.modalContent}>
                        <button className={style.closeIcon} onClick={() => setTicket(null)}>✕</button>
                        
                        
                        <div className={style.resultCard} data-theme={theme}>
                             
                             {/* HEADER: Title & Badge */}
                             <div className={style.resultHeader}>
                                <div>
                                    <h2 className={style.resultTitle}>RMA Status</h2>
                                    <p className={style.resultSub}>RMA: <b>{ticket.rma}</b></p>
                                </div>
                                <span className={`${style.badge} ${badgeCls}`}>{badgeText}</span>
                             </div>

                             {/* PROGRESS BAR */}
                             <div className={style.timeline} data-theme={theme}>
                                <div className={style.timelineTop}>
                                    {STEPS.map((s, i) => (
                                        <div key={s} className={style.topItem}>
                                            <div className={`${style.circle} ${i <= stepIndex ? style.circleActive : ""}`}>
                                                {i <= stepIndex ? "✓" : ""}
                                            </div>
                                            {i < STEPS.length - 1 && (
                                                <div className={`${style.connector} ${i < stepIndex ? style.connectorActive : ""}`} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className={style.timelineLabels}>
                                    {STEPS.map((s, i) => (
                                        <div key={s} className={`${style.stepLabel} ${i <= stepIndex ? style.stepLabelActive : ""}`}>
                                            {s}
                                        </div>
                                    ))}
                                </div>
                             </div>

                             {/* DETAILS GRID  */}
                             <div className={style.detailsGrid}>
                                <div className={style.field}>
                                    <div className={style.fieldLabel}>Customer</div>
                                    <div className={style.fieldValue}>{ticket.customer?.name || "-"}</div>
                                </div>
                                <div className={style.field}>
                                    <div className={style.fieldLabel}>Email</div>
                                    <div className={style.fieldValue}>{ticket.email || "-"}</div>
                                </div>
                                <div className={style.field}>
                                    <div className={style.fieldLabel}>Phone</div>
                                    <div className={style.fieldValue}>{ticket.phone || "-"}</div>
                                </div>
                                <div className={style.field}>
                                    <div className={style.fieldLabel}>Purchase Date</div>
                                    <div className={style.fieldValue}>{ticket.purchase_date || "-"}</div>
                                </div>
                                <div className={style.field}>
                                    <div className={style.fieldLabel}>Product</div>
                                    <div className={style.fieldValue}>{ticket.product?.name || "-"}</div>
                                </div>
                                <div className={style.field}>
                                    <div className={style.fieldLabel}>Serial Number</div>
                                    <div className={style.fieldValue}>{ticket.serial_number || "-"}</div>
                                </div>
                                <div className={style.field}>
                                    <div className={style.fieldLabel}>Assigned To</div>
                                    <div className={style.fieldValue}>{ticket.assigned_to || ticket.assignedTo || "-"}</div>
                                </div>
                                <div className={style.field}>
                                    <div className={style.fieldLabel}>Last Update</div>
                                    <div className={style.fieldValue}>{formatDate(ticket.created_at || ticket.date)}</div>
                                </div>
                             </div>

                             {/* ISSUE & NOTES BLOCKS */}
                             <div className={style.block}>
                                <div className={style.blockLabel}>Issue</div>
                                <div className={style.blockValue}>{ticket.issue || "-"}</div>
                             </div>

                             <div className={style.block}>
                                <div className={style.blockLabel}>Notes</div>
                                <div className={style.blockValue}>{ticket.notes || "-"}</div>
                             </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
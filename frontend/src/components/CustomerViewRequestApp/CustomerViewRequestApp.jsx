import { useEffect, useMemo, useRef, useState } from "react";
import style from "./CustomerViewRequestApp.module.css";
import CustomerFormApp from '../../components/CustomerFormApp/CustomerFormApp.jsx'; 

const API_BASE = "http://localhost:4000";

const normalize = (v) => (v || "").trim().toUpperCase();

const prettyStatus = (raw) => {
  const s = (raw || "").trim();
  if (!s) return "-";

  const key = normalize(s);

  const map = {
    PENDING: "Pending",
    "IN-REPAIR": "In Repair",
    "IN REPAIR": "In Repair",
    COMPLETED: "Completed",
    CLOSED: "Closed",

    APPROVED: "Approved",
    REJECTED: "Rejected",
    REJECT: "Rejected",
    "IN REPAIR": "In Repair",
  };

  return map[key] || s;
};

const formatDate = (iso) => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const STEPS = ["Submitted", "Approved", "In Repair", "Completed"];

function getTicketUpdatedAtMs(t) {
  const raw = t?.last_updated || t?.created_at || t?.createdAt || t?.date;
  if (!raw) return 0;
  const ms = new Date(raw).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

function getStepIndexFromTicket(t) {
  if (!t) return 0;

  const status = normalize(t.status); // pending | in-repair | completed
  const tech = normalize(t.technical_status); // Approved | Rejected | Pending | etc.

  if (status.includes("COMPLETED") || tech.includes("COMPLETED") || tech.includes("CLOSED")) return 3;
  if (status.includes("IN-REPAIR") || status.includes("IN REPAIR") || tech.includes("IN REPAIR")) return 2;
  if (tech.includes("APPROVED")) return 1;

  // rejected: το δείχνουμε στο 2ο βήμα (με κόκκινο theme)
  if (tech.includes("REJECT")) return 1;

  return 0;
}

function getThemeFromTicket(t) {
  if (!t) return "neutral";

  const status = normalize(t.status);
  const tech = normalize(t.technical_status);

  if (tech.includes("REJECT")) return "danger";
  if (status.includes("COMPLETED") || tech.includes("COMPLETED") || tech.includes("CLOSED")) return "success";
  if (status.includes("IN-REPAIR") || status.includes("IN REPAIR") || tech.includes("IN REPAIR")) return "info";
  if (status.includes("PENDING") || tech.includes("PENDING")) return "warning";

  return "neutral";
}

// ✅ fix: αν status === technical_status -> δείξε μόνο ένα (πχ "Completed")
function buildBadgeText(statusRaw, techRaw) {
  const statusN = normalize(statusRaw);
  const techN = normalize(techRaw);

  const statusPretty = prettyStatus(statusRaw);
  const techPretty = prettyStatus(techRaw);

  if (!techRaw) return statusPretty;
  if (techN && statusN === techN) return statusPretty;

  return `${statusPretty} • ${techPretty}`;
}

function StatusBadge({ ticket }) {
  const theme = getThemeFromTicket(ticket);
  const text = buildBadgeText(ticket?.status, ticket?.technical_status);

  const cls =
    theme === "success"
      ? style.badgeSuccess
      : theme === "danger"
      ? style.badgeDanger
      : theme === "info"
      ? style.badgeInfo
      : theme === "warning"
      ? style.badgeWarning
      : style.badgeNeutral;

  return <span className={`${style.badge} ${cls}`}>{text}</span>;
}

function ProgressBar({ currentIndex = 0, theme = "neutral" }) {
  return (
    <div className={style.timeline} data-theme={theme}>
      <div className={style.timelineTop}>
        {STEPS.map((s, i) => (
          <div key={s} className={style.topItem}>
            <div
              className={`${style.circle} ${i <= currentIndex ? style.circleActive : ""}`}
              aria-label={s}
              title={s}
            >
              {i <= currentIndex ? "✓" : ""}
            </div>

            {i < STEPS.length - 1 && (
              <div className={`${style.connector} ${i < currentIndex ? style.connectorActive : ""}`} />
            )}
          </div>
        ))}
      </div>

      <div className={style.timelineLabels}>
        {STEPS.map((s, i) => (
          <div key={s} className={`${style.stepLabel} ${i <= currentIndex ? style.stepLabelActive : ""}`}>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

function TicketDetails({ ticket }) {
  if (!ticket) return null;

  const theme = getThemeFromTicket(ticket);
  const stepIndex = getStepIndexFromTicket(ticket);

  const customerName = ticket.customer?.name || "-";
  const productName = ticket.product?.name || "-";

  return (
    <div className={style.resultCard} data-theme={theme}>
      <div className={style.resultHeader}>
        <div>
          <h2 className={style.resultTitle}>RMA Status</h2>
          <p className={style.resultSub}>
            RMA: <b>{ticket.rma}</b>
          </p>
        </div>

        <StatusBadge ticket={ticket} />
      </div>

      <ProgressBar currentIndex={stepIndex} theme={theme} />

      <div className={style.detailsGrid}>
        <div className={style.field}>
          <div className={style.fieldLabel}>Customer</div>
          <div className={style.fieldValue}>{customerName}</div>
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
          <div className={style.fieldValue}>{productName}</div>
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
          <div className={style.fieldLabel}>Created At</div>
          <div className={style.fieldValue}>
            {formatDate(ticket.created_at || ticket.createdAt || ticket.date)}
          </div>
        </div>
      </div>

      <div className={style.block}>
        <div className={style.blockLabel}>Issue</div>
        <div className={style.blockValue}>{ticket.issue || "-"}</div>
      </div>

      <div className={style.block}>
        <div className={style.blockLabel}>Notes</div>
        <div className={style.blockValue}>{ticket.notes || "-"}</div>
      </div>
    </div>
  );
}

export default function CustomerViewRequestApp() {
  const [tab, setTab] = useState("track"); // "new" | "track" | "list" | "notifications"

  const [tickets, setTickets] = useState([]);
  const ticketsMemo = useMemo(() => tickets || [], [tickets]);

  // Track RMA
  const [rma, setRma] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [ticket, setTicket] = useState(null);

  // Notifications dropdown (όπως “παλιά” — μόνο dropdown)
  const [notifOpen, setNotifOpen] = useState(false);
  const notifWrapRef = useRef(null);

  const clearMessages = () => {
    setErrorMsg("");
    setInfoMsg("");
  };

  async function loadTickets() {
    const res = await fetch(`${API_BASE}/tickets`);
    if (!res.ok) throw new Error("Failed to load tickets");
    const data = await res.json();
    const arr = Array.isArray(data) ? data : [];
    setTickets(arr);
    return arr;
  }

  useEffect(() => {
    (async () => {
      try {
        await loadTickets();
      } catch {
        // no spam on mount
      }
    })();
  }, []);

  // close dropdown when clicking outside
  useEffect(() => {
    function onDocDown(e) {
      if (!notifWrapRef.current) return;
      if (!notifWrapRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  const notifications = useMemo(() => {
    const sorted = [...ticketsMemo].sort((a, b) => getTicketUpdatedAtMs(b) - getTicketUpdatedAtMs(a));
    return sorted.map((t) => ({
      id: t.id,
      rma: t.rma,
      when: formatDate(t.last_updated || t.created_at || t.date),
      label: buildBadgeText(t.status, t.technical_status),
      ticket: t,
      theme: getThemeFromTicket(t),
    }));
  }, [ticketsMemo]);

  const handleSearch = async (e) => {
    e.preventDefault();

    const query = normalize(rma);
    clearMessages();
    setTicket(null);

    if (!query) {
      setErrorMsg("Please enter an RMA number.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/tickets?rma=${encodeURIComponent(query)}`);
      if (res.ok) {
        const arr = await res.json();
        const found = Array.isArray(arr) && arr.length ? arr[0] : null;
        if (found) {
          setTicket(found);
          setInfoMsg("Ticket loaded successfully.");
          setLoading(false);
          return;
        }
      }

      const foundLocal = ticketsMemo.find((x) => normalize(x.rma) === query);
      if (!foundLocal) {
        setErrorMsg("No ticket found for this RMA number.");
      } else {
        setTicket(foundLocal);
        setInfoMsg("Ticket loaded successfully.");
      }
    } catch {
      setErrorMsg("Could not connect to server. Is json-server running on :4000?");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setRma("");
    setLoading(false);
    clearMessages();
    setTicket(null);
  };

  const openNew = () => setTab("new");
  const openTrack = () => setTab("track");
  const openList = () => setTab("list");

  const handlePickTicket = (t) => {
    setNotifOpen(false);
    setTicket(t);
    setRma(t.rma);
    clearMessages();
    setInfoMsg("Ticket loaded successfully.");
    setTab("track");
  };

  const openNotificationsPage = () => {
    setNotifOpen(false);
    setTab("notifications");
  };

  return (
    <div className={style.page}>
      <header className={style.portalHeader}>
        <div>
          <h1 className={style.portalTitle}>Customer Portal</h1>
          <p className={style.portalSubtitle}>Track the progress of your requests</p>
        </div>

        <div className={style.portalActions}>
          <button
            className={`${style.tabBtn} ${tab === "new" ? style.tabBtnActive : ""}`}
            onClick={openNew}
            type="button"
          >
            New Request
          </button>

          <button
            className={`${style.tabBtn} ${tab === "track" ? style.tabBtnActive : ""}`}
            onClick={openTrack}
            type="button"
          >
            Track RMA
          </button>

          <button
            className={`${style.tabBtn} ${tab === "list" ? style.tabBtnActive : ""}`}
            onClick={openList}
            type="button"
          >
            View My Requests
          </button>

          {/* ✅ Dropdown box όπως πριν: ανοίγει/κλείνει και δείχνει λίστα + View all */}
          <div className={style.notifWrap} ref={notifWrapRef}>
            <button
              className={`${style.tabBtn} ${notifOpen || tab === "notifications" ? style.tabBtnActive : ""}`}
              onClick={() => setNotifOpen((p) => !p)}
              type="button"
              aria-haspopup="menu"
              aria-expanded={notifOpen ? "true" : "false"}
              title="Notifications"
            >
              <span className={style.bell} aria-hidden="true">🔔</span> Notifications
            </button>

            {notifOpen && (
              <div className={style.dropdown} role="menu">
                {notifications.length === 0 ? (
                  <div className={style.dropdownEmpty}>No notifications yet.</div>
                ) : (
                  <>
                    {notifications.slice(0, 4).map((n) => {
                      const dotCls =
                        n.theme === "success"
                          ? style.dropdownDotSuccess
                          : n.theme === "danger"
                          ? style.dropdownDotDanger
                          : n.theme === "info"
                          ? style.dropdownDotInfo
                          : n.theme === "warning"
                          ? style.dropdownDotWarning
                          : style.dropdownDotNeutral;

                      return (
                        <button
                          key={n.id ?? n.rma}
                          className={style.dropdownItem}
                          type="button"
                          onClick={() => handlePickTicket(n.ticket)}
                          role="menuitem"
                        >
                          <span className={`${style.dropdownDot} ${dotCls}`} aria-hidden="true" />
                          <span className={style.dropdownMain}>
                            <span className={style.dropdownTitle}>{n.rma}</span>
                            <span className={style.dropdownSub}>{n.label}</span>
                          </span>
                          <span className={style.dropdownWhen}>{n.when}</span>
                        </button>
                      );
                    })}

                    <button
                      className={style.dropdownViewAll}
                      type="button"
                      onClick={openNotificationsPage}
                      role="menuitem"
                    >
                      View all →
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {tab === "new" && (
        <div className={style.newWrap}>
          <h2 className={style.sectionTitle}>New Request</h2>
          {/* εδώ θα κουμπώσει η φόρμα του συναδέλφου */}
          <CustomerFormApp />
        </div>
      )}

      {tab === "track" && (
        <>
          <div className={style.searchCard}>
            <h2 className={style.sectionTitle}>Track your RMA</h2>

            <form className={style.form} onSubmit={handleSearch}>
              <label className={style.label}>
                RMA Number
                <input
                  className={style.input}
                  type="text"
                  placeholder="e.g. RMA-002"
                  value={rma}
                  onChange={(e) => setRma(e.target.value)}
                  disabled={loading}
                />
              </label>

              <div className={style.actions}>
                <button className={style.primaryBtn} type="submit" disabled={loading}>
                  {loading ? "Searching..." : "Search"}
                </button>

                <button className={style.secondaryBtn} type="button" onClick={handleClear}>
                  Clear
                </button>
              </div>
            </form>

            {errorMsg && <div className={style.alertError}>{errorMsg}</div>}
            {infoMsg && <div className={style.alertOk}>{infoMsg}</div>}
          </div>

          <TicketDetails ticket={ticket} />
        </>
      )}

      {tab === "list" && (
        <div className={style.listWrap}>
          <div className={style.listHeaderRow}>
            <h2 className={style.sectionTitle}>My Requests</h2>
            <button
              type="button"
              className={style.secondaryBtn}
              onClick={async () => {
                clearMessages();
                try {
                  setLoading(true);
                  await loadTickets();
                  setInfoMsg("Tickets refreshed.");
                } catch {
                  setErrorMsg("Could not refresh tickets.");
                } finally {
                  setLoading(false);
                }
              }}
            >
              Refresh
            </button>
          </div>

          {errorMsg && <div className={style.alertError}>{errorMsg}</div>}
          {infoMsg && <div className={style.alertOk}>{infoMsg}</div>}

          <div className={style.cardsGrid}>
            {ticketsMemo.map((t) => {
              const theme = getThemeFromTicket(t);
              const badgeCls =
                theme === "success"
                  ? style.badgeSmallSuccess
                  : theme === "danger"
                  ? style.badgeSmallDanger
                  : theme === "info"
                  ? style.badgeSmallInfo
                  : theme === "warning"
                  ? style.badgeSmallWarning
                  : style.badgeSmallNeutral;

              return (
                <button
                  key={t.id || t.rma}
                  type="button"
                  className={style.requestCard}
                  onClick={() => handlePickTicket(t)}
                >
                  <div className={style.cardTop}>
                    <div className={style.cardTitle}>{t.product?.name || "Product"}</div>
                    <span className={`${style.badgeSmall} ${badgeCls}`}>{prettyStatus(t.status)}</span>
                  </div>

                  <div className={style.cardMeta}>
                    <div>
                      <span className={style.metaLabel}>RMA:</span> {t.rma}
                    </div>
                    <div>
                      <span className={style.metaLabel}>Customer:</span> {t.customer?.name || "-"}
                    </div>
                  </div>

                  <div className={style.cardIssue}>
                    <span className={style.metaLabel}>Issue:</span> {t.issue || "-"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {tab === "notifications" && (
        <div className={style.newWrap}>
          <h2 className={style.sectionTitle}>Notifications</h2>

          {notifications.length === 0 ? (
            <div className={style.blockValueMuted}>No notifications available.</div>
          ) : (
            <div className={style.notifList}>
              {notifications.map((n) => (
                <button
                  key={n.id ?? n.rma}
                  type="button"
                  className={style.notifRow}
                  onClick={() => handlePickTicket(n.ticket)}
                >
                  <div className={style.notifLeft}>
                    <div className={style.notifTitle}>{n.rma}</div>
                    <div className={style.notifSub}>{n.label}</div>
                  </div>
                  <div className={style.notifWhen}>{n.when}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import style from "./CustomerViewRequestApp.module.css";
import CustomerFormApp from "../../components/CustomerFormApp/CustomerFormApp.jsx";

const API_URL = import.meta.env.VITE_API_URL;

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

  const status = normalize(t.status);
  const tech = normalize(t.technical_status);

  if (status.includes("COMPLETED") || tech.includes("COMPLETED") || tech.includes("CLOSED")) return 3;
  if (status.includes("IN-REPAIR") || status.includes("IN REPAIR") || tech.includes("IN REPAIR")) return 2;
  if (tech.includes("APPROVED")) return 1;

  // Rejected: σταματάει στο step "Approved" αλλά με danger theme
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

function getTechTheme(techRaw) {
  const tech = normalize(techRaw);
  if (!techRaw) return "neutral";
  if (tech.includes("APPROV")) return "success";
  if (tech.includes("REJECT")) return "danger";
  if (tech.includes("IN REPAIR")) return "info";
  if (tech.includes("PENDING")) return "warning";
  return "neutral";
}

function ThemeBadge({ theme = "neutral", children, variant = "solid", title }) {
  const cls =
    theme === "success"
      ? variant === "solid"
        ? style.badgeSuccess
        : style.badgeSoftSuccess
      : theme === "danger"
      ? variant === "solid"
        ? style.badgeDanger
        : style.badgeSoftDanger
      : theme === "info"
      ? variant === "solid"
        ? style.badgeInfo
        : style.badgeSoftInfo
      : theme === "warning"
      ? variant === "solid"
        ? style.badgeWarning
        : style.badgeSoftWarning
      : variant === "solid"
      ? style.badgeNeutral
      : style.badgeSoftNeutral;

  return (
    <span className={`${style.badge} ${cls}`} title={title}>
      {children}
    </span>
  );
}

function StatusBadge({ ticket }) {
  const statusRaw = ticket?.status;
  const techRaw = ticket?.technical_status;

  const statusText = prettyStatus(statusRaw);
  const techText = prettyStatus(techRaw);

  const mainTheme = getThemeFromTicket(ticket);

  // δείξε τεχνικό badge μόνο αν υπάρχει ΚΑΙ δεν είναι ίδιο με status
  const showTech = Boolean(techRaw) && normalize(techRaw) !== normalize(statusRaw);

  return (
    <div className={style.badgeGroup}>
      <ThemeBadge
        theme={mainTheme}
        variant="solid"
        title="Customer request status (what stage your request is in)"
      >
        {statusText}
      </ThemeBadge>

      {showTech && (
        <ThemeBadge
          theme={getTechTheme(techRaw)}
          variant="soft"
          title="Technical status (internal review / technician update)"
        >
          {techText}
        </ThemeBadge>
      )}
    </div>
  );
}

function ProgressBar({ currentIndex = 0, theme = "neutral" }) {
  const ACCENT = {
    warning: "#f59e0b", // Pending
    info: "#1565c0",    // In Repair
    success: "#2e7d32", // Completed
    danger: "#c62828",  // Rejected
    neutral: "#9ca3af",
  };

  const accent = ACCENT[theme] || ACCENT.neutral;

  return (
    <div className={style.timeline} style={{ "--accent": accent }}>
      <div className={style.timelineTop}>
        {STEPS.map((s, i) => (
          <div key={s} className={style.topItem}>
            <div
              className={`${style.circle} ${i <= currentIndex ? style.circleActive : ""}`}
              title={s}
            >
              {i <= currentIndex ? "✓" : ""}
            </div>

            {i < STEPS.length - 1 && (
              <div
                className={`${style.connector} ${
                  /* ✅ για να φαίνεται χρώμα και στο Pending */
                  i <= currentIndex ? style.connectorActive : ""
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className={style.timelineLabels}>
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`${style.stepLabel} ${i <= currentIndex ? style.stepLabelActive : ""}`}
          >
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
            RMA: <span className={style.emph}>{ticket.rma}</span>
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
          <div className={style.fieldLabel}>Assigned To</div>
          <div className={style.fieldValue}>{ticket.assigned_to || ticket.assignedTo || "-"}</div>
        </div>

        <div className={style.field}>
          <div className={style.fieldLabel}>Last Updated</div>
          <div className={style.fieldValue}>
            {formatDate(ticket.last_updated || ticket.created_at || ticket.date)}
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

function guessUserIdentity() {
  const pick = (k) => {
    const v = localStorage.getItem(k);
    return v && String(v).trim() ? String(v).trim() : null;
  };

  const email =
    pick("userEmail") || pick("customerEmail") || pick("email") || pick("loggedInEmail") || null;

  const name = pick("customerName") || pick("userName") || pick("username") || null;

  return { email, name };
}

function pickProfileTicket(list) {
  if (!list?.length) return null;

  const score = (t) => {
    const fields = [
      t?.customer?.name,
      t?.email,
      t?.phone,
      t?.address,
      t?.owner,
      t?.purchase_date,
      t?.serial_number,
    ];
    const filled = fields.reduce((acc, v) => (v && String(v).trim() ? acc + 1 : acc), 0);
    return filled;
  };

  const sorted = [...list].sort((a, b) => {
    const sa = score(a);
    const sb = score(b);
    if (sb !== sa) return sb - sa; // πιο “γεμάτο” πρώτο
    return getTicketUpdatedAtMs(b) - getTicketUpdatedAtMs(a); // μετά πιο πρόσφατο
  });

  return sorted[0];
}

export default function CustomerViewRequestApp() {
  // Default tab: Profile (όπως ζήτησες)
  const [tab, setTab] = useState("profile"); // "profile" | "new" | "track" | "list"

  const [tickets, setTickets] = useState([]);
  const ticketsMemo = useMemo(() => tickets || [], [tickets]);

  // Track RMA
  const [rma, setRma] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [ticket, setTicket] = useState(null);

  // Notifications dropdown (ΜΕΝΕΙ όπως ήταν: dropdown)
  const [notifOpen, setNotifOpen] = useState(false);
  const notifWrapRef = useRef(null);

  // Profile UI-only edit (δεν πειράζει json)
  const [profileOverride, setProfileOverride] = useState(null);
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileDraft, setProfileDraft] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const clearMessages = () => {
    setErrorMsg("");
    setInfoMsg("");
  };

  async function loadTickets() {
    const res = await fetch(`${API_URL}/tickets`);
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
        // no spam
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

  // My tickets (demo filter)
  const myTickets = useMemo(() => {
    const { email, name } = guessUserIdentity();
    if (!ticketsMemo.length) return [];

    let filtered = ticketsMemo;

    if (email) {
      filtered = ticketsMemo.filter((t) => normalize(t.email) === normalize(email));
    } else if (name) {
      filtered = ticketsMemo.filter((t) => normalize(t.customer?.name) === normalize(name));
    }

    return filtered.length ? filtered : ticketsMemo;
  }, [ticketsMemo]);

  // Ταξινόμηση: open πρώτα, μετά newest
  const sortedMyTickets = useMemo(() => {
    const rank = (t) => {
      const theme = getThemeFromTicket(t);
      if (theme === "warning") return 1; // pending
      if (theme === "info") return 2; // in repair
      if (theme === "success") return 3; // completed
      if (theme === "danger") return 4; // rejected
      return 5;
    };

    return [...myTickets].sort((a, b) => {
      const ra = rank(a);
      const rb = rank(b);
      if (ra !== rb) return ra - rb;
      return getTicketUpdatedAtMs(b) - getTicketUpdatedAtMs(a);
    });
  }, [myTickets]);

  // Notifications dropdown data (από myTickets)
  const notifications = useMemo(() => {
    const sorted = [...myTickets].sort((a, b) => getTicketUpdatedAtMs(b) - getTicketUpdatedAtMs(a));
    return sorted.map((t) => ({
      id: t.id,
      rma: t.rma,
      when: formatDate(t.last_updated || t.created_at || t.date),
      statusText: prettyStatus(t.status),
      techText:
        t.technical_status && normalize(t.technical_status) !== normalize(t.status)
          ? prettyStatus(t.technical_status)
          : "",
      ticket: t,
      theme: getThemeFromTicket(t),
    }));
  }, [myTickets]);

  // Profile: παίρνει ticket με τα ΠΙΟ πολλά στοιχεία (όπως ζήτησες)
  const derivedProfile = useMemo(() => {
    const t = pickProfileTicket(myTickets);
    if (!t) {
      return {
        name: "-",
        email: "-",
        phone: "-",
        address: "-",
        total: 0,
        open: 0,
        lastUpdate: "-",
      };
    }

    const total = myTickets.length;
    const open = myTickets.filter((x) => {
      const th = getThemeFromTicket(x);
      return th !== "success" && th !== "danger";
    }).length;

    return {
      name: t.customer?.name || t.owner || "-",
      email: t.email || "-",
      phone: t.phone || "-",
      address: t.address || "-",
      total,
      open,
      lastUpdate: formatDate(t.last_updated || t.created_at || t.date),
    };
  }, [myTickets]);

  const profile = profileOverride || derivedProfile;

  // όταν ανοίγει profile, γέμισε draft
  useEffect(() => {
    if (tab !== "profile") return;
    setProfileDraft({
      name: profile.name === "-" ? "" : profile.name,
      email: profile.email === "-" ? "" : profile.email,
      phone: profile.phone === "-" ? "" : profile.phone,
      address: profile.address === "-" ? "" : profile.address,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

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
      const res = await fetch(`${API_URL}/tickets?rma=${encodeURIComponent(query)}`);
      if (res.ok) {
        const arr = await res.json();
        const found = Array.isArray(arr) && arr.length ? arr[0] : null;
        if (found) {
          setTicket(found);
          setInfoMsg("Ticket loaded successfully.");
          return;
        }
      }

      const foundLocal = myTickets.find((x) => normalize(x.rma) === query);
      if (!foundLocal) setErrorMsg("No ticket found for this RMA number.");
      else {
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

  const openProfile = () => setTab("profile");
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

  // View all στο dropdown -> ΠΑΕΙ View My Requests (χωρίς extra μπάρα / σελίδα)
  const handleViewAllNotifications = () => {
    setNotifOpen(false);
    setTab("list");
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

          {/* 4o κουμπί: icon-only */}
          <button
            className={`${style.iconBtn} ${tab === "profile" ? style.iconBtnActive : ""}`}
            onClick={openProfile}
            type="button"
            title="My Profile"
            aria-label="My Profile"
          >
            <span className={style.icon} aria-hidden="true">
              👤
            </span>
          </button>

          {/* Notifications dropdown (ΜΟΝΟ dropdown) */}
          <div className={style.notifWrap} ref={notifWrapRef}>
            <button
              className={style.notifButton}
              {/*className={`${style.notifBtn} ${notifOpen ? style.tabBtnActive : ""}`}*/}
              onClick={() => setNotifOpen((p) => !p)}
              type="button"
              aria-haspopup="menu"
              aria-expanded={notifOpen ? "true" : "false"}
              title="Notifications"
            >
              <span className={style.icon} aria-hidden="true">
                🔔
              </span>
              
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
                            <span className={style.dropdownSub}>
                              {n.statusText}
                              {n.techText ? ` • ${n.techText}` : ""}
                            </span>
                          </span>
                          <span className={style.dropdownWhen}>{n.when}</span>
                        </button>
                      );
                    })}

                    <button
                      className={style.dropdownViewAll}
                      type="button"
                      onClick={handleViewAllNotifications}
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

      {/* PROFILE */}
      {tab === "profile" && (
        <div className={style.profileWrap}>
          <div className={style.profileHeaderRow}>
            <h2 className={style.sectionTitle}>My Profile</h2>

            {!profileEditing ? (
              <button
                type="button"
                className={style.profileBtn}
                onClick={() => setProfileEditing(true)}
              >
                Edit
              </button>
            ) : (
              <div className={style.profileActions}>
                <button
                  type="button"
                  className={style.profileBtnPrimary}
                  onClick={() => {
                    setProfileOverride((prev) => ({
                      ...(prev || profile),
                      name: profileDraft.name || "-",
                      email: profileDraft.email || "-",
                      phone: profileDraft.phone || "-",
                      address: profileDraft.address || "-",
                    }));
                    setProfileEditing(false);
                  }}
                >
                  Save
                </button>

                <button
                  type="button"
                  className={style.profileBtnGhost}
                  onClick={() => {
                    setProfileEditing(false);
                    setProfileDraft({
                      name: profile.name === "-" ? "" : profile.name,
                      email: profile.email === "-" ? "" : profile.email,
                      phone: profile.phone === "-" ? "" : profile.phone,
                      address: profile.address === "-" ? "" : profile.address,
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className={style.profileGrid}>
            <div className={style.profileCard}>
              <div className={style.profileLabel}>Name</div>
              {!profileEditing ? (
                <div className={style.profileValue}>{profile.name}</div>
              ) : (
                <input
                  className={style.profileInput}
                  value={profileDraft.name}
                  onChange={(e) => setProfileDraft((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Name"
                />
              )}
            </div>

            <div className={style.profileCard}>
              <div className={style.profileLabel}>Email</div>
              {!profileEditing ? (
                <div className={style.profileValue}>{profile.email}</div>
              ) : (
                <input
                  className={style.profileInput}
                  value={profileDraft.email}
                  onChange={(e) => setProfileDraft((p) => ({ ...p, email: e.target.value }))}
                  placeholder="Email"
                />
              )}
            </div>

            <div className={style.profileCard}>
              <div className={style.profileLabel}>Phone</div>
              {!profileEditing ? (
                <div className={style.profileValue}>{profile.phone}</div>
              ) : (
                <input
                  className={style.profileInput}
                  value={profileDraft.phone}
                  onChange={(e) => setProfileDraft((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="Phone"
                />
              )}
            </div>

            <div className={style.profileCard}>
              <div className={style.profileLabel}>Address</div>
              {!profileEditing ? (
                <div className={style.profileValue}>{profile.address}</div>
              ) : (
                <input
                  className={style.profileInput}
                  value={profileDraft.address}
                  onChange={(e) => setProfileDraft((p) => ({ ...p, address: e.target.value }))}
                  placeholder="Address"
                />
              )}
            </div>

            <div className={style.profileCard}>
              <div className={style.profileLabel}>Total requests</div>
              <div className={style.profileValue}>{profile.total}</div>
            </div>

            <div className={style.profileCard}>
              <div className={style.profileLabel}>Open requests</div>
              <div className={style.profileValue}>{profile.open}</div>
            </div>

            <div className={style.profileCardWide}>
              <div className={style.profileLabel}>Last update</div>
              <div className={style.profileValue}>{profile.lastUpdate}</div>
            </div>
          </div>
        </div>
      )}

      {/* NEW */}
      {tab === "new" && (
        <div className={style.newWrap}>
          <h2 className={style.sectionTitle}>New Request</h2>
          <CustomerFormApp />
        </div>
      )}

      {/* TRACK */}
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

      {/* LIST */}
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
            {sortedMyTickets.map((t) => {
              const theme = getThemeFromTicket(t);

              return (
                <button
                  key={t.id || t.rma}
                  type="button"
                  className={style.requestCard}
                  data-theme={theme}
                  onClick={() => handlePickTicket(t)}
                >
                  <div className={style.cardTop}>
                    {/* category = product name -> ΓΚΡΙ (όπως ζήτησες) */}
                    <div className={style.cardTitle}>{t.product?.name || "Product"}</div>

                    <div className={style.badgeGroup}>
                      <ThemeBadge theme={theme} variant="solid" title="Customer request status (what stage your request is in)">
                        {prettyStatus(t.status)}
                      </ThemeBadge>

                      {t.technical_status && normalize(t.status) !== normalize(t.technical_status) && (
                        <ThemeBadge
                          theme={getTechTheme(t.technical_status)}
                          variant="soft"
                          title="Technical status (internal review / technician update)"
                        >
                          {prettyStatus(t.technical_status)}
                        </ThemeBadge>
                      )}
                    </div>
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
    </div>
  );
}

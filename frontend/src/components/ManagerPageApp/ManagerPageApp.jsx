import { useEffect, useMemo, useState } from "react";
import style from "./ManagerPageApp.module.css";

import { FiTrendingUp } from "react-icons/fi";
import { BsBoxSeam } from "react-icons/bs";
import { AiOutlineClockCircle } from "react-icons/ai";
import { MdOutlinePendingActions } from "react-icons/md";
import { RiCheckboxCircleLine } from "react-icons/ri";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

import StatCard from "./StatCard.jsx";
import ChartCard from "./ChartCard.jsx";
import RecentRmaTable from "./RecentRmaTable.jsx";

// ✅ uses your existing service (json-server on :4000)
import { getAllTickets } from "../../services/employeeTickets";

const PIE_COLORS = ["#22c55e", "#f97316", "#facc15", "#3b82f6", "#ef4444"];

// ---- helpers (safe with your mixed ticket fields) ----
function parseDate(ticket) {
  const raw = ticket.created_at || ticket.last_updated || ticket.date;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function monthLabel(dateObj) {
  return dateObj.toLocaleString("en-US", { month: "short" });
}

function normalizeStatus(s) {
  return (s || "unknown").toString().trim().toLowerCase();
}

function statusLabelForPie(name) {
  // Make pie labels nicer (your DB uses "in-repair", etc.)
  const n = (name || "").toString();
  if (n.toLowerCase() === "in-repair") return "In Repair";
  if (n.toLowerCase() === "pending") return "Pending Review";
  return n.charAt(0).toUpperCase() + n.slice(1);
}

export default function ManagerPageApp() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load tickets from json-server
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await getAllTickets();
        if (mounted) setTickets(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        alert("Failed to load tickets from server (json-server).");
        if (mounted) setTickets([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // ---- Compute dashboard data from tickets ----
  const dashboard = useMemo(() => {
    const totalRMAs = tickets.length;

    const pendingReview = tickets.filter(
      (t) => normalizeStatus(t.status) === "pending"
    ).length;

    const completed = tickets.filter(
      (t) => normalizeStatus(t.status) === "completed"
    ).length;

    // Avg Resolution Time: only if completed & has created_at and last_updated
    const completedDurations = tickets
      .filter(
        (t) =>
          normalizeStatus(t.status) === "completed" &&
          t.created_at &&
          t.last_updated
      )
      .map((t) => {
        const created = new Date(t.created_at);
        const updated = new Date(t.last_updated);
        if (Number.isNaN(created.getTime()) || Number.isNaN(updated.getTime()))
          return null;
        const days = (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        return days >= 0 ? days : null;
      })
      .filter((v) => typeof v === "number");

    const avgResolutionDays =
      completedDurations.length > 0
        ? completedDurations.reduce((a, b) => a + b, 0) / completedDurations.length
        : null;

    // Monthly trend: group by month using created_at/last_updated/date
    const monthMap = new Map(); // month -> {month,total,completed}
    for (const t of tickets) {
      const d = parseDate(t);
      if (!d) continue;
      const m = monthLabel(d);
      if (!monthMap.has(m)) monthMap.set(m, { month: m, total: 0, completed: 0 });

      const row = monthMap.get(m);
      row.total += 1;
      if (normalizeStatus(t.status) === "completed") row.completed += 1;
    }

    // Keep a sensible month order
    const order = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthlyTrend = order
      .filter((m) => monthMap.has(m))
      .map((m) => monthMap.get(m));

    // Status distribution
    const statusCounts = tickets.reduce((acc, t) => {
      const s = normalizeStatus(t.status);
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
    const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
      label: statusLabelForPie(name),
    }));

    // Category distribution (db doesn't have category, so we use product.name)
    const categoryCounts = tickets.reduce((acc, t) => {
      const key = t.product?.category || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const categoryStats = Object.entries(categoryCounts)
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // Recent RMA requests: sort by date desc
    const recentRmas = [...tickets]
      .map((t) => ({ ...t, __d: parseDate(t) }))
      .sort((a, b) => (b.__d?.getTime() || 0) - (a.__d?.getTime() || 0))
      .slice(0, 6)
      .map((t) => ({
        id: t.rma || t.id,
        customer: t.customer?.name || "Unknown",
        product: t.product?.name || "Unknown",
        status: normalizeStatus(t.status),
      }));

    // KPI cards data (trend can be real later; for now keep simple)
    const statCards = [
      { label: "Total RMAs", value: totalRMAs, trend: "Live", icon: <BsBoxSeam /> },
      { label: "Pending Review", value: pendingReview, trend: "Live", icon: <MdOutlinePendingActions /> },
      { label: "Completed", value: completed, trend: "Live", icon: <RiCheckboxCircleLine /> },
      {
        label: "Avg Resolution Time",
        value: avgResolutionDays == null ? "N/A" : `${avgResolutionDays.toFixed(1)} days`,
        trend: "Live",
        icon: <AiOutlineClockCircle />,
      },
    ];

    // Optional: performance metrics (still mock-ish, but you can compute later)
    const performance = [
      { title: "Resolution Rate", value: totalRMAs ? `${((completed / totalRMAs) * 100).toFixed(1)}%` : "N/A", delta: "Based on ticket statuses", accent: "green" },
      { title: "Customer Satisfaction", value: "N/A", delta: "Add ratings later", accent: "blue" },
      { title: "Avg Processing Time", value: avgResolutionDays == null ? "N/A" : `${avgResolutionDays.toFixed(1)} days`, delta: "Completed tickets only", accent: "orange" },
    ];

    return {
      statCards,
      monthlyTrend,
      statusDistribution,
      categoryStats,
      recentRmas,
      performance,
    };
  }, [tickets]);

  if (loading) {
    return (
      <div className={style.container}>
        <header className={style.header}>
          <div className={style.headerIcon}><FiTrendingUp /></div>
          <div>
            <h1 className={style.title}>Manager Dashboard</h1>
            <p className={style.subtitle}>Analytics &amp; Insights</p>
          </div>
        </header>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className={style.container}>
      <header className={style.header}>
        <div className={style.headerIcon}>
          <FiTrendingUp />
        </div>
        <div>
          <h1 className={style.title}>Manager Dashboard</h1>
          <p className={style.subtitle}>Analytics &amp; Insights</p>
        </div>
      </header>

      {/* KPI cards */}
      <section className={style.statsGrid}>
        {dashboard.statCards.map((s) => (
          <StatCard
            key={s.label}
            icon={s.icon}
            label={s.label}
            value={s.value}
            trend={s.trend}
          />
        ))}
      </section>

      {/* Charts row 1 */}
      <section className={style.grid2}>
        <ChartCard title="Monthly RMA Trend">
          <div className={style.chartWrap}>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={dashboard.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="completed" strokeWidth={2} dot />
                <Line type="monotone" dataKey="total" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>

            <div className={style.legendHint}>
              <span>Completed</span>
              <span>Total Requests</span>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Status Distribution">
          <div className={style.chartWrap}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={dashboard.statusDistribution}
                  dataKey="value"
                  nameKey="label"
                  outerRadius={90}
                  label
                >
                  {dashboard.statusDistribution.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </section>

      {/* Charts row 2 */}
      <section className={style.grid2}>
        <ChartCard title="RMAs by Product">
          <div className={style.chartWrap}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dashboard.categoryStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Recent RMA Requests">
          <RecentRmaTable rows={dashboard.recentRmas} />
        </ChartCard>
      </section>

      {/* Performance metrics */}
      <section className={style.performanceCard}>
        <h2 className={style.performanceTitle}>Performance Metrics</h2>
        <div className={style.performanceGrid}>
          {dashboard.performance.map((m) => (
            <div
              key={m.title}
              className={`${style.metric} ${style["accent_" + m.accent]}`}
            >
              <div className={style.metricTitle}>{m.title}</div>
              <div className={style.metricValue}>{m.value}</div>
              <div className={style.metricDelta}>{m.delta}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

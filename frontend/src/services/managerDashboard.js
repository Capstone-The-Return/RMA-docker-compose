import { getAllTickets } from "./employeeTickets";

function parseDate(t) {
  const raw = t.created_at || t.last_updated || t.date;
  const d = raw ? new Date(raw) : null;
  return d && !isNaN(d) ? d : null;
}

export async function getManagerDashboardData() {
  const tickets = await getAllTickets();

  // KPIs
  const totalRMAs = tickets.length;
  const pendingReview = tickets.filter(t => t.status === "pending").length;
  const completed = tickets.filter(t => t.status === "completed").length;

  // Avg resolution time
  const durations = tickets
    .filter(t => t.status === "completed" && t.created_at && t.last_updated)
    .map(t =>
      (new Date(t.last_updated) - new Date(t.created_at)) / (1000 * 60 * 60 * 24)
    );

  const avgResolutionDays =
    durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : null;

  // Monthly trend
  const monthMap = {};
  tickets.forEach(t => {
    const d = parseDate(t);
    if (!d) return;
    const m = d.toLocaleString("en-US", { month: "short" });
    if (!monthMap[m]) monthMap[m] = { month: m, total: 0, completed: 0 };
    monthMap[m].total++;
    if (t.status === "completed") monthMap[m].completed++;
  });

  const monthlyTrend = Object.values(monthMap);

  // Status distribution
  const statusDistribution = Object.entries(
    tickets.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Category (using product.name)
  const categoryStats = Object.entries(
    tickets.reduce((acc, t) => {
      const key = t.product?.name || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).map(([category, value]) => ({ category, value }));

  // Recent RMAs
  const recentRmas = [...tickets]
    .map(t => ({ ...t, __d: parseDate(t) }))
    .sort((a, b) => (b.__d?.getTime() || 0) - (a.__d?.getTime() || 0))
    .slice(0, 6)
    .map(t => ({
      id: t.rma || t.id,
      customer: t.customer?.name || "Unknown",
      product: t.product?.name || "Unknown",
      status: t.status,
    }));

  return {
    stats: { totalRMAs, pendingReview, completed, avgResolutionDays },
    monthlyTrend,
    statusDistribution,
    categoryStats,
    recentRmas,
  };
}

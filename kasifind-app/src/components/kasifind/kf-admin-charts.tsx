"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import type { AdminDashboardStats } from "@/lib/kasifind/admin-stats";
import { formatKfChartDay } from "@/lib/kasifind/format-datetime";

const CHART_COLORS = ["#0F4D3A", "#FF8A00", "#F6C945", "#2d6a4f", "#40916c", "#95d5b2"];

function truncateLabel(value: string, maxLen: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, maxLen - 1)}…`;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; payload?: { name?: string; fullName?: string } }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  const title = row?.fullName ?? row?.name ?? label ?? payload[0]?.name ?? "";
  const value = payload[0]?.value;
  return (
    <div className="kf-admin-chart-tooltip">
      <p className="kf-admin-chart-tooltip-title">{title}</p>
      {value !== undefined ? <p className="kf-admin-chart-tooltip-value">{value}</p> : null}
    </div>
  );
}

export function KfAdminCharts({ charts }: { charts: AdminDashboardStats["charts"] }) {
  const activityData = charts.dailySeries.map((d) => ({
    ...d,
    label: formatKfChartDay(d.date),
  }));
  const signupData = charts.signupSeries.map((d) => ({
    ...d,
    label: formatKfChartDay(d.date),
  }));

  const topListingsChart = charts.topListings.map((row) => ({
    ...row,
    fullName: row.name,
    shortName: truncateLabel(row.name, 26),
  }));
  const topListingsHeight = Math.min(420, Math.max(260, topListingsChart.length * 38));

  const categoryPie = charts.clicksByCategory.map((row) => ({
    ...row,
    fullName: row.name,
    shortName: truncateLabel(row.name, 22),
  }));

  const chartMargin = { top: 8, right: 12, left: 4, bottom: 4 };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="kf-admin-chart-card">
        <h3 className="kf-admin-chart-title">Listing views & clicks (14 days)</h3>
        {activityData.length === 0 ? (
          <p className="kf-admin-empty-chart">No activity recorded yet.</p>
        ) : (
          <div className="kf-admin-chart-plot">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={activityData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15, 77, 58, 0.12)" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={32} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="views" stroke="#0F4D3A" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="clicks" stroke="#FF8A00" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="kf-admin-chart-card">
        <h3 className="kf-admin-chart-title">New registrations (30 days)</h3>
        {signupData.length === 0 ? (
          <p className="kf-admin-empty-chart">No sign-ups in this period.</p>
        ) : (
          <div className="kf-admin-chart-plot">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={signupData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15, 77, 58, 0.12)" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={32} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" fill="#0F4D3A" radius={[4, 4, 0, 0]} name="Sign-ups" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="kf-admin-chart-card kf-admin-chart-card--wide">
        <h3 className="kf-admin-chart-title">Top viewed listings</h3>
        {topListingsChart.length === 0 ? (
          <p className="kf-admin-empty-chart">Views will appear as people browse listings.</p>
        ) : (
          <div className="kf-admin-chart-plot">
            <ResponsiveContainer width="100%" height={topListingsHeight}>
              <BarChart
                data={topListingsChart}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15, 77, 58, 0.12)" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="shortName"
                  width={118}
                  tick={{ fontSize: 10, fill: "#4b5563" }}
                  interval={0}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const row = payload[0]?.payload as { fullName?: string; views?: number };
                    return (
                      <ChartTooltip
                        active
                        payload={[
                          {
                            payload: { fullName: row.fullName, name: row.fullName },
                            value: row.views,
                          },
                        ]}
                      />
                    );
                  }}
                />
                <Bar dataKey="views" fill="#FF8A00" radius={[0, 4, 4, 0]} name="Views" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="kf-admin-chart-card">
        <h3 className="kf-admin-chart-title">Search & category activity</h3>
        {categoryPie.length === 0 ? (
          <p className="kf-admin-empty-chart">Category browse events will show here.</p>
        ) : (
          <>
            <div className="kf-admin-chart-plot kf-admin-chart-plot--pie">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                  <Pie
                    data={categoryPie}
                    dataKey="count"
                    nameKey="shortName"
                    cx="50%"
                    cy="44%"
                    outerRadius={72}
                    innerRadius={28}
                    paddingAngle={2}
                    label={false}
                    labelLine={false}
                  >
                    {categoryPie.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const row = payload[0]?.payload as { fullName?: string; count?: number };
                      return (
                        <ChartTooltip
                          active
                          payload={[
                            {
                              payload: { fullName: row.fullName, name: row.fullName },
                              value: row.count,
                            },
                          ]}
                        />
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="kf-admin-chart-legend-list" aria-label="Category breakdown">
              {categoryPie.map((row, i) => {
                const total = categoryPie.reduce((sum, r) => sum + r.count, 0);
                const pct = total > 0 ? Math.round((row.count / total) * 100) : 0;
                return (
                  <li key={row.name}>
                    <span
                      className="kf-admin-chart-legend-swatch"
                      style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 truncate" title={row.fullName}>
                      {row.fullName}
                    </span>
                    <span className="kf-admin-chart-legend-meta">
                      {row.count} · {pct}%
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

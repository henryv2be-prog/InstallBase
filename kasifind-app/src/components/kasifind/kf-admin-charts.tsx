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

export function KfAdminCharts({ charts }: { charts: AdminDashboardStats["charts"] }) {
  const activityData = charts.dailySeries.map((d) => ({
    ...d,
    label: formatKfChartDay(d.date),
  }));
  const signupData = charts.signupSeries.map((d) => ({
    ...d,
    label: formatKfChartDay(d.date),
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="kf-admin-chart-card">
        <h3 className="kf-admin-chart-title">Listing views & clicks (14 days)</h3>
        {activityData.length === 0 ? (
          <p className="kf-admin-empty-chart">No activity recorded yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8ebe6" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="views" stroke="#0F4D3A" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="clicks" stroke="#FF8A00" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="kf-admin-chart-card">
        <h3 className="kf-admin-chart-title">New registrations (30 days)</h3>
        {signupData.length === 0 ? (
          <p className="kf-admin-empty-chart">No sign-ups in this period.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={signupData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8ebe6" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#0F4D3A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="kf-admin-chart-card">
        <h3 className="kf-admin-chart-title">Top viewed listings</h3>
        {charts.topListings.length === 0 ? (
          <p className="kf-admin-empty-chart">Views will appear as people browse listings.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={charts.topListings} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8ebe6" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="views" fill="#FF8A00" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="kf-admin-chart-card">
        <h3 className="kf-admin-chart-title">Search & category activity</h3>
        {charts.clicksByCategory.length === 0 ? (
          <p className="kf-admin-empty-chart">Category browse events will show here.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={charts.clicksByCategory}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {charts.clicksByCategory.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

import { formatKfDateTime } from "@/lib/kasifind/format-datetime";

export type KfContactClickLogRow = {
  id: string;
  contactLabel: string;
  createdAt: string;
  identityLabel: string;
  identityDetail: string | null;
};

type Props = {
  rows: KfContactClickLogRow[];
  title?: string;
  emptyMessage?: string;
  className?: string;
};

export function KfContactClickLog({
  rows,
  title = "Contact click log",
  emptyMessage = "No contact taps recorded yet. When someone taps WhatsApp, call, or directions on your listing, they appear here.",
  className = "",
}: Props) {
  return (
    <section className={className}>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-[var(--kf-muted)]">
        Each tap is logged with time and visitor. Logged-in users show name or email; anonymous
        visitors show a stable visitor ID from their browser cookie.
      </p>
      <div className="kf-admin-table-wrap mt-3">
        <table className="kf-admin-data-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Contact</th>
              <th>Who clicked</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-6 text-center text-sm text-[var(--kf-muted)]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td className="whitespace-nowrap text-xs text-[var(--kf-muted)]">
                    {formatKfDateTime(row.createdAt)}
                  </td>
                  <td className="text-sm font-medium">{row.contactLabel}</td>
                  <td className="text-sm">
                    <span>{row.identityLabel}</span>
                    {row.identityDetail ? (
                      <span className="mt-0.5 block text-xs text-[var(--kf-muted)]">
                        {row.identityDetail}
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

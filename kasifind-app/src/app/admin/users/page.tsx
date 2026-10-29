import Link from "next/link";
import { getAdminUsersPage } from "@/lib/kasifind/admin-users";
import { kfAdminDeleteUserAction, kfAdminUpdateUserAction } from "@/lib/kasifind/admin-actions";
import { KfAdminDeleteButton } from "@/components/kasifind/kf-admin-delete-button";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AdminUsersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const role = typeof sp.role === "string" ? sp.role : "";
  const suspended = typeof sp.suspended === "string" ? sp.suspended : "";
  const page = typeof sp.page === "string" ? Number.parseInt(sp.page, 10) : 1;

  const data = await getAdminUsersPage({ q, role, suspended, page });

  const buildQuery = (overrides: Record<string, string>) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (role) params.set("role", role);
    if (suspended) params.set("suspended", suspended);
    for (const [k, v] of Object.entries(overrides)) params.set(k, v);
    const s = params.toString();
    return s ? `?${s}` : "";
  };

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="kf-admin-section-title">Users</h2>
          <p className="text-sm text-[var(--kf-muted)]">{data.total} accounts</p>
        </div>
        <Link href="/admin/export/users" className="kf-btn kf-btn-outline text-sm">
          Export CSV
        </Link>
      </div>

      <form method="get" className="kf-admin-filters">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name or email…"
          className="kf-input"
          aria-label="Search users"
        />
        <select name="role" defaultValue={role} className="kf-input" aria-label="Filter by role">
          <option value="">All roles</option>
          <option value="PROVIDER">Provider</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select name="suspended" defaultValue={suspended} className="kf-input" aria-label="Filter by status">
          <option value="">Any status</option>
          <option value="false">Active</option>
          <option value="true">Suspended</option>
        </select>
        <button type="submit" className="kf-btn kf-btn-primary">
          Filter
        </button>
      </form>

      <div className="kf-admin-table-wrap">
        <table className="kf-admin-data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Listing</th>
              <th>Joined</th>
              <th>Last active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-sm text-[var(--kf-muted)]">
                  No users match your filters.
                </td>
              </tr>
            ) : (
              data.rows.map((u) => (
                <tr key={u.id}>
                  <td>
                    <p className="font-medium">{u.name ?? "—"}</p>
                    <p className="text-xs text-[var(--kf-muted)]">{u.email}</p>
                  </td>
                  <td>{u.role}</td>
                  <td>{u.suspended ? "Suspended" : "Active"}</td>
                  <td className="text-sm">
                    {u.listing ? (
                      <Link href={`/admin/listings/${u.listing.id}`} className="underline">
                        {u.listing.displayName}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="whitespace-nowrap text-xs">
                    {new Date(u.createdAt).toLocaleDateString("en-ZA")}
                  </td>
                  <td className="whitespace-nowrap text-xs">
                    {u.lastSeenAt ? new Date(u.lastSeenAt).toLocaleString("en-ZA") : "—"}
                  </td>
                  <td>
                    <details className="kf-admin-details">
                      <summary className="cursor-pointer text-sm font-medium text-[var(--kf-forest)]">
                        Manage
                      </summary>
                      <div className="mt-2 space-y-2 rounded-lg border border-[var(--kf-border)] bg-[var(--kf-ivory)] p-3">
                        <form action={kfAdminUpdateUserAction} className="space-y-2">
                          <input type="hidden" name="userId" value={u.id} />
                          <label className="block text-xs">
                            Role
                            <select name="role" defaultValue={u.role} className="kf-input mt-1 text-sm">
                              <option value="PROVIDER">Provider</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                          </label>
                          <label className="block text-xs">
                            Status
                            <select
                              name="suspended"
                              defaultValue={u.suspended ? "true" : "false"}
                              className="kf-input mt-1 text-sm"
                            >
                              <option value="false">Active</option>
                              <option value="true">Suspended</option>
                            </select>
                          </label>
                          <button type="submit" className="kf-btn kf-btn-primary w-full text-xs">
                            Save changes
                          </button>
                        </form>
                        <KfAdminDeleteButton
                          action={kfAdminDeleteUserAction}
                          hiddenFields={{ userId: u.id }}
                          label="Delete user"
                          confirmMessage="Delete this user and their listing permanently?"
                        />
                      </div>
                    </details>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="flex gap-2 text-sm">
          {data.page > 1 ? (
            <Link href={`/admin/users${buildQuery({ page: String(data.page - 1) })}`} className="underline">
              Previous
            </Link>
          ) : null}
          <span className="text-[var(--kf-muted)]">
            Page {data.page} of {totalPages}
          </span>
          {data.page < totalPages ? (
            <Link href={`/admin/users${buildQuery({ page: String(data.page + 1) })}`} className="underline">
              Next
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

import { getKasiFindPrisma } from "@/lib/kasifind/prisma";
import {
  kfAdminDeleteCategoryAction,
  kfAdminUpsertCategoryAction,
} from "@/lib/kasifind/admin-actions";
import { KfAdminDeleteButton } from "@/components/kasifind/kf-admin-delete-button";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const kf = getKasiFindPrisma();
  const categories = await kf.kfCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { listings: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="kf-admin-section-title">Categories</h2>
        <p className="text-sm text-[var(--kf-muted)]">Used in search filters and listing setup.</p>
      </div>

      <form action={kfAdminUpsertCategoryAction} className="kf-card grid gap-3 p-4 sm:grid-cols-4">
        <label className="text-sm">
          Name
          <input name="name" required className="kf-input mt-1" placeholder="Plumbing" />
        </label>
        <label className="text-sm">
          Slug
          <input name="slug" required className="kf-input mt-1" placeholder="plumbing" />
        </label>
        <label className="text-sm">
          Sort order
          <input name="sortOrder" type="number" defaultValue={0} className="kf-input mt-1" />
        </label>
        <div className="flex items-end">
          <button type="submit" className="kf-btn kf-btn-primary w-full">
            Add category
          </button>
        </div>
      </form>

      <div className="kf-admin-table-wrap">
        <table className="kf-admin-data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Listings</th>
              <th>Sort</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td colSpan={5} className="p-0">
                  <form action={kfAdminUpsertCategoryAction} className="grid gap-2 border-b border-[var(--kf-border)] p-3 sm:grid-cols-[1fr_1fr_auto_auto_auto] sm:items-center">
                    <input type="hidden" name="id" value={c.id} />
                    <input name="name" defaultValue={c.name} className="kf-input text-sm" required />
                    <input name="slug" defaultValue={c.slug} className="kf-input text-sm" required />
                    <span className="text-sm text-center">{c._count.listings}</span>
                    <input
                      name="sortOrder"
                      type="number"
                      defaultValue={c.sortOrder}
                      className="kf-input w-20 text-sm"
                    />
                    <div className="flex flex-col gap-1 sm:flex-row">
                      <button type="submit" className="kf-btn kf-btn-outline text-xs">
                        Save
                      </button>
                      <KfAdminDeleteButton
                        action={kfAdminDeleteCategoryAction}
                        hiddenFields={{ id: c.id }}
                        label="Delete"
                        confirmMessage="Delete this category?"
                      />
                    </div>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

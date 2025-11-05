export default function InventoryPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900">Inventory workspace</h2>
      <p className="text-slate-600">
        Manage products, suppliers, purchase orders, and stock audits. Connect this view to Supabase tables using
        Prisma or the Supabase client for multi-tenant queries.
      </p>
    </section>
  );
}

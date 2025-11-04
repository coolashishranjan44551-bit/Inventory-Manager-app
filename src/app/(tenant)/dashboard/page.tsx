export default function TenantDashboardPage() {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Outlet overview</h2>
      <p className="text-slate-600">
        This route will host authenticated tenant dashboards. Wire Supabase auth middleware to guard access and
        hydrate data with Prisma queries against the multi-tenant schema.
      </p>
    </section>
  );
}

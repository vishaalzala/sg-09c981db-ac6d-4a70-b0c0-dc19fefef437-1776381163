import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";
import { WofPortalLayout } from "@/components/wof/WofPortalLayout";
import { Button } from "@/components/ui/button";

export default function WofHistoryPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState("");
  const [inspections, setInspections] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [inspector, setInspector] = useState("all");

  useEffect(() => {
    (async () => {
      const company = await companyService.getCurrentCompany();
      if (!company) return;
      setCompanyId(company.id);
      const { data } = await supabase
        .from("wof_inspections")
        .select(`*, vehicle:vehicles!wof_inspections_vehicle_id_fkey(registration_number, make, model, year), customer:customers!wof_inspections_customer_id_fkey(name)`)
        .eq("company_id", company.id)
        .order("created_at", { ascending: false });
      setInspections((data as any[]) || []);
    })();
  }, []);

  const inspectorNames = useMemo(() => Array.from(new Set(inspections.map((i) => i.inspector_name).filter(Boolean))), [inspections]);
  const filtered = inspections.filter((inspection) => {
    const haystack = `${inspection.rego || inspection.vehicle?.registration_number || ""} ${inspection.vehicle?.year || ""} ${inspection.vehicle?.make || ""} ${inspection.vehicle?.model || ""} ${inspection.customer?.name || ""}`.toLowerCase();
    if (search && !haystack.includes(search.toLowerCase())) return false;
    if (status !== "all") {
      if (status === "in_progress" && inspection.status !== "in_progress") return false;
      if (status === "completed" && inspection.status !== "completed") return false;
      if (status === "pass" && inspection.overall_result !== "pass") return false;
      if (status === "fail" && inspection.overall_result !== "fail") return false;
    }
    if (inspector !== "all" && inspection.inspector_name !== inspector) return false;
    return true;
  });

  return (
    <WofPortalLayout>
      <section className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm mt-2">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-[24px] font-bold">Previous WOF Inspections</h2>
            <p className="mt-1 text-slate-500">Review completed, failed, or in-progress WOF checks for this company only.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input className="h-[46px] w-[260px] rounded-[14px] border border-slate-300 px-4" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by rego, customer, vehicle..." />
            <select className="h-[46px] w-[170px] rounded-[14px] border border-slate-300 px-4" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="pass">Pass</option>
              <option value="fail">Fail</option>
            </select>
            <select className="h-[46px] w-[170px] rounded-[14px] border border-slate-300 px-4" value={inspector} onChange={(e) => setInspector(e.target.value)}>
              <option value="all">All Inspectors</option>
              {inspectorNames.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="text-left text-[13px] uppercase tracking-[0.04em] text-slate-500">
                <th className="py-4">Rego</th><th className="py-4">Vehicle</th><th className="py-4">Customer</th><th className="py-4">Inspector</th><th className="py-4">Date</th><th className="py-4">Status</th><th className="py-4">Result</th><th className="py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td className="py-12 text-center text-slate-500" colSpan={8}>No WOF inspections found yet.</td></tr>
              ) : filtered.map((inspection) => {
                const badgeClass = inspection.status === "completed" && inspection.overall_result === "pass"
                  ? "bg-emerald-50 text-emerald-700"
                  : inspection.status === "completed"
                    ? "bg-rose-50 text-rose-600"
                    : "bg-blue-50 text-blue-600";
                return (
                  <tr key={inspection.id} className="border-t border-slate-100">
                    <td className="py-4 font-semibold">{inspection.rego || inspection.vehicle?.registration_number}</td>
                    <td className="py-4">{inspection.vehicle?.year} {inspection.vehicle?.make} {inspection.vehicle?.model}</td>
                    <td className="py-4">{inspection.customer?.name || "-"}</td>
                    <td className="py-4">{inspection.inspector_name || "-"}</td>
                    <td className="py-4">{new Date(inspection.created_at || inspection.inspection_date).toLocaleDateString()}</td>
                    <td className="py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>{inspection.status === "in_progress" ? "In Progress" : "Completed"}</span></td>
                    <td className={`py-4 font-semibold ${inspection.overall_result === "pass" ? "text-emerald-600" : inspection.overall_result === "fail" ? "text-rose-600" : "text-sky-600"}`}>{inspection.overall_result || "Pending"}</td>
                    <td className="py-4">
                      {inspection.status === "in_progress" ? (
                        <Button variant="outline" onClick={() => router.push(`/wof/process?id=${inspection.id}`)}>Continue</Button>
                      ) : (
                        <Button variant="outline" disabled>PDF Phase 2</Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </WofPortalLayout>
  );
}

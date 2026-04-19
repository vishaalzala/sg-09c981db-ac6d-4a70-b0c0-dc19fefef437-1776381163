import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function JobDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [companyId, setCompanyId] = useState<string>("");
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      companyService.getCurrentCompany().then(c => {
        if (c) {
          setCompanyId(c.id);
          loadJob(c.id, id as string);
        }
      });
    }
  }, [id]);

  const loadJob = async (cId: string, jobId: string) => {
    const { data } = await supabase
      .from("jobs")
      .select(`
        *,
        customer:customers!jobs_customer_id_fkey(name, mobile, email),
        vehicle:vehicles!jobs_vehicle_id_fkey(registration_number, make, model)
      `)
      .eq("id", jobId)
      .eq("company_id", cId)
      .single();
    
    setJob(data);
    setLoading(false);
  };

  if (loading) return <LoadingSpinner />;
  if (!job) return <div>Job not found</div>;

  const customer = Array.isArray(job.customer) ? job.customer[0] : job.customer;
  const vehicle = Array.isArray(job.vehicle) ? job.vehicle[0] : job.vehicle;

  return (
    <AppLayout companyId={companyId}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold">Job #{job.job_number || job.id?.slice(0, 8)}</h1>
          <Badge>{job.status}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{customer?.name}</p>
              <p className="text-sm text-muted-foreground">{customer?.mobile}</p>
              <p className="text-sm text-muted-foreground">{customer?.email}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vehicle</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{vehicle?.registration_number}</p>
              <p className="text-sm text-muted-foreground">{vehicle?.make} {vehicle?.model}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-semibold">Title:</span> {job.job_title}
            </div>
            <div>
              <span className="font-semibold">Description:</span> {job.description || "N/A"}
            </div>
            <div>
              <span className="font-semibold">Status:</span> <Badge>{job.status}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
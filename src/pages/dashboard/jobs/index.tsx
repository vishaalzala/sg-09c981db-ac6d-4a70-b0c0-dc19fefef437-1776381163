import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";
import { useRouter } from "next/router";

export default function AllJobs() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string>("");
  const [jobs, setJobs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    companyService.getCurrentCompany().then(c => {
      if (c) {
        setCompanyId(c.id);
        loadJobs(c.id);
      }
    });
  }, []);

  const loadJobs = async (cId: string) => {
    const { data } = await supabase
      .from("jobs")
      .select(`
        *,
        customer:customers!jobs_customer_id_fkey(name),
        vehicle:vehicles!jobs_vehicle_id_fkey(registration_number, make, model)
      `)
      .eq("company_id", cId)
      .order("created_at", { ascending: false });
    setJobs(data || []);
  };

  const filteredJobs = jobs.filter(job => {
    if (!searchTerm) return true;
    const customer = Array.isArray(job.customer) ? job.customer[0] : job.customer;
    const vehicle = Array.isArray(job.vehicle) ? job.vehicle[0] : job.vehicle;
    
    return (
      job.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle?.registration_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <AppLayout companyId={companyId}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold">All Jobs</h1>
          <div className="flex gap-2">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => router.push("/dashboard/jobs/new")}>
              <Plus className="h-4 w-4 mr-2" />
              New Job
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>JOB #</TableHead>
                  <TableHead>TITLE</TableHead>
                  <TableHead>CUSTOMER</TableHead>
                  <TableHead>VEHICLE</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>DATE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => {
                  const customer = Array.isArray(job.customer) ? job.customer[0] : job.customer;
                  const vehicle = Array.isArray(job.vehicle) ? job.vehicle[0] : job.vehicle;

                  return (
                    <TableRow
                      key={job.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
                    >
                      <TableCell className="font-medium">#{job.job_number || job.id.slice(0, 8)}</TableCell>
                      <TableCell>{job.job_title}</TableCell>
                      <TableCell>{customer?.name || "N/A"}</TableCell>
                      <TableCell>
                        {vehicle ? `${vehicle.registration_number} - ${vehicle.make} ${vehicle.model}` : "N/A"}
                      </TableCell>
                      <TableCell>{job.status}</TableCell>
                      <TableCell>{new Date(job.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
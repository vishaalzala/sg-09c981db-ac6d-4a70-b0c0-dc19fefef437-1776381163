import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { companyService } from "@/services/companyService";
import { useRouter } from "next/router";

export default function Bookings() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string>("");

  useEffect(() => {
    companyService.getCurrentCompany().then(c => {
      if (c) setCompanyId(c.id);
    });
  }, []);

  return (
    <AppLayout companyId={companyId}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-3xl font-bold">Bookings & Calendar</h1>
          <Button onClick={() => router.push("/dashboard/bookings/new")}>
            <Plus className="h-4 w-4 mr-2" /> New Booking
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No upcoming bookings. Create your first booking to get started!</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
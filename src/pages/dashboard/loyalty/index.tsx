import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { companyService } from "@/services/companyService";

export default function Loyalty() {
  const [companyId, setCompanyId] = useState<string>("");

  useEffect(() => {
    companyService.getCurrentCompany().then(c => {
      if (c) setCompanyId(c.id);
    });
  }, []);

  return (
    <AppLayout companyId={companyId}>
      <div className="p-6">
        <h1 className="font-heading text-3xl font-bold mb-6">Loyalty Program</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Loyalty Members</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No loyalty members yet. Start rewarding your customers!</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
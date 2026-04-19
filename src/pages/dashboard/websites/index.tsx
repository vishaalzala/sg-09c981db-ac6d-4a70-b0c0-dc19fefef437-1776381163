import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { companyService } from "@/services/companyService";

export default function Websites() {
  const [companyId, setCompanyId] = useState<string>("");

  useEffect(() => {
    companyService.getCurrentCompany().then(c => {
      if (c) setCompanyId(c.id);
    });
  }, []);

  return (
    <AppLayout companyId={companyId}>
      <div className="p-6">
        <h1 className="font-heading text-3xl font-bold mb-6">Website Builder</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Workshop Website</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Configure your public-facing website and online booking system here.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
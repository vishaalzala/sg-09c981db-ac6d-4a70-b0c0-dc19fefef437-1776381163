import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function QuoteDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [companyId, setCompanyId] = useState<string>("");
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      companyService.getCurrentCompany().then(c => {
        if (c) {
          setCompanyId(c.id);
          loadQuote(c.id, id as string);
        }
      });
    }
  }, [id]);

  const loadQuote = async (cId: string, quoteId: string) => {
    const { data } = await supabase
      .from("quotes")
      .select(`
        *,
        customer:customers!quotes_customer_id_fkey(name, mobile, email),
        vehicle:vehicles!quotes_vehicle_id_fkey(registration_number, make, model)
      `)
      .eq("id", quoteId)
      .eq("company_id", cId)
      .single();
    
    setQuote(data);
    setLoading(false);
  };

  if (loading) return <LoadingSpinner />;
  if (!quote) return <div>Quote not found</div>;

  const customer = Array.isArray(quote.customer) ? quote.customer[0] : quote.customer;
  const vehicle = Array.isArray(quote.vehicle) ? quote.vehicle[0] : quote.vehicle;

  return (
    <AppLayout companyId={companyId}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold">Quote #{quote.quote_number || quote.id?.slice(0, 8)}</h1>
          <Badge>{quote.status}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{customer?.name}</p>
              <p className="text-sm text-muted-foreground">{customer?.mobile}</p>
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
            <CardTitle>Quote Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <span className="font-semibold">Total Amount:</span>
              <span>${quote.total_amount?.toFixed(2) || "0.00"}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
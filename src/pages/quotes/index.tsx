import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, User, Car, Calendar, DollarSign } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { quoteService } from "@/services/quoteService";
import { companyService } from "@/services/companyService";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";

export default function QuotesPage() {
  const [companyId, setCompanyId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    const company = await companyService.getCurrentCompany();
    if (company) {
      setCompanyId(company.id);
      const status = activeTab === "all" ? undefined : activeTab;
      const data = await quoteService.getQuotes(company.id, status);
      setQuotes(data);
    }
    setLoading(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const filterQuotesByStatus = (status?: string) => {
    if (!status || status === "all") return quotes;
    return quotes.filter(q => q.status === status);
  };

  return (
    <AppLayout companyId={companyId} companyName="AutoTech Workshop" userName="Service Manager">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">Quotes</h1>
            <p className="text-muted-foreground mt-1">
              Manage customer quotes and estimates
            </p>
          </div>
          <Button onClick={() => window.location.href = "/quotes/new"}>
            <Plus className="h-4 w-4 mr-2" />
            New Quote
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Quotes</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="declined">Declined</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Quotes List</CardTitle>
                <CardDescription>
                  {activeTab === "all" ? "All quotes" : `Quotes with status: ${activeTab}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filterQuotesByStatus(activeTab === "all" ? undefined : activeTab).length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="No quotes"
                    description={`No quotes found${activeTab !== "all" ? ` with status: ${activeTab}` : ""}`}
                    action={{
                      label: "Create Quote",
                      onClick: () => window.location.href = "/quotes/new",
                    }}
                  />
                ) : (
                  <div className="space-y-3">
                    {filterQuotesByStatus(activeTab === "all" ? undefined : activeTab).map((quote) => {
                      const customer = Array.isArray(quote.customer) ? quote.customer[0] : quote.customer;
                      const vehicle = Array.isArray(quote.vehicle) ? quote.vehicle[0] : quote.vehicle;

                      return (
                        <div
                          key={quote.id}
                          className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => window.location.href = `/quotes/${quote.id}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{quote.quote_number}</span>
                                <StatusBadge status={quote.status} type="quote" />
                              </div>

                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <User className="h-3 w-3" />
                                <span>{customer?.name}</span>
                              </div>

                              <div className="flex items-center gap-2 text-sm">
                                <Car className="h-3 w-3 text-muted-foreground" />
                                <span>
                                  {vehicle?.registration_number} - {vehicle?.make} {vehicle?.model}
                                </span>
                              </div>

                              {quote.short_description && (
                                <p className="text-sm text-muted-foreground">
                                  {quote.short_description}
                                </p>
                              )}
                            </div>

                            <div className="text-right space-y-2">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {new Date(quote.quote_date).toLocaleDateString()}
                                </span>
                              </div>

                              {quote.expiry_date && (
                                <p className="text-xs text-muted-foreground">
                                  Expires: {new Date(quote.expiry_date).toLocaleDateString()}
                                </p>
                              )}

                              {quote.total_amount && (
                                <div className="font-semibold text-primary flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  {quote.total_amount.toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
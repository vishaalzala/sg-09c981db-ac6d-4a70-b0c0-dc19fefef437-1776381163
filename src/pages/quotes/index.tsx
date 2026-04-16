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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CustomerSelector } from "@/components/CustomerSelector";
import { VehicleSelector } from "@/components/VehicleSelector";
import { useToast } from "@/hooks/use-toast";

export default function QuotesPage() {
  const [companyId, setCompanyId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newQuote, setNewQuote] = useState({
    customer_id: "",
    vehicle_id: "",
    short_description: "",
    status: "draft",
  });
  const { toast } = useToast();

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

  const handleCreateQuote = async () => {
    if (!newQuote.customer_id || !newQuote.vehicle_id) {
      toast({ title: "Error", description: "Customer and Vehicle are required", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const company = await companyService.getCurrentCompany();
      if (!company) throw new Error("No company context found");

      const quote = await quoteService.createQuote({
        ...newQuote,
        company_id: company.id,
        quote_date: new Date().toISOString(),
      } as any);

      toast({ title: "Success", description: "Quote created successfully" });
      setShowAddDialog(false);
      setNewQuote({ customer_id: "", vehicle_id: "", short_description: "", status: "draft" });
      
      // Redirect to quote detail page
      window.location.href = `/quotes/${quote.id}`;
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
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
          <Button onClick={() => setShowAddDialog(true)}>
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

      {/* Add Quote Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Quote</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer *</Label>
              <CustomerSelector
                companyId={companyId}
                value={newQuote.customer_id}
                onChange={(customerId) => setNewQuote({ ...newQuote, customer_id: customerId })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle">Vehicle *</Label>
              <VehicleSelector
                companyId={companyId}
                customerId={newQuote.customer_id}
                value={newQuote.vehicle_id}
                onChange={(vehicleId) => setNewQuote({ ...newQuote, vehicle_id: vehicleId })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="short_description">Description</Label>
              <Textarea
                id="short_description"
                value={newQuote.short_description}
                onChange={(e) => setNewQuote({ ...newQuote, short_description: e.target.value })}
                placeholder="Brief description of work to be quoted..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleCreateQuote} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Quote"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
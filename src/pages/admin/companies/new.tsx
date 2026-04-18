import { useState } from "react";
import { useRouter } from "next/router";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function CreateCompanyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState("company");

  // Company fields
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Owner fields
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");

  // Subscription fields
  const [selectedPlan, setSelectedPlan] = useState("free_trial");
  const [subscriptionType, setSubscriptionType] = useState<"trial" | "paid">("trial");
  const [trialDays, setTrialDays] = useState(14);

  // Add-ons
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  // Branch fields
  const [createBranch, setCreateBranch] = useState(true);
  const [branchName, setBranchName] = useState("Main Branch");
  const [branchEmail, setBranchEmail] = useState("");
  const [branchPhone, setBranchPhone] = useState("");
  const [branchAddress, setBranchAddress] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch("/api/admin/create-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: {
            name: companyName,
            email: companyEmail,
            phone: companyPhone,
            address: companyAddress,
            is_active: isActive
          },
          owner: {
            full_name: ownerName,
            email: ownerEmail,
            password: ownerPassword
          },
          subscription: {
            plan_id: selectedPlan,
            type: subscriptionType,
            trial_days: trialDays
          },
          addons: selectedAddons,
          branch: createBranch ? {
            name: branchName,
            email: branchEmail,
            phone: branchPhone,
            address: branchAddress
          } : null
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create company");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/admin/companies/${result.companyId}`);
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create company");
    } finally {
      setLoading(false);
    }
  };

  const addons = [
    { id: "wof", name: "WOF Compliance System", price: 149 },
    { id: "marketing", name: "Marketing & Social Media", price: 99 },
    { id: "website", name: "Website Builder", price: 79 },
    { id: "loyalty", name: "Loyalty Program", price: 59 },
    { id: "carjam", name: "CARJAM Integration", price: 0 }
  ];

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create New Company</h1>
          <p className="text-muted-foreground">Set up a new workshop account with owner and subscription</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Company created successfully! Redirecting...
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Tabs value={currentStep} onValueChange={setCurrentStep}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="company">Company</TabsTrigger>
              <TabsTrigger value="owner">Owner</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="addons">Add-ons</TabsTrigger>
              <TabsTrigger value="branch">Branch</TabsTrigger>
            </TabsList>

            {/* Company Tab */}
            <TabsContent value="company">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>Basic company details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Your Workshop Ltd"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyEmail">Email</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      placeholder="info@workshop.co.nz"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyPhone">Phone</Label>
                    <Input
                      id="companyPhone"
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                      placeholder="+64 21 123 4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyAddress">Address</Label>
                    <Textarea
                      id="companyAddress"
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      placeholder="123 Main Street, Auckland"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={isActive}
                      onCheckedChange={setIsActive}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>

                  <Button type="button" onClick={() => setCurrentStep("owner")}>
                    Next: Owner Account
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Owner Tab */}
            <TabsContent value="owner">
              <Card>
                <CardHeader>
                  <CardTitle>Owner Account</CardTitle>
                  <CardDescription>Create the primary account for this company</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Full Name *</Label>
                    <Input
                      id="ownerName"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="John Smith"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ownerEmail">Email *</Label>
                    <Input
                      id="ownerEmail"
                      type="email"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      placeholder="john@workshop.co.nz"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ownerPassword">Password *</Label>
                    <Input
                      id="ownerPassword"
                      type="password"
                      value={ownerPassword}
                      onChange={(e) => setOwnerPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep("company")}>
                      Back
                    </Button>
                    <Button type="button" onClick={() => setCurrentStep("subscription")}>
                      Next: Subscription
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Subscription Tab */}
            <TabsContent value="subscription">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription</CardTitle>
                  <CardDescription>Select plan and trial settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Subscription Type</Label>
                    <Select value={subscriptionType} onValueChange={(v) => setSubscriptionType(v as "trial" | "paid")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trial">Free Trial</SelectItem>
                        <SelectItem value="paid">Paid Subscription</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {subscriptionType === "trial" && (
                    <div className="space-y-2">
                      <Label htmlFor="trialDays">Trial Duration (days)</Label>
                      <Input
                        id="trialDays"
                        type="number"
                        value={trialDays}
                        onChange={(e) => setTrialDays(Number(e.target.value))}
                        min="1"
                        max="90"
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep("owner")}>
                      Back
                    </Button>
                    <Button type="button" onClick={() => setCurrentStep("addons")}>
                      Next: Add-ons
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Add-ons Tab */}
            <TabsContent value="addons">
              <Card>
                <CardHeader>
                  <CardTitle>Add-ons</CardTitle>
                  <CardDescription>Select features to enable for this company</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {addons.map((addon) => (
                    <div key={addon.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={addon.id}
                        checked={selectedAddons.includes(addon.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedAddons([...selectedAddons, addon.id]);
                          } else {
                            setSelectedAddons(selectedAddons.filter(id => id !== addon.id));
                          }
                        }}
                      />
                      <Label htmlFor={addon.id} className="flex-1">
                        {addon.name}
                        <span className="text-muted-foreground ml-2">
                          ${addon.price}/month
                        </span>
                      </Label>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep("subscription")}>
                      Back
                    </Button>
                    <Button type="button" onClick={() => setCurrentStep("branch")}>
                      Next: Branch
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Branch Tab */}
            <TabsContent value="branch">
              <Card>
                <CardHeader>
                  <CardTitle>Branch Setup</CardTitle>
                  <CardDescription>Create initial branch (optional)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="createBranch"
                      checked={createBranch}
                      onCheckedChange={setCreateBranch}
                    />
                    <Label htmlFor="createBranch">Create initial branch</Label>
                  </div>

                  {createBranch && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="branchName">Branch Name</Label>
                        <Input
                          id="branchName"
                          value={branchName}
                          onChange={(e) => setBranchName(e.target.value)}
                          placeholder="Main Branch"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="branchEmail">Branch Email</Label>
                        <Input
                          id="branchEmail"
                          type="email"
                          value={branchEmail}
                          onChange={(e) => setBranchEmail(e.target.value)}
                          placeholder="branch@workshop.co.nz"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="branchPhone">Branch Phone</Label>
                        <Input
                          id="branchPhone"
                          value={branchPhone}
                          onChange={(e) => setBranchPhone(e.target.value)}
                          placeholder="+64 21 123 4567"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="branchAddress">Branch Address</Label>
                        <Textarea
                          id="branchAddress"
                          value={branchAddress}
                          onChange={(e) => setBranchAddress(e.target.value)}
                          placeholder="123 Main Street, Auckland"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep("addons")}>
                      Back
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Creating..." : "Create Company"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </AdminLayout>
  );
}
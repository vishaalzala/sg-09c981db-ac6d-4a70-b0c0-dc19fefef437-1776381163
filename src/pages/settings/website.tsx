import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { companyService } from "@/services/companyService";
import { websiteService } from "@/services/websiteService";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Globe, Link as LinkIcon, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { FeatureGate } from "@/components/FeatureGate";

export default function WebsiteSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyId, setCompanyId] = useState("");
  const [hasWebsiteAddon, setHasWebsiteAddon] = useState(false);
  
  const [website, setWebsite] = useState<any>(null);
  const [domains, setDomains] = useState<any[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [subdomainCheck, setSubdomainCheck] = useState<{available: boolean, checking: boolean}>({ available: true, checking: false });

  const templates = [
    { id: "classic_workshop", name: "Classic Workshop", desc: "Traditional, reliable, straightforward layout" },
    { id: "modern_automotive", name: "Modern Automotive", desc: "Sleek, image-focused, premium feel" },
    { id: "tyre_service", name: "Tyre & Service Focus", desc: "Highlighting quick services and tyre sales" }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const company = await companyService.getCurrentCompany();
    if (company) {
      setCompanyId(company.id);
      const hasAddon = await companyService.checkFeatureEntitlement(company.id, "website_builder");
      setHasWebsiteAddon(hasAddon);

      if (hasAddon) {
        const webData = await websiteService.getCompanyWebsite(company.id);
        if (webData) {
          setWebsite(webData);
          const domainData = await websiteService.getWebsiteDomains(webData.id);
          setDomains(domainData);
        } else {
          // Initialize empty website state
          setWebsite({
            business_name: company.name,
            template: "classic_workshop",
            is_published: false,
            show_booking_form: true,
            show_lead_form: true,
            show_portal_link: true
          });
        }
      }
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!companyId || !website) return;
    setSaving(true);
    try {
      if (website.id) {
        await websiteService.updateWebsite(website.id, website);
        toast({ title: "Success", description: "Website settings updated." });
      } else {
        const newWeb = await websiteService.createWebsite({
          ...website,
          company_id: companyId
        });
        setWebsite(newWeb);
        toast({ title: "Success", description: "Website created." });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const checkSubdomain = async (sub: string) => {
    if (!sub || sub.length < 3) return;
    setSubdomainCheck({ available: false, checking: true });
    const result = await websiteService.checkSubdomainAvailability(sub, website?.id);
    setSubdomainCheck({ available: result.available, checking: false });
  };

  const handleAddDomain = async () => {
    if (!newDomain || !website?.id) return;
    try {
      await websiteService.addCustomDomain(website.id, companyId, newDomain);
      const domainData = await websiteService.getWebsiteDomains(website.id);
      setDomains(domainData);
      setNewDomain("");
      toast({ title: "Domain added", description: "Please configure your DNS settings." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <AppLayout companyId={companyId} companyName="AutoTech Workshop" userName="Admin">
      <FeatureGate feature="website_builder" isEnabled={hasWebsiteAddon}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold">Website Builder</h1>
              <p className="text-muted-foreground mt-1">Manage your public website and custom domains.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.open(`https://${website?.subdomain}.softgen.ai`, '_blank')} disabled={!website?.subdomain || !website?.is_published}>
                View Site
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">General & Design</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="domains">Domains</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Site Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Publish Website</p>
                      <p className="text-sm text-muted-foreground">Make your website publicly visible</p>
                    </div>
                    <Switch 
                      checked={website?.is_published} 
                      onCheckedChange={(c) => setWebsite({...website, is_published: c})} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Softgen Subdomain</Label>
                    <div className="flex gap-2 items-center">
                      <Input 
                        value={website?.subdomain || ""} 
                        onChange={(e) => {
                          const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                          setWebsite({...website, subdomain: val});
                          checkSubdomain(val);
                        }} 
                        placeholder="your-workshop"
                        className="max-w-[200px]"
                      />
                      <span className="text-muted-foreground">.softgen.ai</span>
                      {!subdomainCheck.checking && website?.subdomain && (
                        subdomainCheck.available ? 
                        <Badge variant="outline" className="text-success border-success ml-2"><CheckCircle2 className="h-3 w-3 mr-1"/> Available</Badge> :
                        <Badge variant="destructive" className="ml-2"><AlertCircle className="h-3 w-3 mr-1"/> Taken / Reserved</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Template Selection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {templates.map(tpl => (
                      <div 
                        key={tpl.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${website?.template === tpl.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/50'}`}
                        onClick={() => setWebsite({...website, template: tpl.id})}
                      >
                        <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center">
                          <Globe className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <p className="font-medium">{tpl.name}</p>
                        <p className="text-xs text-muted-foreground">{tpl.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Business Name</Label>
                      <Input 
                        value={website?.business_name || ""} 
                        onChange={(e) => setWebsite({...website, business_name: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tagline</Label>
                      <Input 
                        value={website?.tagline || ""} 
                        onChange={(e) => setWebsite({...website, tagline: e.target.value})} 
                        placeholder="Expert automotive care you can trust"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>About Text</Label>
                      <Textarea 
                        value={website?.about_text || ""} 
                        onChange={(e) => setWebsite({...website, about_text: e.target.value})} 
                        rows={4}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Contact Details (Public)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Public Phone</Label>
                      <Input value={website?.phone || ""} onChange={(e) => setWebsite({...website, phone: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Public Email</Label>
                      <Input value={website?.email || ""} onChange={(e) => setWebsite({...website, email: e.target.value})} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Physical Address</Label>
                      <Input value={website?.address || ""} onChange={(e) => setWebsite({...website, address: e.target.value})} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Opening Hours</Label>
                      <Input value={website?.hours || ""} onChange={(e) => setWebsite({...website, hours: e.target.value})} placeholder="Mon-Fri: 8am - 5pm, Sat: 9am - 12pm" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SEO Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>SEO Title</Label>
                    <Input value={website?.seo_title || ""} onChange={(e) => setWebsite({...website, seo_title: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>SEO Description</Label>
                    <Textarea value={website?.seo_description || ""} onChange={(e) => setWebsite({...website, seo_description: e.target.value})} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Interactive Elements</CardTitle>
                  <CardDescription>Enable or disable features on your public website.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Booking Form</p>
                      <p className="text-sm text-muted-foreground">Allow customers to request appointments online</p>
                    </div>
                    <Switch 
                      checked={website?.show_booking_form} 
                      onCheckedChange={(c) => setWebsite({...website, show_booking_form: c})} 
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Contact / Lead Form</p>
                      <p className="text-sm text-muted-foreground">General inquiry form for customers</p>
                    </div>
                    <Switch 
                      checked={website?.show_lead_form} 
                      onCheckedChange={(c) => setWebsite({...website, show_lead_form: c})} 
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Customer Portal Link</p>
                      <p className="text-sm text-muted-foreground">Show login button for existing customers</p>
                    </div>
                    <Switch 
                      checked={website?.show_portal_link} 
                      onCheckedChange={(c) => setWebsite({...website, show_portal_link: c})} 
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="domains" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Custom Domains</CardTitle>
                  <CardDescription>Connect your own domain (e.g., www.myworkshop.co.nz)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="e.g., www.myworkshop.co.nz" 
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                    />
                    <Button onClick={handleAddDomain}>Add Domain</Button>
                  </div>

                  {domains.length > 0 ? (
                    <div className="space-y-4">
                      {domains.map(domain => (
                        <div key={domain.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Globe className="h-5 w-5 text-muted-foreground" />
                              <span className="font-medium text-lg">{domain.domain}</span>
                            </div>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">Remove</Button>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 text-sm bg-muted/50 p-4 rounded-md">
                            <div>
                              <p className="text-muted-foreground mb-1">DNS Verification</p>
                              <div className="flex items-center gap-2">
                                {domain.verification_status === 'verified' ? 
                                  <><CheckCircle2 className="h-4 w-4 text-success" /> <span className="text-success font-medium">Verified</span></> : 
                                  <><AlertCircle className="h-4 w-4 text-warning" /> <span className="text-warning font-medium">Pending Setup</span></>
                                }
                              </div>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1">SSL Certificate</p>
                              <div className="flex items-center gap-2">
                                {domain.ssl_status === 'issued' ? 
                                  <><ShieldCheck className="h-4 w-4 text-success" /> <span className="text-success font-medium">Active</span></> : 
                                  <><AlertCircle className="h-4 w-4 text-warning" /> <span className="text-warning font-medium">Provisioning</span></>
                                }
                              </div>
                            </div>
                          </div>

                          {domain.verification_status !== 'verified' && (
                            <div className="mt-4 text-sm">
                              <p className="font-medium mb-2">Required DNS Records:</p>
                              <div className="bg-background border rounded p-3 font-mono text-xs">
                                <p>Type: CNAME</p>
                                <p>Name: {domain.domain.startsWith('www.') ? 'www' : '@'}</p>
                                <p>Value: proxy.softgen.ai</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                      <LinkIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No custom domains connected yet.</p>
                      <p className="text-sm mt-1">Your site is currently available at <strong>{website?.subdomain}.softgen.ai</strong></p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </FeatureGate>
    </AppLayout>
  );
}
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FeatureGate } from "@/components/FeatureGate";
import { companyService } from "@/services/companyService";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Facebook, Instagram, Share2, Sparkles, Calendar, Clock } from "lucide-react";

export default function SocialMediaDashboard() {
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState("");
  const [hasSocialAccess, setHasSocialAccess] = useState(false);

  useEffect(() => {
    const init = async () => {
      const company = await companyService.getCurrentCompany();
      if (company) {
        setCompanyId(company.id);
        const hasAccess = await companyService.checkFeatureEntitlement(company.id, "marketing_social");
        setHasSocialAccess(hasAccess);
      }
      setLoading(false);
    };
    init();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <AppLayout companyId={companyId} companyName="AutoTech Workshop" userName="Manager">
      <FeatureGate feature="marketing_social" isEnabled={hasSocialAccess}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold">Social Media Marketing</h1>
              <p className="text-muted-foreground">Manage your Facebook and Instagram presence with AI</p>
            </div>
            <Button>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate AI Post
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Facebook className="h-4 w-4 text-blue-600" /> Facebook Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Connected</div>
                <p className="text-xs text-muted-foreground mt-1">AutoTech Workshop Official</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-pink-600" /> Instagram Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-muted-foreground">Not Connected</div>
                <Button variant="link" className="px-0 h-auto text-xs mt-1">Connect Account</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" /> Scheduled Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground mt-1">Next post in 2 days</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Content</CardTitle>
              <CardDescription>Review and manage your scheduled posts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Facebook className="h-3 w-3 mr-1" /> Facebook
                      </Badge>
                      <Badge variant="secondary">Tip of the week</Badge>
                    </div>
                    <p className="text-sm">"Did you know? Checking your tyre pressure monthly can save you up to 10% on fuel! Come in for a free check at AutoTech. 🚗💨 #CarCare #Wellington"</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <Clock className="h-4 w-4 mr-1" />
                      Tomorrow, 10:00 AM
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </FeatureGate>
    </AppLayout>
  );
}
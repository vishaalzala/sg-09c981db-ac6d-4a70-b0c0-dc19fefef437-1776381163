import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { DocumentBuilder } from "@/components/DocumentBuilder";
import { companyService } from "@/services/companyService";
import { supabase } from "@/integrations/supabase/client";

export default function NewInvoice() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Auth error:", authError);
        setError("Authentication error. Please log in again.");
        setLoading(false);
        return;
      }

      if (!user) {
        console.error("No user found");
        router.push("/login");
        return;
      }

      // Get user's company_id from users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (userError) {
        console.error("Error loading user data:", userError);
        setError("Failed to load user data. Please contact support.");
        setLoading(false);
        return;
      }

      if (!userData?.company_id) {
        console.error("No company_id found for user:", user.id);
        setError("No company context found. Please contact support.");
        setLoading(false);
        return;
      }

      console.log("Company loaded:", userData.company_id);
      setCompanyId(userData.company_id);
      setLoading(false);
    } catch (error) {
      console.error("Error loading company:", error);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleComplete = (documentId: string) => {
    router.push(`/dashboard/invoices`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !companyId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-destructive mb-4">{error || "No company found. Please set up your company first."}</p>
          <button 
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <DocumentBuilder type="invoice" companyId={companyId} onComplete={handleComplete} />;
}
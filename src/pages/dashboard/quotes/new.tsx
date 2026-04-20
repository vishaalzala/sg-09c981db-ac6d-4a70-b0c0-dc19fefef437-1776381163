import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { DocumentBuilder } from "@/components/DocumentBuilder";
import { companyService } from "@/services/companyService";

export default function NewQuote() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    try {
      const company = await companyService.getCurrentCompany();
      if (company) {
        setCompanyId(company.id);
      }
    } catch (error) {
      console.error("Error loading company:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = (documentId: string) => {
    router.push(`/dashboard/quotes`);
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

  if (!companyId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No company found. Please set up your company first.</p>
        </div>
      </div>
    );
  }

  return <DocumentBuilder type="quote" companyId={companyId} onComplete={handleComplete} />;
}
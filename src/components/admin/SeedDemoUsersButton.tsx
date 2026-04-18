import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, AlertCircle, CheckCircle2 } from "lucide-react";

export function SeedDemoUsersButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSeedDemoUsers = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/seed-demo-users", {
        method: "POST"
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: data.message });
      } else {
        setResult({ success: false, message: data.error || "Failed to seed demo users" });
      }
    } catch (error) {
      setResult({ 
        success: false, 
        message: error instanceof Error ? error.message : "An error occurred" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleSeedDemoUsers} 
        disabled={loading}
        variant="outline"
      >
        <Users className="w-4 h-4 mr-2" />
        {loading ? "Creating Demo Users..." : "Create Demo Users"}
      </Button>

      {result && (
        <Alert variant={result.success ? "default" : "destructive"}>
          {result.success ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
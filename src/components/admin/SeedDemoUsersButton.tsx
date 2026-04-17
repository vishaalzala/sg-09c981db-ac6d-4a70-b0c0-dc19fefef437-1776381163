import { useState } from "react";
import { adminService } from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export function SeedDemoUsersButton() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const onSeed = async () => {
    setLoading(true);
    try {
      const result = await adminService.seedDemoUsers();

      const failed = (result.results ?? []).filter((r) => r.status === "failed");
      const created = (result.results ?? []).filter((r) => r.status === "created");
      const updated = (result.results ?? []).filter((r) => r.status === "updated");

      if (failed.length > 0) {
        toast({
          title: "Demo users seeded (with issues)",
          description: `${created.length} created, ${updated.length} updated, ${failed.length} failed. Password: ${result.password}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Demo users ready",
          description: `Password: ${result.password}. Created: ${created.length}, Updated: ${updated.length}.`,
        });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to seed demo users";
      toast({ title: "Seed demo users failed", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={onSeed} disabled={loading}>
      {loading ? "Seeding..." : "Seed demo users"}
    </Button>
  );
}
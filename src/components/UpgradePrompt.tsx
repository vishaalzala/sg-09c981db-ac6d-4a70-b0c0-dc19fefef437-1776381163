import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface UpgradePromptProps {
  feature: "wof_compliance" | "marketing_social" | "website_builder" | "loyalty_program" | "carjam_usage";
  inline?: boolean;
}

const featureNames: Record<UpgradePromptProps["feature"], { name: string; description: string }> = {
  wof_compliance: {
    name: "WOF Compliance System",
    description: "Complete inspection workflow with pass/fail tracking, recheck management, and compliance logging"
  },
  marketing_social: {
    name: "Marketing & Social Media",
    description: "Automated reminder campaigns, customer segments, and social media promotion tools"
  },
  website_builder: {
    name: "Website Builder",
    description: "Professional workshop website with booking forms, service pages, and lead capture"
  },
  loyalty_program: {
    name: "Loyalty Program",
    description: "Points, rewards, discounts, and referral tracking to retain customers"
  },
  carjam_usage: {
    name: "CARJAM Vehicle Lookups",
    description: "Instant vehicle details from registration number with automated data entry"
  }
};

export function UpgradePrompt({ feature, inline = false }: UpgradePromptProps) {
  const { name, description } = featureNames[feature];

  if (inline) {
    return (
      <div className="flex items-center gap-3 p-4 bg-muted/50 border border-border rounded-lg">
        <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{name}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Button size="sm" className="flex-shrink-0">
          <Sparkles className="h-4 w-4 mr-2" />
          Enable Add-on
        </Button>
      </div>
    );
  }

  return (
    <Card className="p-6 max-w-md shadow-lg border-2">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
          <Lock className="h-6 w-6 text-accent" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-lg mb-2">{name}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button className="w-full">
          <Sparkles className="h-4 w-4 mr-2" />
          Enable Add-on
        </Button>
      </div>
    </Card>
  );
}
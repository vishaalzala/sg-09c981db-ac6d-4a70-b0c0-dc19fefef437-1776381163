import { useState, useEffect, useRef } from "react";
import { Search, User, Car, Calendar, Wrench, FileText, Receipt } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { globalSearchService, type SearchResult } from "@/services/globalSearchService";
import { LoadingSpinner } from "./LoadingSpinner";
import { useRouter } from "next/router";

const typeIcons = {
  customer: User,
  vehicle: Car,
  booking: Calendar,
  job: Wrench,
  quote: FileText,
  invoice: Receipt,
};

export function GlobalSearchBar({ companyId }: { companyId: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const search = async () => {
      setIsLoading(true);
      try {
        const data = await globalSearchService.search(query, companyId);
        setResults(data);
        setIsOpen(true);
        setSelectedIndex(0);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query, companyId]);

  const handleSelect = (result: SearchResult) => {
    const routes = {
      customer: `/customers/${result.id}`,
      vehicle: `/vehicles/${result.id}`,
      booking: `/bookings/${result.id}`,
      job: `/jobs/${result.id}`,
      quote: `/quotes/${result.id}`,
      invoice: `/invoices/${result.id}`,
    };
    
    router.push(routes[result.type]);
    setQuery("");
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search customers, vehicles, rego, jobs..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(true)}
          className="pl-9 pr-9"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <Card className="absolute top-full mt-2 w-full max-h-96 overflow-y-auto z-50 shadow-lg">
          <div className="p-1">
            {results.map((result, index) => {
              const Icon = typeIcons[result.type];
              return (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSelect(result)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-md text-left transition-colors",
                    "hover:bg-muted",
                    index === selectedIndex && "bg-muted"
                  )}
                >
                  <div className="flex-shrink-0">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{result.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                  </div>
                  {result.metadata && (
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {result.metadata}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {isOpen && query && !isLoading && results.length === 0 && (
        <Card className="absolute top-full mt-2 w-full p-4 z-50 shadow-lg">
          <p className="text-sm text-muted-foreground text-center">No results found</p>
        </Card>
      )}
    </div>
  );
}
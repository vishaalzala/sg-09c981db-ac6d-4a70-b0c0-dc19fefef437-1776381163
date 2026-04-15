import { useEffect } from "react";
import { useRouter } from "next/router";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner />
    </div>
  );
}

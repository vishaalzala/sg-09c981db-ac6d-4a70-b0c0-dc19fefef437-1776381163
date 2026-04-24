import { useEffect } from "react";
import { useRouter } from "next/router";
export default function OldWofHistoryRedirect() { const router = useRouter(); useEffect(() => { router.replace("/dashboard/wof/history"); }, [router]); return null; }

import { useEffect } from "react";
import { useRouter } from "next/router";
export default function RedirectWof() { const router = useRouter(); useEffect(() => { router.replace("/wof"); }, [router]); return null; }
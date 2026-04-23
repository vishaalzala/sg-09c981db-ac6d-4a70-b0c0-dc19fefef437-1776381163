import { ReactNode } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
export function AdminPageShell({title,description,children}:{title:string;description:string;children:ReactNode}){
return <ProtectedRoute><AdminLayout><div className="min-h-screen bg-muted/30 p-4 md:p-8"><div className="mx-auto max-w-7xl space-y-6"><Card><CardHeader><CardTitle className="text-2xl">{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader></Card><div className="space-y-6">{children}</div></div></div></AdminLayout></ProtectedRoute>}
export function AdminStatCard({title,value,hint}:{title:string;value:string|number;hint?:string}){return <Card><CardHeader className="pb-2"><CardDescription>{title}</CardDescription><CardTitle className="text-2xl">{value}</CardTitle></CardHeader>{hint?<CardContent className="pt-0 text-sm text-muted-foreground">{hint}</CardContent>:null}</Card>}

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { companyService } from "@/services/companyService";

export default function Reports() {
  const [companyId, setCompanyId] = useState<string>("");

  useEffect(() => {
    companyService.getCurrentCompany().then(c => {
      if (c) setCompanyId(c.id);
    });
  }, []);

  const reportData = [
    { year: "2026", jan: "$0.00", feb: "$0.00", mar: "$0.00", apr: "$0.00", may: "$0.00", jun: "$0.00", jul: "$0.00", aug: "$0.00", sep: "$0.00", oct: "$0.00", nov: "$0.00", dec: "$0.00" },
    { year: "2025", jan: "$0.00", feb: "$0.00", mar: "$0.00", apr: "$0.00", may: "$0.00", jun: "$0.00", jul: "$0.00", aug: "$0.00", sep: "$0.00", oct: "$0.00", nov: "$0.00", dec: "$0.00" }
  ];

  return (
    <AppLayout companyId={companyId}>
      <div className="p-6 space-y-6">
        <h1 className="font-heading text-3xl font-bold">Reports</h1>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Report</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>YEAR</TableHead>
                    <TableHead>JAN</TableHead>
                    <TableHead>FEB</TableHead>
                    <TableHead>MAR</TableHead>
                    <TableHead>APR</TableHead>
                    <TableHead>MAY</TableHead>
                    <TableHead>JUN</TableHead>
                    <TableHead>JUL</TableHead>
                    <TableHead>AUG</TableHead>
                    <TableHead>SEP</TableHead>
                    <TableHead>OCT</TableHead>
                    <TableHead>NOV</TableHead>
                    <TableHead>DEC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{row.year}</TableCell>
                      <TableCell>{row.jan}</TableCell>
                      <TableCell>{row.feb}</TableCell>
                      <TableCell>{row.mar}</TableCell>
                      <TableCell>{row.apr}</TableCell>
                      <TableCell>{row.may}</TableCell>
                      <TableCell>{row.jun}</TableCell>
                      <TableCell>{row.jul}</TableCell>
                      <TableCell>{row.aug}</TableCell>
                      <TableCell>{row.sep}</TableCell>
                      <TableCell>{row.oct}</TableCell>
                      <TableCell>{row.nov}</TableCell>
                      <TableCell>{row.dec}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
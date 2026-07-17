import { prisma } from "@/lib/prisma";
import type { Student } from "@prisma/client";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Building2, BookOpen, BarChart3 } from "lucide-react";

export default async function DashboardPage() {
  const [studentCount, companyCount, trainingCount, resultCount] = await Promise.all([
    prisma.student.count(),
    prisma.company.count(),
    prisma.training.count(),
    prisma.result.count(),
  ]);

  const recentStudents: Student[] = await prisma.student.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const stats = [
    { label: "Total Students", value: studentCount, icon: GraduationCap, href: "/dashboard/students" },
    { label: "Companies", value: companyCount, icon: Building2, href: "/dashboard/companies" },
    { label: "Training Records", value: trainingCount, icon: BookOpen, href: "/dashboard/training" },
    { label: "Results", value: resultCount, icon: BarChart3, href: "/dashboard/results" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome to Student Training Management System</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{s.value}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Students</CardTitle>
          <Link href="/dashboard/students" className="inline-flex items-center justify-center text-sm font-medium rounded-md px-3 h-8 hover:bg-accent hover:text-accent-foreground transition-colors">View all</Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentStudents.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/students/${s.id}`} className="hover:underline text-primary">
                      {s.rollNo}
                    </Link>
                  </TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell><Badge variant="secondary">{s.course}</Badge></TableCell>
                  <TableCell>Year {s.year}</TableCell>
                  <TableCell className="text-muted-foreground">{s.email}</TableCell>
                </TableRow>
              ))}
              {recentStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No students yet.{" "}
                    <Link href="/dashboard/students" className="text-primary hover:underline">Add one</Link>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

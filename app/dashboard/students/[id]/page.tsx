import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Mail, Phone, MapPin, BookOpen } from "lucide-react";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await prisma.student.findUnique({
    where: { id: Number(id) },
    include: {
      trainings: { include: { company: true } },
      results: { orderBy: [{ year: "desc" }, { semester: "desc" }] },
    },
  });

  if (!student) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/students"><ArrowLeft className="w-4 h-4 mr-1" />Back</Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{student.name}</h1>
          <p className="text-muted-foreground text-sm">{student.rollNo} · {student.course} Year {student.year}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Personal Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{student.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{student.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{student.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <span>{student.course} — Year {student.year}</span>
            </div>
            <Separator />
            <div className="text-xs text-muted-foreground">
              Enrolled: {new Date(student.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Training Records</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.trainings.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.projectName}</TableCell>
                      <TableCell className="text-muted-foreground">{t.company.name}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(t.startDate).toLocaleDateString()} – {new Date(t.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={t.status === "Completed" ? "default" : "secondary"}>
                          {t.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {student.trainings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-6">No training records.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Academic Results</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Year</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.results.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.subject}</TableCell>
                      <TableCell className="text-muted-foreground">{r.marks}/{r.maxMarks}</TableCell>
                      <TableCell><Badge variant="outline">{r.grade}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">Sem {r.semester}</TableCell>
                      <TableCell className="text-muted-foreground">{r.year}</TableCell>
                    </TableRow>
                  ))}
                  {student.results.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-6">No results recorded.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

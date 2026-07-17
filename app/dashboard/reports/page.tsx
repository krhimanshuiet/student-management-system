import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

export default async function ReportsPage() {
  const [students, companies, trainings, results] = await Promise.all([
    prisma.student.findMany({ orderBy: { name: "asc" } }),
    prisma.company.findMany({ orderBy: { name: "asc" }, include: { trainings: true } }),
    prisma.training.findMany({ include: { student: true, company: true }, orderBy: { createdAt: "desc" } }),
    prisma.result.findMany({ include: { student: true }, orderBy: [{ year: "desc" }, { semester: "desc" }] }),
  ]);

  const completedTrainings = trainings.filter(t => t.status === "Completed").length;

  const summaryStats = [
    { label: "Total Students", value: students.length },
    { label: "Total Companies", value: companies.length },
    { label: "Trainings Completed", value: completedTrainings },
    { label: "Trainings Ongoing", value: trainings.length - completedTrainings },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground text-sm">Overview of all records</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map(s => (
          <Card key={s.label}>
            <CardHeader className="pb-1 pt-4 px-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-3xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">All Students</h2>
          <span className="text-sm text-muted-foreground">{students.length} records</span>
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">
                      <Link href={`/dashboard/students/${s.id}`} className="text-primary hover:underline">{s.rollNo}</Link>
                    </TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell><Badge variant="secondary">{s.course}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">Year {s.year}</TableCell>
                    <TableCell className="text-muted-foreground">{s.email}</TableCell>
                    <TableCell className="text-muted-foreground">{s.phone}</TableCell>
                  </TableRow>
                ))}
                {students.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No students.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">All Companies</h2>
          <span className="text-sm text-muted-foreground">{companies.length} records</span>
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Trainings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">{c.industry}</TableCell>
                    <TableCell className="text-muted-foreground">{c.location}</TableCell>
                    <TableCell className="text-muted-foreground">{c.contactPerson}</TableCell>
                    <TableCell><Badge variant="outline">{c.trainings.length}</Badge></TableCell>
                  </TableRow>
                ))}
                {companies.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No companies.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">All Training Records</h2>
          <span className="text-sm text-muted-foreground">{trainings.length} records</span>
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainings.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.student.name}</TableCell>
                    <TableCell className="text-muted-foreground">{t.company.name}</TableCell>
                    <TableCell>{t.projectName}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{new Date(t.startDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{new Date(t.endDate).toLocaleDateString()}</TableCell>
                    <TableCell><Badge variant={t.status === "Completed" ? "default" : "secondary"}>{t.status}</Badge></TableCell>
                  </TableRow>
                ))}
                {trainings.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No training records.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">All Results</h2>
          <span className="text-sm text-muted-foreground">{results.length} records</span>
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Year</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map(r => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <p className="font-medium">{r.student.name}</p>
                      <p className="text-xs text-muted-foreground">{r.student.rollNo}</p>
                    </TableCell>
                    <TableCell className="font-medium">{r.subject}</TableCell>
                    <TableCell className="text-muted-foreground">{r.marks}/{r.maxMarks}</TableCell>
                    <TableCell><Badge variant="outline">{r.grade}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">Sem {r.semester}</TableCell>
                    <TableCell className="text-muted-foreground">{r.year}</TableCell>
                  </TableRow>
                ))}
                {results.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No results.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

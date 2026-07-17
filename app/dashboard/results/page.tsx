"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import TableSkeleton from "@/components/TableSkeleton";

type Result = {
  id: number; subject: string; marks: number; maxMarks: number;
  grade: string; semester: number; year: number;
  student: { id: number; name: string; rollNo: string };
};
type Student = { id: number; name: string; rollNo: string };

const emptyForm = { studentId: "", subject: "", marks: "", maxMarks: "100", grade: "A", semester: "1", year: String(new Date().getFullYear()) };

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Result | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchAll(q = "") {
    const [res, st] = await Promise.all([
      fetch(`/api/results?search=${encodeURIComponent(q)}`).then(r => r.json()),
      fetch("/api/students").then(r => r.json()),
    ]);
    setResults(res); setStudents(st);
    setInitialLoading(false);
  }

  useEffect(() => { fetchAll(); }, []);

  function openAdd() { setEditTarget(null); setForm(emptyForm); setError(""); setOpen(true); }
  function openEdit(r: Result) {
    setEditTarget(r);
    setForm({ studentId: String(r.student.id), subject: r.subject, marks: String(r.marks), maxMarks: String(r.maxMarks), grade: r.grade, semester: String(r.semester), year: String(r.year) });
    setError(""); setOpen(true);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this result?")) return;
    await fetch(`/api/results/${id}`, { method: "DELETE" });
    fetchAll(search);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const method = editTarget ? "PUT" : "POST";
    const url = editTarget ? `/api/results/${editTarget.id}` : "/api/results";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setLoading(false);
    if (!res.ok) { const d = await res.json(); setError(d.error || "Error"); return; }
    setOpen(false); fetchAll(search);
  }

  const gradeVariant = (g: string): "default" | "secondary" | "outline" | "destructive" => {
    if (g.startsWith("A")) return "default";
    if (g.startsWith("B")) return "secondary";
    return "outline";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Results</h1>
          <p className="text-muted-foreground text-sm">Manage academic results and grades</p>
        </div>
        <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" />Add Result</Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student name..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); fetchAll(e.target.value); }}
              className="pl-8"
            />
          </div>
        </CardHeader>
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            {initialLoading ? <TableSkeleton cols={7} /> : <TableBody>
              {results.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <p className="font-medium">{r.student.name}</p>
                    <p className="text-xs text-muted-foreground">{r.student.rollNo}</p>
                  </TableCell>
                  <TableCell className="font-medium">{r.subject}</TableCell>
                  <TableCell className="text-muted-foreground">{r.marks}/{r.maxMarks}</TableCell>
                  <TableCell><Badge variant={gradeVariant(r.grade)}>{r.grade}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">Sem {r.semester}</TableCell>
                  <TableCell className="text-muted-foreground">{r.year}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {results.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">No results found.</TableCell>
                </TableRow>
              )}
            </TableBody>}
          </Table>
        </CardContent>
      </Card>

      <Drawer open={open} onOpenChange={setOpen} swipeDirection="right">
        <DrawerContent className="sm:[--drawer-content-width:600px]">
          <DrawerHeader>
            <DrawerTitle>{editTarget ? "Edit Result" : "Add Result"}</DrawerTitle>
          </DrawerHeader>
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-4 space-y-4 py-2">
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="space-y-1.5">
                <Label>Student</Label>
                <Select value={form.studentId} onValueChange={v => setForm({ ...form, studentId: v ?? "" })}>
                  <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                  <SelectContent>
                    {students.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name} ({s.rollNo})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Subject</Label>
                <Input required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="DBMS, Web Technology, etc." />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Marks</Label>
                  <Input required type="number" min="0" value={form.marks} onChange={e => setForm({ ...form, marks: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Max Marks</Label>
                  <Input required type="number" min="1" value={form.maxMarks} onChange={e => setForm({ ...form, maxMarks: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Grade</Label>
                  <Select value={form.grade} onValueChange={v => setForm({ ...form, grade: v ?? "" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["A+", "A", "B+", "B", "C", "D", "F"].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Semester</Label>
                  <Select value={form.semester} onValueChange={v => setForm({ ...form, semester: v ?? "" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map(n => <SelectItem key={n} value={String(n)}>Semester {n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Year</Label>
                  <Input required type="number" min="2020" max="2030" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
                </div>
              </div>
            </div>
            <DrawerFooter>
              <Button type="submit" disabled={loading}>{loading ? "Saving..." : editTarget ? "Update Result" : "Add Result"}</Button>
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

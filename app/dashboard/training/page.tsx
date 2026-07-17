"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import TableSkeleton from "@/components/TableSkeleton";

type Training = {
  id: number; projectName: string; startDate: string; endDate: string;
  status: string; description: string;
  student: { id: number; name: string; rollNo: string };
  company: { id: number; name: string };
};
type Student = { id: number; name: string; rollNo: string };
type Company = { id: number; name: string };

const emptyForm = { studentId: "", companyId: "", projectName: "", startDate: "", endDate: "", status: "Ongoing", description: "" };

export default function TrainingPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Training | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchAll(q = "") {
    const [tr, st, co] = await Promise.all([
      fetch(`/api/training?search=${encodeURIComponent(q)}`).then(r => r.json()),
      fetch("/api/students").then(r => r.json()),
      fetch("/api/companies").then(r => r.json()),
    ]);
    setTrainings(tr); setStudents(st); setCompanies(co);
    setInitialLoading(false);
  }

  useEffect(() => { fetchAll(); }, []);

  function openAdd() { setEditTarget(null); setForm(emptyForm); setError(""); setOpen(true); }
  function openEdit(t: Training) {
    setEditTarget(t);
    setForm({ studentId: String(t.student.id), companyId: String(t.company.id), projectName: t.projectName, startDate: t.startDate.slice(0, 10), endDate: t.endDate.slice(0, 10), status: t.status, description: t.description });
    setError(""); setOpen(true);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this training record?")) return;
    await fetch(`/api/training/${id}`, { method: "DELETE" });
    fetchAll(search);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const method = editTarget ? "PUT" : "POST";
    const url = editTarget ? `/api/training/${editTarget.id}` : "/api/training";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setLoading(false);
    if (!res.ok) { const d = await res.json(); setError(d.error || "Error"); return; }
    setOpen(false); fetchAll(search);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Training</h1>
          <p className="text-muted-foreground text-sm">Manage internship and training records</p>
        </div>
        <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" />Add Training</Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student name or roll no..."
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
                <TableHead>Company</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            {initialLoading ? <TableSkeleton cols={6} /> : <TableBody>
              {trainings.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <p className="font-medium">{t.student.name}</p>
                    <p className="text-xs text-muted-foreground">{t.student.rollNo}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{t.company.name}</TableCell>
                  <TableCell className="font-medium">{t.projectName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(t.startDate).toLocaleDateString()} – {new Date(t.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={t.status === "Completed" ? "default" : "secondary"}>{t.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(t)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {trainings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">No training records found.</TableCell>
                </TableRow>
              )}
            </TableBody>}
          </Table>
        </CardContent>
      </Card>

      <Drawer open={open} onOpenChange={setOpen} swipeDirection="right">
        <DrawerContent className="sm:[--drawer-content-width:600px]">
          <DrawerHeader>
            <DrawerTitle>{editTarget ? "Edit Training" : "Add Training"}</DrawerTitle>
          </DrawerHeader>
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-4 space-y-4 py-2">
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Student</Label>
                  <Select value={form.studentId} onValueChange={v => setForm({ ...form, studentId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                    <SelectContent>
                      {students.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name} ({s.rollNo})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Company</Label>
                  <Select value={form.companyId} onValueChange={v => setForm({ ...form, companyId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                    <SelectContent>
                      {companies.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Project Name</Label>
                <Input required value={form.projectName} onChange={e => setForm({ ...form, projectName: e.target.value })} placeholder="Inventory Management System" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Start Date</Label>
                  <Input required type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>End Date</Label>
                  <Input required type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ongoing">Ongoing</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description of the project..." rows={3} />
              </div>
            </div>
            <DrawerFooter>
              <Button type="submit" disabled={loading}>{loading ? "Saving..." : editTarget ? "Update Training" : "Add Training"}</Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
